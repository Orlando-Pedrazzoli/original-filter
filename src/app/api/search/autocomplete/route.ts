/* ══════════════════════════════════════════
   GET /api/search/autocomplete?q=OFA
   ──────────────────────────────────────────
   Retorna sugestões instantâneas categorizadas para o search bar
   da navbar. Otimizado para resposta <50ms.

   Tipos de sugestão (em ordem de prioridade):
   - "sku":      SKU exato ou prefixo
   - "product":  match em título do produto
   - "brand":    match em marca de montadora
   - "category": match em nome de categoria

   Limite: 8 sugestões totais (mix dos tipos).
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Brand from '@/models/Brand';
import type { AutocompleteResponse, AutocompleteSuggestion } from '@/lib/search-types';

export const dynamic = 'force-dynamic';

const MAX_TOTAL = 8;
const MIN_QUERY = 2;

interface ProductDoc {
  sku: string;
  slug: string;
  title: string;
  productType: string;
  category: string;
}

interface BrandDoc {
  name: string;
  slug: string;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
    if (q.length < MIN_QUERY) {
      return NextResponse.json({
        query: q,
        suggestions: [],
        total: 0,
      } satisfies AutocompleteResponse);
    }

    const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const skuRegex = new RegExp(`^${safeQuery}`, 'i');
    const wordRegex = new RegExp(safeQuery, 'i');

    // Buscar em paralelo: SKUs (prefix), produtos por título, marcas
    const [bySku, byTitle, byBrand] = await Promise.all([
      Product.find({
        status: 'active',
        sku: { $regex: skuRegex },
      })
        .select('sku slug title productType category')
        .limit(5)
        .lean<ProductDoc[]>(),

      Product.find({
        status: 'active',
        title: { $regex: wordRegex },
      })
        .select('sku slug title productType category')
        .limit(5)
        .lean<ProductDoc[]>(),

      Brand.find({
        isActive: true,
        name: { $regex: wordRegex },
      })
        .select('name slug')
        .limit(3)
        .lean<BrandDoc[]>(),
    ]);

    const suggestions: AutocompleteSuggestion[] = [];
    const seenSkus = new Set<string>();

    // 1) SKU matches (prioridade máxima)
    for (const p of bySku) {
      if (seenSkus.has(p.sku)) continue;
      seenSkus.add(p.sku);
      suggestions.push({
        kind: 'sku',
        label: p.sku,
        href: `/produtos/${p.slug}`,
        caption:
          p.title
            .replace(p.sku, '')
            .replace(/^\s*-\s*/, '')
            .trim() || undefined,
        sku: p.sku,
      });
      if (suggestions.length >= MAX_TOTAL) break;
    }

    // 2) Title matches (não-duplicados)
    for (const p of byTitle) {
      if (suggestions.length >= MAX_TOTAL) break;
      if (seenSkus.has(p.sku)) continue;
      seenSkus.add(p.sku);
      suggestions.push({
        kind: 'product',
        label: p.title,
        href: `/produtos/${p.slug}`,
        caption: p.sku,
        sku: p.sku,
      });
    }

    // 3) Marcas
    for (const b of byBrand) {
      if (suggestions.length >= MAX_TOTAL) break;
      suggestions.push({
        kind: 'brand',
        label: b.name,
        href: `/produtos/marca/${b.slug}`,
        caption: 'Ver todos os produtos',
      });
    }

    return NextResponse.json({
      query: q,
      suggestions,
      total: suggestions.length,
    } satisfies AutocompleteResponse);
  } catch (err) {
    console.error('[search/autocomplete] error:', err);
    return NextResponse.json({ error: 'Erro ao buscar sugestões' }, { status: 500 });
  }
}
