/* ══════════════════════════════════════════
   /api/admin/products
   ══════════════════════════════════════════
   GET  → lista paginada com filtros e busca
   POST → criar novo produto

   Segurança: NextAuth + role 'admin' obrigatório.

   Query params do GET:
   - q          (busca por sku, title, oemCodes)
   - status     (active | inactive | discontinued)
   - productType (filter | sensor | accessory)
   - hasImage   (true | false)
   - sort       (sku | title | updatedAt | createdAt) — padrão updatedAt
   - order      (asc | desc) — padrão desc
   - page       (1..) — padrão 1
   - limit      (1..100) — padrão 25
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ─── Helpers ───
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) };
  }
  if (session.user.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Acesso restrito' }, { status: 403 }) };
  }
  return { session };
}

// ══════════════════════════════════════════
// GET — Lista paginada
// ══════════════════════════════════════════
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get('q')?.trim() || '';
    const status = sp.get('status') || '';
    const productType = sp.get('productType') || '';
    const hasImage = sp.get('hasImage') || '';
    const sort = sp.get('sort') || 'updatedAt';
    const order = (sp.get('order') === 'asc' ? 1 : -1) as 1 | -1;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '25', 10)));

    await dbConnect();

    // Filtros
    const filter: Record<string, unknown> = {};

    if (status && ['active', 'inactive', 'discontinued'].includes(status)) {
      filter.status = status;
    }
    if (productType && ['filter', 'sensor', 'accessory'].includes(productType)) {
      filter.productType = productType;
    }
    if (hasImage === 'true') {
      filter['images.0'] = { $exists: true };
    } else if (hasImage === 'false') {
      filter.$or = [{ images: { $size: 0 } }, { images: { $exists: false } }];
    }

    // Busca: tenta em sku, title e oemCodes
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const orConditions = [{ sku: regex }, { title: regex }, { oemCodes: regex }];
      if (Array.isArray(filter.$or)) {
        // Combina com filtro existente (hasImage=false)
        filter.$and = [{ $or: filter.$or }, { $or: orConditions }];
        delete filter.$or;
      } else {
        filter.$or = orConditions;
      }
    }

    // Ordenação válida
    const validSort = ['sku', 'title', 'updatedAt', 'createdAt', 'retailPrice', 'stock'];
    const sortField = validSort.includes(sort) ? sort : 'updatedAt';
    const sortObj: Record<string, 1 | -1> = { [sortField]: order };

    const [items, total] = await Promise.all([
      Product.find(filter)
        .select(
          'sku slug title productType category status retailPrice stock images isNewRelease isPatented isFeatured updatedAt',
        )
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Mapear para formato leve
    const rows = items.map((p) => ({
      slug: p.slug,
      sku: p.sku,
      title: p.title,
      productType: p.productType ?? 'filter',
      category: p.category ?? '',
      status: p.status,
      retailPrice: p.retailPrice ?? 0,
      stock: p.stock ?? 0,
      primaryImage: p.images?.find((i) => i.isPrimary)?.url ?? p.images?.[0]?.url ?? null,
      hasImage: (p.images?.length ?? 0) > 0,
      isNewRelease: p.isNewRelease ?? false,
      isPatented: p.isPatented ?? false,
      isFeatured: p.isFeatured ?? false,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({
      items: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: { q, status, productType, hasImage, sort, order: order === 1 ? 'asc' : 'desc' },
    });
  } catch (err) {
    console.error('[admin/products GET] error:', err);
    return NextResponse.json({ error: 'Erro ao listar produtos' }, { status: 500 });
  }
}

// ══════════════════════════════════════════
// POST — Criar novo produto
// ══════════════════════════════════════════
const CreateProductSchema = z.object({
  sku: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z0-9-_./]+$/, 'SKU inválido'),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Slug deve ter apenas letras minúsculas, números e hífens'),
  title: z.string().min(3).max(200),
  description: z.string().min(0).max(5000).default(''),
  shortDescription: z.string().max(280).optional(),
  productType: z.enum(['filter', 'sensor', 'accessory']),
  category: z.string().max(100).default(''),
  retailPrice: z.number().min(0).default(0),
  weight: z.number().min(0).default(1),
  dimensions: z
    .object({
      height: z.number().min(0).default(1),
      width: z.number().min(0).default(1),
      depth: z.number().min(0).default(1),
    })
    .default({ height: 1, width: 1, depth: 1 }),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
  isNewRelease: z.boolean().default(false),
  isPatented: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  manageStock: z.boolean().default(false),
  oemCodes: z.array(z.string()).default([]),
  applications: z
    .array(
      z.object({
        brand: z.string(),
        model: z.string(),
        engine: z.string().optional(),
        yearStart: z.number().int().min(1950).max(2100).optional(),
        yearEnd: z.number().int().min(1950).max(2100).optional(),
      }),
    )
    .default([]),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .default([]),
  seo: z
    .object({
      title: z.string().max(200).optional(),
      description: z.string().max(300).optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json();
    const parsed = CreateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }

    await dbConnect();

    // Verificar unicidade de SKU e slug
    const existing = await Product.findOne({
      $or: [{ sku: parsed.data.sku }, { slug: parsed.data.slug }],
    });
    if (existing) {
      const conflictField = existing.sku === parsed.data.sku ? 'SKU' : 'slug';
      return NextResponse.json(
        { error: `${conflictField} já existe`, conflictField },
        { status: 409 },
      );
    }

    const product = await Product.create(parsed.data);

    console.log(
      `[admin/products POST] ${guard.session.user.email} created product ${product.sku} (${product.slug})`,
    );

    return NextResponse.json(
      {
        success: true,
        product: {
          slug: product.slug,
          sku: product.sku,
          _id: product._id.toString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[admin/products POST] error:', err);
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}
