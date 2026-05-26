/* ══════════════════════════════════════════
   GET /api/products/by-vehicle?brand=VOLVO&model=FH 440&engine=D13A&year=2015
   ──────────────────────────────────────────
   Retorna todos os produtos ativos cuja `applications` cobre
   a combinação informada. Year é opcional e usa o range yearStart..yearEnd
   das aplicações (se yearEnd estiver vazio, considera o ano atual).
   Resposta agrupa por productType (filter/sensor/accessory) e
   por category, facilitando exibição estruturada.

   Formato dos itens é compatível com ProductCardData (mesmo da listagem geral)
   para permitir reuso do ProductCard.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { auth } from '@/lib/auth';
import type { PipelineStage } from 'mongoose';
import type { DiscountTier, UserRole } from '@/types';

export const dynamic = 'force-dynamic';

interface ProductListItem {
  sku: string;
  slug: string;
  title: string;
  category: string;
  productType: string;
  primaryImage: string | null;
  retailPrice: number;
  finalPrice: number;
  discountTier: DiscountTier;
  isPatented: boolean;
  isNewRelease: boolean;
  status: string;
  applicationsCount: number;
}

function applyDiscount(
  retailPrice: number,
  role: UserRole | 'guest',
  tier: DiscountTier,
): { finalPrice: number; appliedTier: DiscountTier } {
  if (role === 'reseller' && tier > 0) {
    const factor = 1 - tier / 100;
    return {
      finalPrice: Math.round(retailPrice * factor * 100) / 100,
      appliedTier: tier,
    };
  }
  return { finalPrice: retailPrice, appliedTier: 0 };
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();
    const role: UserRole | 'guest' = session?.user?.role ?? 'guest';
    const tier: DiscountTier = session?.user?.discountTier ?? 0;

    const sp = req.nextUrl.searchParams;
    const brand = sp.get('brand')?.trim().toUpperCase();
    const model = sp.get('model')?.trim();
    const engine = sp.get('engine')?.trim();
    const yearStr = sp.get('year');
    const year = yearStr ? Number.parseInt(yearStr, 10) : undefined;

    if (!brand) {
      return NextResponse.json({ error: 'Parâmetro "brand" é obrigatório' }, { status: 400 });
    }

    // Construir match progressivamente
    const appMatch: Record<string, unknown> = { 'applications.brand': brand };
    if (model) appMatch['applications.model'] = model;
    if (engine) appMatch['applications.engine'] = engine;

    if (year && Number.isFinite(year)) {
      appMatch.$and = [
        {
          $or: [
            { 'applications.yearStart': { $exists: false } },
            { 'applications.yearStart': { $lte: year } },
          ],
        },
        {
          $or: [
            { 'applications.yearEnd': { $exists: false } },
            { 'applications.yearEnd': { $gte: year } },
          ],
        },
      ];
    }

    const pipeline: PipelineStage[] = [
      { $match: { status: 'active' } },
      { $unwind: '$applications' },
      { $match: appMatch },
      {
        $group: {
          _id: '$_id',
          sku: { $first: '$sku' },
          slug: { $first: '$slug' },
          title: { $first: '$title' },
          category: { $first: '$category' },
          productType: { $first: '$productType' },
          images: { $first: '$images' },
          retailPrice: { $first: '$retailPrice' },
          isPatented: { $first: '$isPatented' },
          isNewRelease: { $first: '$isNewRelease' },
          status: { $first: '$status' },
          applications: { $first: '$applications' },
          allApplications: { $first: '$applications' },
        },
      },
      { $sort: { isPatented: -1, productType: 1, category: 1, sku: 1 } },
      { $limit: 200 },
    ];

    type GroupedDoc = {
      _id: unknown;
      sku: string;
      slug: string;
      title: string;
      category: string;
      productType: string;
      images?: Array<{ url: string; isPrimary?: boolean }>;
      retailPrice: number;
      isPatented: boolean;
      isNewRelease: boolean;
      status: string;
      allApplications?: unknown;
    };

    const docs = await Product.aggregate<GroupedDoc>(pipeline);

    // Para cada produto encontrado, busca o count total de applications dele
    // (não só as que bateram com o filtro)
    const ids = docs.map((d) => d._id as import('mongoose').Types.ObjectId);
    const counts = await Product.find({ _id: { $in: ids } })
      .select('_id applications')
      .lean<Array<{ _id: unknown; applications?: unknown[] }>>();

    const countById = new Map<string, number>();
    for (const c of counts) {
      countById.set(String(c._id), c.applications?.length ?? 0);
    }

    const items: ProductListItem[] = docs.map((d) => {
      const { finalPrice, appliedTier } = applyDiscount(d.retailPrice, role, tier);
      const primary = d.images?.find((img) => img.isPrimary)?.url ?? d.images?.[0]?.url ?? null;

      return {
        sku: d.sku,
        slug: d.slug,
        title: d.title,
        category: d.category,
        productType: d.productType,
        primaryImage: primary,
        retailPrice: d.retailPrice ?? 0,
        finalPrice,
        discountTier: appliedTier,
        isPatented: d.isPatented,
        isNewRelease: d.isNewRelease,
        status: d.status,
        applicationsCount: countById.get(String(d._id)) ?? 0,
      };
    });

    // Agrupar por categoria
    const byCategory: Record<string, ProductListItem[]> = {};
    for (const it of items) {
      (byCategory[it.category] ??= []).push(it);
    }

    // Agrupar por productType (para os KPIs)
    const byType: Record<string, number> = {};
    for (const it of items) {
      byType[it.productType] = (byType[it.productType] ?? 0) + 1;
    }

    return NextResponse.json({
      query: {
        brand,
        model: model ?? null,
        engine: engine ?? null,
        year: year ?? null,
      },
      total: items.length,
      items,
      byCategory,
      byType,
    });
  } catch (err) {
    console.error('[products/by-vehicle] error:', err);
    return NextResponse.json({ error: 'Erro ao buscar produtos por veículo' }, { status: 500 });
  }
}
