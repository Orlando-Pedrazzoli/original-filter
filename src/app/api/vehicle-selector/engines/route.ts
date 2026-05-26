/* ══════════════════════════════════════════
   GET /api/vehicle-selector/engines?brand=VOLVO&model=FH 440
   ──────────────────────────────────────────
   Retorna motores cadastrados para uma combinação marca + modelo
   (ex: D13A, DC09, OM906), com contagem de produtos compatíveis.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import type { VehicleEngineOption } from '@/lib/search-types';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const brand = req.nextUrl.searchParams.get('brand');
    const model = req.nextUrl.searchParams.get('model');

    if (!brand || !model) {
      return NextResponse.json(
        { error: 'Parâmetros "brand" e "model" são obrigatórios' },
        { status: 400 },
      );
    }

    const agg = await Product.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { status: 'active' } },
      { $unwind: '$applications' },
      {
        $match: {
          'applications.brand': brand.trim().toUpperCase(),
          'applications.model': model.trim(),
          'applications.engine': { $exists: true, $ne: '' },
        },
      },
      { $group: { _id: '$applications.engine', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 100 },
    ]);

    const engines: VehicleEngineOption[] = agg.map((a) => ({
      engine: a._id,
      productCount: a.count,
    }));

    return NextResponse.json(
      { engines },
      {
        headers: {
          'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        },
      },
    );
  } catch (err) {
    console.error('[vehicle-selector/engines] error:', err);
    return NextResponse.json({ error: 'Erro ao carregar motores' }, { status: 500 });
  }
}
