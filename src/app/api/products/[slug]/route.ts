/* ══════════════════════════════════════════
   Original Filter — API /api/products/[slug]
   ══════════════════════════════════════════
   GET: detalhe completo do produto + produto substituto (se descontinuado)
   Incrementa viewCount (fire-and-forget).
   ══════════════════════════════════════════ */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Brand from '@/models/Brand';
import { auth } from '@/lib/auth';
import type { DiscountTier, UserRole } from '@/types';

export const dynamic = 'force-dynamic';

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await dbConnect();
    const session = await auth();
    const role: UserRole | 'guest' = session?.user?.role ?? 'guest';
    const tier: DiscountTier = session?.user?.discountTier ?? 0;

    const { slug } = await params;

    const product = await Product.findOne({ slug })
      .populate('brand', 'name slug logo category')
      .populate('replacedBy', 'sku slug title')
      .lean();

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const { finalPrice, appliedTier } = applyDiscount(product.retailPrice, role, tier);

    // Fire-and-forget: incrementa view
    Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } }).catch((e) =>
      console.error('viewCount inc fail:', e),
    );

    // Toca em Brand model para registrar o schema (evita warning de populate)
    void Brand;

    return NextResponse.json({
      ...product,
      id: product._id.toString(),
      finalPrice,
      appliedDiscountTier: appliedTier,
      appliedRole: role,
    });
  } catch (err) {
    console.error('GET /api/products/[slug] error:', err);
    return NextResponse.json({ error: 'Falha ao buscar produto' }, { status: 500 });
  }
}
