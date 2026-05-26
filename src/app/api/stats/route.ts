/* ══════════════════════════════════════════
   GET /api/stats
   ──────────────────────────────────────────
   Retorna métricas agregadas para exibir na home:
   - 372 produtos no catálogo
   - 2.016 aplicações estruturadas
   - 22 marcas
   - 8 patenteados
   - X categorias
   - 212 imagens

   Cacheado por 1h.
   ══════════════════════════════════════════ */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Brand from '@/models/Brand';
import type { CatalogStats } from '@/lib/search-types';

export async function GET() {
  try {
    await dbConnect();

    const [
      totalProducts,
      activeProducts,
      patentedProducts,
      productsWithImage,
      totalBrands,
      categoryAgg,
      applicationAgg,
    ] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ isPatented: true, status: 'active' }),
      Product.countDocuments({
        'images.0': { $exists: true },
        status: 'active',
      }),
      Brand.countDocuments({ isActive: true }),
      Product.aggregate<{ _id: string }>([
        { $match: { status: 'active' } },
        { $group: { _id: '$category' } },
      ]),
      Product.aggregate<{ total: number }>([
        { $match: { status: 'active' } },
        { $project: { count: { $size: { $ifNull: ['$applications', []] } } } },
        { $group: { _id: null, total: { $sum: '$count' } } },
      ]),
    ]);

    const stats: CatalogStats = {
      totalProducts,
      activeProducts,
      patentedProducts,
      productsWithImage,
      totalBrands,
      categoryCount: categoryAgg.length,
      totalApplications: applicationAgg[0]?.total ?? 0,
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (err) {
    console.error('[stats] error:', err);
    return NextResponse.json({ error: 'Erro ao carregar estatísticas' }, { status: 500 });
  }
}
