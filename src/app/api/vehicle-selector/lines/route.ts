/* ══════════════════════════════════════════
   GET /api/vehicle-selector/lines
   ──────────────────────────────────────────
   Retorna as 4 linhas (rodoviário, agrícola, máquinas pesadas, industrial)
   com contagem de marcas ativas em cada uma.
   Resposta cacheada por 1h (linhas e marcas mudam pouco).
   ══════════════════════════════════════════ */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Brand from '@/models/Brand';
import type { VehicleLine } from '@/lib/search-types';

const LINE_LABELS: Record<string, { label: string; description: string }> = {
  rodoviario: {
    label: 'Rodoviária',
    description: 'Caminhões, ônibus e veículos comerciais pesados',
  },
  agricola: {
    label: 'Agrícola',
    description: 'Tratores, colheitadeiras e implementos rurais',
  },
  'maquinas-pesadas': {
    label: 'Máquinas Pesadas',
    description: 'Escavadeiras, pás-carregadeiras e equipamentos de construção',
  },
  automotivo: {
    label: 'Automotivo',
    description: 'Linha leve e utilitários',
  },
  industrial: {
    label: 'Industrial',
    description: 'Motores estacionários, geradores e aplicações industriais',
  },
};

export async function GET() {
  try {
    await dbConnect();

    const aggregation = await Brand.aggregate<{
      _id: string;
      brandCount: number;
    }>([
      { $match: { isActive: true } },
      { $group: { _id: '$category', brandCount: { $sum: 1 } } },
      { $sort: { brandCount: -1 } },
    ]);

    const lines: VehicleLine[] = aggregation.map((a) => {
      const meta = LINE_LABELS[a._id] ?? {
        label: a._id,
        description: '',
      };
      return {
        slug: a._id as VehicleLine['slug'],
        label: meta.label,
        description: meta.description,
        brandCount: a.brandCount,
      };
    });

    return NextResponse.json(
      { lines },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      },
    );
  } catch (err) {
    console.error('[vehicle-selector/lines] error:', err);
    return NextResponse.json({ error: 'Erro ao carregar linhas de veículo' }, { status: 500 });
  }
}
