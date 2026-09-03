// src/app/api/products/route.ts
/* ══════════════════════════════════════════
   Original Filter — API /api/products
   ══════════════════════════════════════════
   GET: lista produtos com filtros, paginação e cálculo de preço
        server-side conforme role do usuário logado.
   
   QUERY PARAMS:
   - q                : busca textual (SKU, título, OEM)
   - tipo             : filter | sensor | accessory
   - categoria        : slug da categoria
   - marca            : slug da brand
   - linha            : slug da linha de veículo (rodoviario, agricola, etc.)
                        filtra produtos que tem aplicação para marcas dessa linha
   - aplicacao_marca  : filtra por applications.brand (ex: VOLVO)
   - aplicacao_modelo : filtra por applications.model
   - status           : active | inactive | discontinued (default: active)
   - lancamento       : true → só isNewRelease
   - destaque         : true → só isFeatured
   - patenteado       : true → só isPatented
   - sort             : preco-asc | preco-desc | recente | sku
   - page             : 1+
   - limit            : 1-100 (default 24)
   
   REGRA CRÍTICA DE SEGURANÇA:
   Preço final é SEMPRE calculado no servidor a partir do role da sessão.
   Cliente final (retail/visitante) vê retailPrice.
   Reseller logado vê retailPrice × (1 - discountTier/100).
   ══════════════════════════════════════════ */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { auth } from '@/lib/auth';
import { normalizeCode } from '@/lib/code-normalize';
import { PAGINATION } from '@/lib/constants';
import type { DiscountTier, UserRole } from '@/types';

export const dynamic = 'force-dynamic';

interface ProductListItem {
  id: string;
  sku: string;
  slug: string;
  productType: string;
  category: string;
  title: string;
  shortDescription?: string;
  retailPrice: number;
  finalPrice: number;
  discountTier: DiscountTier;
  appliedRole: UserRole | 'guest';
  weight: number;
  primaryImage: string | null;
  isPatented: boolean;
  isNewRelease: boolean;
  isFeatured: boolean;
  status: string;
  applicationsCount: number;
}

function applyDiscount(
  retailPrice: number,
  role: UserRole | 'guest',
  discountTier: DiscountTier,
): { finalPrice: number; appliedTier: DiscountTier } {
  if (role === 'reseller' && discountTier > 0) {
    const factor = 1 - discountTier / 100;
    return {
      finalPrice: Math.round(retailPrice * factor * 100) / 100,
      appliedTier: discountTier,
    };
  }
  return { finalPrice: retailPrice, appliedTier: 0 };
}

function parseSort(sort: string | null): Record<string, 1 | -1> {
  switch (sort) {
    case 'preco-asc':
      return { retailPrice: 1 };
    case 'preco-desc':
      return { retailPrice: -1 };
    case 'sku':
      return { sku: 1 };
    case 'recente':
    default:
      return { createdAt: -1 };
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();
    const role: UserRole | 'guest' = session?.user?.role ?? 'guest';
    const discountTier: DiscountTier = session?.user?.discountTier ?? 0;

    const sp = req.nextUrl.searchParams;

    const q = sp.get('q')?.trim();
    const tipo = sp.get('tipo');
    const categoria = sp.get('categoria');
    const marca = sp.get('marca');
    const linha = sp.get('linha');
    const aplicacaoMarca = sp.get('aplicacao_marca')?.toUpperCase();
    const aplicacaoModelo = sp.get('aplicacao_modelo');
    const status = sp.get('status') ?? 'active';
    const lancamento = sp.get('lancamento') === 'true';
    const destaque = sp.get('destaque') === 'true';
    const patenteado = sp.get('patenteado') === 'true';
    const sort = sp.get('sort');

    const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10));
    const limit = Math.min(
      PAGINATION.maxLimit,
      Math.max(1, parseInt(sp.get('limit') ?? String(PAGINATION.defaultLimit), 10)),
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (status && status !== 'all') filter.status = status;
    if (tipo) filter.productType = tipo;
    if (categoria) filter.category = categoria;
    if (lancamento) filter.isNewRelease = true;
    if (destaque) filter.isFeatured = true;
    if (patenteado) filter.isPatented = true;

    if (marca) {
      // marca é slug → resolver para ObjectId
      const Brand = (await import('@/models/Brand')).default;
      const brandDoc = await Brand.findOne({ slug: marca }).select('_id');
      if (brandDoc) filter.brand = brandDoc._id;
      else return NextResponse.json({ items: [], total: 0, page, limit });
    }

    if (linha) {
      // linha é a category de Brand. Pega todos os nomes de marcas dessa linha
      // e filtra produtos que tenham applications.brand ∈ esses nomes.
      const Brand = (await import('@/models/Brand')).default;
      const brandsInLine = await Brand.find({
        category: linha as never,
        isActive: true,
      })
        .select('name')
        .lean<Array<{ name: string }>>();

      if (brandsInLine.length === 0) {
        return NextResponse.json({ items: [], total: 0, page, limit, pages: 0 });
      }

      const brandNames = brandsInLine.map((b) => b.name.toUpperCase());
      filter['applications.brand'] = { $in: brandNames };
    }

    if (aplicacaoMarca) filter['applications.brand'] = aplicacaoMarca;
    if (aplicacaoModelo) {
      filter['applications.model'] = { $regex: aplicacaoModelo, $options: 'i' };
    }

    // Busca textual
    if (q) {
      const nq = normalizeCode(q);

      if (/^OF[A-Z]\d/.test(nq)) {
        // SKU Original Filter — aceita grafias com espaços/hífens (ofa-2023-c)
        filter.sku = { $in: [q.toUpperCase(), nq] };
      } else if (/^[A-Z0-9]{3,}$/.test(nq)) {
        // Pode ser código de concorrente/OEM (ff-5863, W 1170, PU10022Z...)
        // Tenta o match cruzado primeiro; se nada, cai na busca textual.
        const oemHits = await Product.countDocuments({ ...filter, oemCodes: nq });
        if (oemHits > 0) {
          filter.oemCodes = nq;
        } else {
          filter.$text = { $search: q };
        }
      } else {
        filter.$text = { $search: q };
      }
    }

    const sortObj = parseSort(sort);

    const [docs, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const items: ProductListItem[] = docs.map((p) => {
      const primary = p.images?.find((img) => img.isPrimary) ?? p.images?.[0];
      const { finalPrice, appliedTier } = applyDiscount(p.retailPrice, role, discountTier);

      return {
        id: p._id.toString(),
        sku: p.sku,
        slug: p.slug,
        productType: p.productType,
        category: p.category,
        title: p.title,
        shortDescription: p.shortDescription,
        retailPrice: p.retailPrice,
        finalPrice,
        discountTier: appliedTier,
        appliedRole: role,
        weight: p.weight,
        primaryImage: primary?.url ?? null,
        isPatented: p.isPatented,
        isNewRelease: p.isNewRelease,
        isFeatured: p.isFeatured,
        status: p.status,
        applicationsCount: p.applications?.length ?? 0,
      };
    });

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('GET /api/products error:', err);
    return NextResponse.json({ error: 'Falha ao listar produtos' }, { status: 500 });
  }
}
