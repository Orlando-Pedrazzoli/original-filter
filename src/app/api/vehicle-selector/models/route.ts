/* ══════════════════════════════════════════
   GET /api/vehicle-selector/models?brand=VOLVO
   ──────────────────────────────────────────
   Retorna modelos (ex: FH 440, FM 410, R 450) cadastrados nas
   applications dos produtos ativos da marca especificada,
   com contagem de produtos compatíveis.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import type { VehicleModelOption } from '@/lib/search-types';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const brand = req.nextUrl.searchParams.get('brand');
    if (!brand) {
      return NextResponse.json({ error: 'Parâmetro "brand" é obrigatório' }, { status: 400 });
    }

    const brandUpper = brand.trim().toUpperCase();

    const agg = await Product.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { status: 'active' } },
      { $unwind: '$applications' },
      {
        $match: {
          'applications.brand': brandUpper,
          'applications.model': { $exists: true, $ne: '' },
        },
      },
      { $group: { _id: '$applications.model', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 200 },
    ]);

    const models: VehicleModelOption[] = agg.map((a) => ({
      model: a._id,
      productCount: a.count,
    }));

    return NextResponse.json(
      { models },
      {
        headers: {
          'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        },
      },
    );
  } catch (err) {
    console.error('[vehicle-selector/models] error:', err);
    return NextResponse.json({ error: 'Erro ao carregar modelos' }, { status: 500 });
  }
}
