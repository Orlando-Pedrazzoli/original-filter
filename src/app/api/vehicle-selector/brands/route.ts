/* ══════════════════════════════════════════
   GET /api/vehicle-selector/brands?linha=rodoviario
   ──────────────────────────────────────────
   Retorna marcas (montadoras) de uma linha específica,
   com a contagem de produtos que tem aplicação para cada uma.
   Se ?linha não vier, retorna TODAS as marcas ativas.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Brand from '@/models/Brand';
import Product from '@/models/Product';
import type { VehicleBrandOption } from '@/lib/search-types';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const linha = req.nextUrl.searchParams.get('linha') ?? undefined;

    const brandFilter: Record<string, unknown> = { isActive: true };
    if (linha) brandFilter.category = linha;

    const brands = await Brand.find(brandFilter)
      .select('name slug category')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    if (brands.length === 0) {
      return NextResponse.json({ brands: [] });
    }

    // Conta produtos ativos por aplicação.brand (nome canônico)
    const productCounts = await Product.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { status: 'active' } },
      { $unwind: '$applications' },
      { $group: { _id: '$applications.brand', count: { $sum: 1 } } },
    ]);

    const countByBrand = new Map<string, number>();
    for (const c of productCounts) {
      countByBrand.set(c._id.toUpperCase(), c.count);
    }

    const result: VehicleBrandOption[] = brands
      .map((b) => ({
        slug: b.slug,
        name: b.name,
        productCount: countByBrand.get(b.name.toUpperCase()) ?? 0,
      }))
      .filter((b) => b.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount);

    return NextResponse.json(
      { brands: result },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      },
    );
  } catch (err) {
    console.error('[vehicle-selector/brands] error:', err);
    return NextResponse.json({ error: 'Erro ao carregar marcas' }, { status: 500 });
  }
}
