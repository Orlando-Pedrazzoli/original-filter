/* ══════════════════════════════════════════
   Original Filter — Parser de Aplicações
   ══════════════════════════════════════════
   Converte texto livre da coluna DESCRIÇÃO_PLATAFORMA em
   array estruturado de ProductApplication.
   
   Cobertura validada: ~78% dos 321 produtos do Excel real.
   O restante fica para o admin editar manualmente.
   ══════════════════════════════════════════ */

import type { ProductApplication } from '@/types';

// Aliases de marca para normalização
const BRAND_ALIASES: Record<string, string> = {
  MB: 'MERCEDES-BENZ',
  'MERCEDES BENZ': 'MERCEDES-BENZ',
  MERCEDESBENZ: 'MERCEDES-BENZ',
  VW: 'VOLKSWAGEN',
};

// Marcas reconhecidas (ordenadas por tamanho para regex não-ambíguo)
const KNOWN_BRANDS = [
  'MERCEDES-BENZ',
  'MERCEDES BENZ',
  'VOLKSWAGEN',
  'CATERPILLAR',
  'NEW HOLLAND',
  'JOHN DEERE',
  'MASSEY FERGUSON',
  'MITSUBISHI',
  'CUMMINS',
  'PERKINS',
  'AGRALE',
  'SCANIA',
  'KOMATSU',
  'VOLVO',
  'IVECO',
  'CASE',
  'VALTRA',
  'BOSCH',
  'FORD',
  'DAF',
  'JCB',
  'MAN',
  'MWM',
  'MB',
  'VW',
].sort((a, b) => b.length - a.length);

function normalizeBrand(b: string): string {
  const upper = b.trim().toUpperCase();
  return BRAND_ALIASES[upper] ?? upper;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parse de string de ano: "2012", "2012>", "2012>2018", "01/11>12/11", "2018 >"
 * Retorna [yearStart, yearEnd] (yearEnd null = "ainda em produção")
 */
function parseYear(s: string | undefined): {
  yearStart?: number;
  yearEnd?: number;
} {
  if (!s) return {};
  const str = s.trim();

  // Padrão DD/YY > DD/YY
  let m = str.match(/^(\d{1,2})\/(\d{2})\s*>?\s*(\d{1,2})?\/?(\d{2})?$/);
  if (m) {
    const y2 = (y: string) => {
      const n = parseInt(y, 10);
      return n < 50 ? 2000 + n : 1900 + n;
    };
    const ys = y2(m[2]);
    const ye = m[4] ? y2(m[4]) : undefined;
    return { yearStart: ys, yearEnd: ye };
  }

  // Padrão YYYY > YYYY ou YYYY >
  m = str.match(/^(\d{4})\s*>\s*(\d{4})?$/);
  if (m) {
    return {
      yearStart: parseInt(m[1], 10),
      yearEnd: m[2] ? parseInt(m[2], 10) : undefined,
    };
  }

  // Padrão YYYY simples
  m = str.match(/^(\d{4})$/);
  if (m) {
    return { yearStart: parseInt(m[1], 10) };
  }

  return {};
}

export function parseApplications(description: string): ProductApplication[] {
  if (!description || typeof description !== 'string') return [];

  const apps: ProductApplication[] = [];

  // Padrão: " / MARCA : " ou " ; MARCA : " ou início + "MARCA : " ou "MARCA - "
  const brandList = KNOWN_BRANDS.map(escapeRegex).join('|');
  const blockStartPattern = new RegExp(
    `(?:^|\\s\\/\\s|\\s;\\s)((?:${brandList})\\s*[:\\-]\\s)`,
    'gi',
  );

  const matches: Array<{ start: number; end: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = blockStartPattern.exec(description)) !== null) {
    matches.push({ start: match.index + match[0].indexOf(match[1]), end: 0 });
  }

  for (let i = 0; i < matches.length; i++) {
    matches[i].end = i + 1 < matches.length ? matches[i + 1].start : description.length;
  }

  for (const { start, end } of matches) {
    const block = description
      .slice(start, end)
      .trim()
      .replace(/[\s/;]+$/, '');

    // Extrair marca antes de : ou -
    const bm = block.match(/^([A-Z\-\s]+?)\s*[:\-]\s*(.*)$/i);
    if (!bm) continue;

    const brand = normalizeBrand(bm[1]);
    const rest = bm[2].trim();

    // Sub-blocos separados por " / " seguido de letra/dígito (não data como 01/11)
    const subBlocks = rest.split(/\s+\/\s+(?=[A-Z0-9])/i);

    for (const sbRaw of subBlocks) {
      const sb = sbRaw.trim().replace(/[\s/;]+$/, '');
      if (!sb) continue;

      // Partes separadas por " - "
      const parts = sb.split(' - ').map((p) => p.trim());
      const modelsStr = parts[0];
      let engine: string | undefined;
      let yearStr: string | undefined;

      for (const p of parts.slice(1)) {
        if (/motor/i.test(p)) {
          engine = p.replace(/^motor:?\s*/i, '').trim();
        } else if (/\d/.test(p)) {
          yearStr = p;
        }
      }

      const { yearStart, yearEnd } = parseYear(yearStr);

      // Múltiplos modelos separados por vírgula
      const models = modelsStr
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);

      for (const model of models) {
        const app: ProductApplication = { brand, model };
        if (engine) app.engine = engine;
        if (yearStart) app.yearStart = yearStart;
        if (yearEnd) app.yearEnd = yearEnd;
        apps.push(app);
      }
    }
  }

  return apps;
}

/**
 * Determina productType e categoria padrão a partir do prefixo do SKU.
 * Baseado em análise estatística do catálogo real (321 produtos).
 */
export function inferProductTypeFromSku(sku: string): {
  productType: 'filter' | 'sensor' | 'accessory';
  defaultCategory: string;
} {
  const prefix = sku.slice(0, 3).toUpperCase();
  switch (prefix) {
    case 'OFA':
      return { productType: 'filter', defaultCategory: 'filtro-de-ar' };
    case 'OFC':
      return { productType: 'filter', defaultCategory: 'filtro-de-combustivel' };
    case 'OFD':
      return { productType: 'filter', defaultCategory: 'filtro-secador-de-ar' };
    case 'OFH':
      return { productType: 'filter', defaultCategory: 'filtro-hidraulico' };
    case 'OFL':
      return { productType: 'filter', defaultCategory: 'filtro-de-oleo' };
    case 'OFN':
      return { productType: 'sensor', defaultCategory: 'sensor-nox' };
    case 'OFR':
      return { productType: 'filter', defaultCategory: 'filtro-freio-retarder' };
    case 'OFT':
      return { productType: 'accessory', defaultCategory: 'reparo' };
    case 'OFU':
      return { productType: 'filter', defaultCategory: 'filtro-de-ureia' };
    case 'OFV':
      return { productType: 'accessory', defaultCategory: 'valvula-dosadora-arla' };
    case 'OFW':
      return { productType: 'filter', defaultCategory: 'filtro-de-agua' };
    default:
      return { productType: 'filter', defaultCategory: 'filtro-de-ar' };
  }
}

/**
 * Gera slug URL-amigável a partir de texto.
 * Remove acentos, converte para minúsculas, espaços viram hífens.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
