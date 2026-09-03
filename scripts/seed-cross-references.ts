// scripts/seed-cross-references.ts
/* ══════════════════════════════════════════
   Original Filter — Seeder de Referências Cruzadas
   ══════════════════════════════════════════
   Importa a planilha de referências do Gabriel
   (formato: Código do Produto | Descrição do Fabricante | Número Referência)
   para o campo crossReferences[] dos produtos existentes,
   e deriva oemCodes[] (códigos normalizados, únicos) para a
   rota /api/products/cross-reference funcionar de imediato.

   USO:
   1. Salve a planilha em: data/referencias.xlsx
      (ou passe outro caminho: npm run seed:crossref -- caminho/arquivo.xlsx)
   2. Execute: npm run seed:crossref

   COMPORTAMENTO:
   - Idempotente: crossReferences é recalculado por inteiro a partir
     da planilha a cada execução (fonte de verdade = planilha).
   - oemCodes: união do que já existe no banco com os novos códigos
     normalizados (padrão never-delete).
   - NUNCA cria nem apaga produtos: só atualiza SKUs já existentes.
   - Códigos da planilha sem produto correspondente no banco são
     reportados e gravados em scripts/crossref-orphans.json
     (são os ~2.780 produtos históricos fora do catálogo atual).
   - Marca 'Part Number' da planilha → exibida como 'NÚMERO ORIGINAL'.
   ══════════════════════════════════════════ */

import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';
import { existsSync, writeFileSync } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

import Product from '../src/models/Product';
import { normalizeCode } from '../src/lib/code-normalize';

// ─── Configuração ───
const DEFAULT_EXCEL = path.join(process.cwd(), 'data', 'referencias.xlsx');
const ORPHANS_OUT = path.join(process.cwd(), 'scripts', 'crossref-orphans.json');
const BATCH_SIZE = 200;

// Rótulos de marca a reescrever (planilha → exibição)
const BRAND_RELABEL: Record<string, string> = {
  'PART NUMBER': 'NÚMERO ORIGINAL',
};

interface CrossRef {
  brand: string;
  code: string;
  codeNormalized: string;
}

// ─── Parse da planilha ───
function parseSheet(filePath: string): Map<string, CrossRef[]> {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
    header: 1,
    defval: null,
  });

  const bySku = new Map<string, CrossRef[]>();
  let emptyRows = 0;

  // Linha 0 = cabeçalho
  for (let i = 1; i < rows.length; i++) {
    const [rawSku, rawBrand, rawRef] = rows[i];
    if (!rawSku || !rawBrand || !rawRef) {
      emptyRows++;
      continue;
    }

    const sku = String(rawSku).trim().toUpperCase();
    let brand = String(rawBrand).trim().toUpperCase().replace(/,+$/, '');
    brand = BRAND_RELABEL[brand] ?? brand;
    const code = String(rawRef).trim();

    if (!bySku.has(sku)) bySku.set(sku, []);
    bySku.get(sku)!.push({ brand, code, codeNormalized: normalizeCode(code) });
  }

  // Dedup por (brand, codeNormalized), preservando a primeira grafia
  let dups = 0;
  for (const [sku, refs] of bySku) {
    const seen = new Set<string>();
    const clean = refs.filter((r) => {
      const key = `${r.brand}|${r.codeNormalized}`;
      if (seen.has(key)) {
        dups++;
        return false;
      }
      seen.add(key);
      return true;
    });
    // Ordena por marca para exibição estável na página do produto
    clean.sort((a, b) => a.brand.localeCompare(b.brand) || a.code.localeCompare(b.code));
    bySku.set(sku, clean);
  }

  if (emptyRows > 0) console.log(`⚠️  ${emptyRows} linhas incompletas ignoradas`);
  if (dups > 0) console.log(`ℹ️  ${dups} referências duplicadas removidas`);

  return bySku;
}

// ─── Main ───
async function main() {
  const excelPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_EXCEL;

  if (!existsSync(excelPath)) {
    console.error(`❌ Planilha não encontrada: ${excelPath}`);
    console.error('   Salve o arquivo em data/referencias.xlsx ou passe o caminho como argumento.');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI ausente no .env.local');
    process.exit(1);
  }

  console.log(`📄 Lendo: ${excelPath}`);
  const bySku = parseSheet(excelPath);
  const totalRefs = [...bySku.values()].reduce((n, r) => n + r.length, 0);
  console.log(`   ${bySku.size} códigos OF | ${totalRefs} referências\n`);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('🔌 Conectado ao MongoDB\n');

  // SKUs existentes no banco (com oemCodes atuais para união never-delete)
  const existing = await Product.find({}, { sku: 1, oemCodes: 1 }).lean();
  const dbSkus = new Map(existing.map((p) => [p.sku, p.oemCodes ?? []]));
  console.log(`📦 ${dbSkus.size} produtos no banco`);

  // Particionar planilha: aplicáveis vs órfãos
  const orphans: string[] = [];
  const ops: mongoose.AnyBulkWriteOperation[] = [];
  let refsApplied = 0;

  for (const [sku, refs] of bySku) {
    if (!dbSkus.has(sku)) {
      orphans.push(sku);
      continue;
    }
    const currentOem = dbSkus.get(sku)!;
    const newOem = refs.map((r) => r.codeNormalized);
    const oemCodes = [...new Set([...currentOem, ...newOem])].sort();

    ops.push({
      updateOne: {
        filter: { sku },
        update: { $set: { crossReferences: refs, oemCodes } },
      },
    });
    refsApplied += refs.length;
  }

  // Executar em lotes
  let updated = 0;
  for (let i = 0; i < ops.length; i += BATCH_SIZE) {
    const slice = ops.slice(i, i + BATCH_SIZE);
    const res = await Product.bulkWrite(slice, { ordered: false });
    updated += res.modifiedCount + res.upsertedCount;
    process.stdout.write(`   lote ${Math.floor(i / BATCH_SIZE) + 1}: ${updated} atualizados\r`);
  }
  console.log('');

  // Relatório de órfãos (produtos históricos fora do catálogo atual)
  orphans.sort();
  writeFileSync(ORPHANS_OUT, JSON.stringify(orphans, null, 2));

  // Verificação final
  const withRefs = await Product.countDocuments({ 'crossReferences.0': { $exists: true } });

  console.log('\n══════════ RESULTADO ══════════');
  console.log(`✅ Produtos atualizados nesta execução: ${updated}`);
  console.log(`✅ Produtos com referências no banco:   ${withRefs}/${dbSkus.size}`);
  console.log(`✅ Referências aplicadas:               ${refsApplied}`);
  console.log(
    `ℹ️  Códigos da planilha sem produto:    ${orphans.length} → scripts/crossref-orphans.json`,
  );

  const missing = [...dbSkus.keys()].filter((s) => !bySku.has(s)).sort();
  if (missing.length > 0) {
    console.log(`⚠️  Produtos do banco SEM referências na planilha: ${missing.length}`);
    console.log(`   ${missing.join(', ')}`);
  }

  await mongoose.disconnect();
  console.log('\n🏁 Concluído.');
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
