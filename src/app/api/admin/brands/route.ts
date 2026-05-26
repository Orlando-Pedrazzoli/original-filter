/* ══════════════════════════════════════════
   /api/admin/brands
   ══════════════════════════════════════════
   GET  → lista paginada com filtros
   POST → criar nova marca

   Segurança: NextAuth + role 'admin' obrigatório.

   Query params do GET:
   - q          (busca por nome ou slug)
   - category   (rodoviario | agricola | maquinas-pesadas | automotivo | industrial)
   - active     (true | false)
   - sort       (name | displayOrder | createdAt) — padrão displayOrder
   - order      (asc | desc) — padrão asc
   - page       (1..) — padrão 1
   - limit      (1..100) — padrão 50
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Brand from '@/models/Brand';
import Product from '@/models/Product';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

const VALID_CATEGORIES = ['rodoviario', 'agricola', 'maquinas-pesadas', 'automotivo', 'industrial'];

// ══════════════════════════════════════════
// GET — Lista
// ══════════════════════════════════════════
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get('q')?.trim() || '';
    const category = sp.get('category') || '';
    const active = sp.get('active') || '';
    const sort = sp.get('sort') || 'displayOrder';
    const order = (sp.get('order') === 'desc' ? -1 : 1) as 1 | -1;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '50', 10)));

    await dbConnect();

    const filter: Record<string, unknown> = {};

    if (category && VALID_CATEGORIES.includes(category)) {
      filter.category = category;
    }
    if (active === 'true') filter.isActive = true;
    if (active === 'false') filter.isActive = false;

    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { slug: regex }];
    }

    const validSort = ['name', 'displayOrder', 'createdAt', 'updatedAt'];
    const sortField = validSort.includes(sort) ? sort : 'displayOrder';
    // Para displayOrder, name vira tiebreaker
    const sortObj: Record<string, 1 | -1> =
      sortField === 'displayOrder' ? { displayOrder: order, name: 1 } : { [sortField]: order };

    const [brands, total] = await Promise.all([
      Brand.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Brand.countDocuments(filter),
    ]);

    // Contar produtos por marca (via aggregation no Product.applications.brand)
    // Brand.name é uppercase nas applications, então fazemos a junção pelo NAME
    const brandNames = brands.map((b) => b.name.toUpperCase());
    const productCounts = await Product.aggregate([
      { $match: { status: 'active', 'applications.brand': { $in: brandNames } } },
      { $unwind: '$applications' },
      { $match: { 'applications.brand': { $in: brandNames } } },
      { $group: { _id: '$applications.brand', count: { $addToSet: '$_id' } } },
      { $project: { _id: 1, count: { $size: '$count' } } },
    ]);

    const countByBrand = new Map<string, number>(
      productCounts.map((p: { _id: string; count: number }) => [p._id, p.count]),
    );

    const items = brands.map((b) => ({
      slug: b.slug,
      name: b.name,
      logo: b.logo ?? '',
      description: b.description ?? '',
      country: b.country ?? '',
      category: b.category,
      displayOrder: b.displayOrder ?? 999,
      isActive: b.isActive ?? true,
      productsCount: countByBrand.get(b.name.toUpperCase()) ?? 0,
      updatedAt: b.updatedAt,
    }));

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: { q, category, active, sort, order: order === 1 ? 'asc' : 'desc' },
    });
  } catch (err) {
    console.error('[admin/brands GET] error:', err);
    return NextResponse.json({ error: 'Erro ao listar marcas' }, { status: 500 });
  }
}

// ══════════════════════════════════════════
// POST — Criar marca
// ══════════════════════════════════════════
const CreateBrandSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug inválido'),
  logo: z.string().url().or(z.literal('')).default(''),
  description: z.string().max(1000).optional(),
  country: z.string().max(100).optional(),
  category: z.enum(['rodoviario', 'agricola', 'maquinas-pesadas', 'automotivo', 'industrial']),
  displayOrder: z.number().int().min(0).default(999),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json();
    const parsed = CreateBrandSchema.safeParse(body);

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

    const existing = await Brand.findOne({ slug: parsed.data.slug });
    if (existing) {
      return NextResponse.json({ error: 'Slug já existe', conflictField: 'slug' }, { status: 409 });
    }

    const brand = await Brand.create(parsed.data);

    console.log(
      `[admin/brands POST] ${guard.session.user.email} created brand ${brand.name} (${brand.slug})`,
    );

    return NextResponse.json(
      {
        success: true,
        brand: {
          slug: brand.slug,
          name: brand.name,
          _id: brand._id.toString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[admin/brands POST] error:', err);
    return NextResponse.json({ error: 'Erro ao criar marca' }, { status: 500 });
  }
}
