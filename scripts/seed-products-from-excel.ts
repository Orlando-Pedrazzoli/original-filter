/* ══════════════════════════════════════════
   Original Filter — Seeder do Catálogo (v2)
   ══════════════════════════════════════════
   Autocontido. NÃO depende de arquivo Excel externo.
   Os dados estão em scripts/products-seed.json.
   
   USO:
   npm run seed:catalog
   
   ATALHOS:
   - Rodar limpando antes: SEED_RESET=1 npm run seed:catalog
   
   O QUE FAZ:
   1. Conecta no MongoDB usando .env.local
   2. Cria/atualiza 22 brands
   3. Lê products-seed.json (375 produtos: 329 ativos + 46 descontinuados)
   4. Faz upsert por SKU (idempotente — pode rodar várias vezes)
   5. Resolve replacedBy depois de inserir todos
   6. Reporta estatísticas finais
   ══════════════════════════════════════════ */

import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import path from 'path';

import Brand from '../src/models/Brand';
import Product from '../src/models/Product';
import { slugify } from '../src/lib/product-parser';
import { TRANSPORT_BRANDS, HEAVY_BRANDS } from '../src/lib/constants';
import type { ProductApplication } from '../src/types';

// ─── Tipo dos dados embutidos ───
interface SeedProduct {
  sku: string;
  title: string;
  description: string;
  productType: 'filter' | 'sensor' | 'accessory';
  category: string;
  retailPrice: number;
  weight: number;
  height: number;
  width: number;
  depth: number;
  applications: ProductApplication[];
  status: 'active' | 'inactive' | 'discontinued';
  isPatented: boolean;
  replacedBy?: string | null;
}

// ─── Carregar dados embutidos ───
const SEED_FILE = path.join(__dirname, 'products-seed.json');

let SEED_DATA: SeedProduct[];
try {
  SEED_DATA = JSON.parse(readFileSync(SEED_FILE, 'utf-8'));
} catch (err) {
  console.error(`❌ Não foi possível ler ${SEED_FILE}`);
  console.error('   Certifique-se de que o arquivo products-seed.json existe na pasta scripts/');
  console.error(`   Erro: ${(err as Error).message}`);
  process.exit(1);
}

// ─── Brands a criar ───
const BRAND_NAME_TO_SLUG: Record<string, string> = {
  'MERCEDES-BENZ': 'mercedes-benz',
  'MERCEDES BENZ': 'mercedes-benz',
  VOLKSWAGEN: 'volkswagen',
  VOLVO: 'volvo',
  SCANIA: 'scania',
  DAF: 'daf',
  FORD: 'ford',
  IVECO: 'iveco',
  MAN: 'man',
  AGRALE: 'agrale',
  CATERPILLAR: 'caterpillar',
  CASE: 'case',
  'NEW HOLLAND': 'new-holland',
  'JOHN DEERE': 'john-deere',
  KOMATSU: 'komatsu',
  JCB: 'jcb',
  'MASSEY FERGUSON': 'massey-ferguson',
  VALTRA: 'valtra',
  MITSUBISHI: 'mitsubishi',
  CUMMINS: 'cummins',
  PERKINS: 'perkins',
  MWM: 'mwm',
  BOSCH: 'bosch',
};

async function seedBrands() {
  console.log('🏭 Seeding brands...');

  const all = [
    ...TRANSPORT_BRANDS.map((b, i) => ({
      name: b.name,
      slug: b.slug,
      category: 'rodoviario' as const,
      displayOrder: i,
    })),
    ...HEAVY_BRANDS.map((b, i) => ({
      name: b.name,
      slug: b.slug,
      category: 'maquinas-pesadas' as const,
      displayOrder: 100 + i,
    })),
    { name: 'Mitsubishi', slug: 'mitsubishi', category: 'automotivo' as const, displayOrder: 200 },
    { name: 'Cummins', slug: 'cummins', category: 'industrial' as const, displayOrder: 300 },
    { name: 'Perkins', slug: 'perkins', category: 'industrial' as const, displayOrder: 301 },
    { name: 'MWM', slug: 'mwm', category: 'industrial' as const, displayOrder: 302 },
    { name: 'Bosch', slug: 'bosch', category: 'industrial' as const, displayOrder: 303 },
  ];

  for (const b of all) {
    await Brand.findOneAndUpdate(
      { slug: b.slug },
      { ...b, isActive: true },
      { upsert: true, returnDocument: 'after' },
    );
  }

  console.log(`✓ ${all.length} brands upserted\n`);
}

