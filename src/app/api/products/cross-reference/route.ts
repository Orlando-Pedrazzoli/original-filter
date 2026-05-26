/* ══════════════════════════════════════════
   GET /api/products/cross-reference?code=W1170
   ──────────────────────────────────────────
   Busca produtos Original Filter equivalentes a um código externo
   (OEM da montadora, concorrente, ou nosso próprio SKU).

   ESTRATÉGIA DE MATCH (em ordem de prioridade):
   1. Match exato em `oemCodes[]` (quando populado pelo Gabriel)
   2. Match exato em `supersedes[]` (códigos antigos do Original Filter)
   3. Match exato em `sku`
   4. Match prefix em `sku` (sem suffix de variante)
   5. Match em `title` ou `description` (último recurso)

   Retorna `pendingOemData: true` quando o catálogo tem
   menos de 1% de produtos com oemCodes preenchidos.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import type { CrossRefMatch, CrossRefResponse, CrossRefSource } from '@/lib/search-types';

export const dynamic = 'force-dynamic';

const MAX_RESULTS = 10;

function normalizeCode(s: string): string {
  return s
    .trim()
    .toUpperCase()
    .replace(/[\s\-_./]+/g, '');
}

function isOriginalFilterSku(code: string): boolean {
  // Padrão OF + letra + dígitos (ex: OFA2023C, OFC1234E)
  return /^OF[A-Z]\d{3,5}[A-Z]{0,4}$/i.test(code);
}

interface DbDoc {
  sku: string;
  slug: string;
  title: string;
  productType: string;
  category: string;
  images?: Array<{ url: string }>;
  oemCodes?: string[];
}

function toMatch(
  doc: DbDoc,
  matchedCode: string,
  source: CrossRefSource,
  confidence: number,
): CrossRefMatch {
  return {
    product: {
      sku: doc.sku,
      slug: doc.slug,
      title: doc.title,
      image: doc.images?.[0]?.url ?? null,
      productType: doc.productType,
      category: doc.category,
    },
    source,
    matchedCode,
    confidence,
  };
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const raw = req.nextUrl.searchParams.get('code');
    if (!raw || raw.trim().length < 3) {
      return NextResponse.json(
        { error: 'Forneça um código com pelo menos 3 caracteres' },
        { status: 400 },
      );
    }

    const original = raw.trim();
    const normalized = normalizeCode(raw);

    // Verifica se o catálogo já tem dados de OEM populados (>1% dos produtos)
    const [withOem, total] = await Promise.all([
      Product.countDocuments({
        status: 'active',
        oemCodes: { $exists: true, $not: { $size: 0 } },
      }),
      Product.countDocuments({ status: 'active' }),
    ]);
    const pendingOemData = total > 0 && withOem / total < 0.01;

    const matches: CrossRefMatch[] = [];
    const seen = new Set<string>();

    function pushUnique(m: CrossRefMatch) {
      if (seen.has(m.product.sku)) return;
      seen.add(m.product.sku);
      matches.push(m);
    }

    // 1) Match exato em oemCodes (case-insensitive)
    const exactDocs = await Product.find({
      status: 'active',
      oemCodes: { $regex: `^${normalized}$`, $options: 'i' },
    })
      .select('sku slug title productType category images oemCodes')
      .limit(MAX_RESULTS)
      .lean<DbDoc[]>();

    for (const d of exactDocs) {
      pushUnique(toMatch(d, original, 'oem', 1.0));
    }

    // 2) Se for um SKU do Original Filter (OFx...), busca exato
    if (matches.length < MAX_RESULTS && isOriginalFilterSku(original)) {
      const own = await Product.findOne({
        status: 'active',
        sku: { $regex: `^${normalized}$`, $options: 'i' },
      })
        .select('sku slug title productType category images')
        .lean<DbDoc | null>();
      if (own) pushUnique(toMatch(own, original, 'original', 1.0));
    }

    // 3) Match parcial em SKU (prefix)
    if (matches.length < MAX_RESULTS) {
      const partial = await Product.find({
        status: 'active',
        sku: { $regex: `^${normalized}`, $options: 'i' },
      })
        .select('sku slug title productType category images')
        .limit(MAX_RESULTS - matches.length)
        .lean<DbDoc[]>();

      for (const d of partial) {
        pushUnique(toMatch(d, original, 'original', 0.7));
      }
    }

    // 4) Última tentativa: busca em title/description (textual)
    if (matches.length === 0 && normalized.length >= 4) {
      const txt = await Product.find({
        status: 'active',
        $or: [
          { title: { $regex: original, $options: 'i' } },
          { description: { $regex: original, $options: 'i' } },
        ],
      })
        .select('sku slug title productType category images')
        .limit(5)
        .lean<DbDoc[]>();

      for (const d of txt) {
        pushUnique(toMatch(d, original, 'unknown', 0.4));
      }
    }

    const response: CrossRefResponse = {
      query: original,
      matches,
      total: matches.length,
      ...(pendingOemData && { pendingOemData: true }),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[products/cross-reference] error:', err);
    return NextResponse.json({ error: 'Erro ao buscar equivalência' }, { status: 500 });
  }
}