async function seedProducts() {
  console.log(`📦 Seeding products (${SEED_DATA.length} no JSON)...\n`);

  // Mapa slug→ObjectId das brands para FK
  const brands = await Brand.find({}).lean();
  const brandBySlug = new Map(brands.map((b) => [b.slug, b._id]));

  function brandRefFromApplications(apps: ProductApplication[]) {
    if (!apps.length) return undefined;
    const counts = new Map<string, number>();
    for (const a of apps) {
      counts.set(a.brand, (counts.get(a.brand) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!top) return undefined;
    const slug = BRAND_NAME_TO_SLUG[top];
    return slug ? brandBySlug.get(slug) : undefined;
  }

  let upserted = 0;
  let withApps = 0;
  let withoutApps = 0;
  const errors: Array<{ sku: string; error: string }> = [];

  for (const p of SEED_DATA) {
    try {
      if (p.applications?.length) withApps++;
      else withoutApps++;

      const slug = slugify(`${p.title} ${p.sku}`);

      await Product.findOneAndUpdate(
        { sku: p.sku },
        {
          sku: p.sku,
          slug,
          productType: p.productType,
          category: p.category,
          brand: brandRefFromApplications(p.applications),
          title: p.title,
          description: p.description,
          retailPrice: p.retailPrice,
          weight: p.weight,
          dimensions: { height: p.height, width: p.width, depth: p.depth },
          applications: p.applications ?? [],
          oemCodes: [],
          supersedes: [],
          status: p.status,
          isPatented: p.isPatented,
          isNewRelease: false,
          isFeatured: false,
          images: [],
          stock: 0,
          lowStockThreshold: 5,
          manageStock: false,
          seo: {
            title: `${p.title} | Original Filter`,
            description: p.description.slice(0, 160),
            keywords: [p.sku, ...(p.applications ?? []).slice(0, 5).map((a) => a.brand)],
          },
          viewCount: 0,
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      );

      upserted++;
    } catch (err) {
      errors.push({ sku: p.sku, error: (err as Error).message });
    }
  }

  console.log(`✓ ${upserted} produtos upserted`);
  console.log(
    `✓ ${withApps} com aplicações (${((withApps / SEED_DATA.length) * 100).toFixed(1)}%)`,
  );
  console.log(`✓ ${withoutApps} sem aplicações`);

  if (errors.length) {
    console.log(`\n⚠️  ${errors.length} erros:`);
    errors.slice(0, 10).forEach((e) => console.log(`   ${e.sku}: ${e.error}`));
  }

  // ─── Resolver replacedBy ───
  const withReplaced = SEED_DATA.filter((p) => p.replacedBy);
  if (withReplaced.length) {
    console.log(`\n🔗 Resolvendo ${withReplaced.length} replacedBy...`);
    let resolved = 0;
    for (const p of withReplaced) {
      if (!p.replacedBy) continue;
      const newDoc = await Product.findOne({ sku: p.replacedBy }).select('_id');
      if (newDoc) {
        await Product.findOneAndUpdate(
          { sku: p.sku },
          { replacedBy: newDoc._id },
          { returnDocument: 'after' },
        );
        resolved++;
      }
    }
    console.log(`✓ ${resolved}/${withReplaced.length} resolvidos`);
  }

  return upserted;
}

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI não definida no .env.local');
    process.exit(1);
  }

  console.log('🔌 Conectando ao MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Conectado\n');

  // Reset opcional
  if (process.env.SEED_RESET === '1') {
    console.log('🗑️  SEED_RESET=1 detectado. Limpando produtos e brands...');
    await Product.deleteMany({});
    await Brand.deleteMany({});
    console.log('✓ Coleções limpas\n');
  }

  try {
    await seedBrands();
    const total = await seedProducts();

    // Stats finais
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          discontinued: { $sum: { $cond: [{ $eq: ['$status', 'discontinued'] }, 1, 0] } },
          patented: { $sum: { $cond: ['$isPatented', 1, 0] } },
          sensors: { $sum: { $cond: [{ $eq: ['$productType', 'sensor'] }, 1, 0] } },
          accessories: { $sum: { $cond: [{ $eq: ['$productType', 'accessory'] }, 1, 0] } },
        },
      },
    ]);

    if (stats.length) {
      const s = stats[0];
      console.log(`\n📊 Estado final do catálogo:`);
      console.log(`   Total no banco:  ${s.total}`);
      console.log(`   Ativos:          ${s.active}`);
      console.log(`   Descontinuados:  ${s.discontinued}`);
      console.log(`   Patenteados:     ${s.patented}`);
      console.log(`   Sensores:        ${s.sensors}`);
      console.log(`   Acessórios:      ${s.accessories}`);
    }

    console.log(`\n✅ Seed concluído. ${total} produtos processados.\n`);
  } catch (err) {
    console.error('\n❌ Erro durante seed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
