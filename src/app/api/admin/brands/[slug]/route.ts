/* ══════════════════════════════════════════
   /api/admin/brands/[slug]
   ══════════════════════════════════════════
   GET    → detalhe da marca
   PATCH  → atualizar
   DELETE → soft delete (isActive: false). ?hard=true para hard delete.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Brand from '@/models/Brand';
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

// ══════════════════════════════════════════
// GET — Detalhe
// ══════════════════════════════════════════
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const { slug } = await ctx.params;
    await dbConnect();

    const brand = await Brand.findOne({ slug }).lean();
    if (!brand) {
      return NextResponse.json({ error: 'Marca não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ brand });
  } catch (err) {
    console.error('[admin/brands GET single] error:', err);
    return NextResponse.json({ error: 'Erro ao buscar marca' }, { status: 500 });
  }
}

// ══════════════════════════════════════════
// PATCH — Atualizar
// ══════════════════════════════════════════
const UpdateBrandSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    slug: z
      .string()
      .min(2)
      .max(100)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    logo: z.string().url().or(z.literal('')).optional(),
    description: z.string().max(1000).optional(),
    country: z.string().max(100).optional(),
    category: z
      .enum(['rodoviario', 'agricola', 'maquinas-pesadas', 'automotivo', 'industrial'])
      .optional(),
    displayOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const { slug } = await ctx.params;
    const body = await req.json();
    const parsed = UpdateBrandSchema.safeParse(body);

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

    const brand = await Brand.findOne({ slug });
    if (!brand) {
      return NextResponse.json({ error: 'Marca não encontrada' }, { status: 404 });
    }

    if (parsed.data.slug && parsed.data.slug !== brand.slug) {
      const conflict = await Brand.findOne({
        slug: parsed.data.slug,
        _id: { $ne: brand._id },
      });
      if (conflict) {
        return NextResponse.json(
          { error: 'Slug já existe', conflictField: 'slug' },
          { status: 409 },
        );
      }
    }

    Object.assign(brand, parsed.data);
    await brand.save();

    console.log(
      `[admin/brands PATCH] ${guard.session.user.email} updated brand ${brand.name} (${brand.slug})`,
    );

    return NextResponse.json({
      success: true,
      brand: {
        slug: brand.slug,
        name: brand.name,
        _id: brand._id.toString(),
      },
    });
  } catch (err) {
    console.error('[admin/brands PATCH] error:', err);
    return NextResponse.json({ error: 'Erro ao atualizar marca' }, { status: 500 });
  }
}

// ══════════════════════════════════════════
// DELETE — Soft delete (isActive=false) ou hard
// ══════════════════════════════════════════
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const { slug } = await ctx.params;
    const hard = req.nextUrl.searchParams.get('hard') === 'true';

    await dbConnect();

    const brand = await Brand.findOne({ slug });
    if (!brand) {
      return NextResponse.json({ error: 'Marca não encontrada' }, { status: 404 });
    }

    if (hard) {
      await brand.deleteOne();
      console.log(
        `[admin/brands DELETE hard] ${guard.session.user.email} HARD DELETED ${brand.name}`,
      );
      return NextResponse.json({ success: true, hard: true });
    }

    brand.isActive = false;
    await brand.save();

    console.log(`[admin/brands DELETE soft] ${guard.session.user.email} deactivated ${brand.name}`);

    return NextResponse.json({
      success: true,
      hard: false,
      brand: { slug: brand.slug, name: brand.name, isActive: false },
    });
  } catch (err) {
    console.error('[admin/brands DELETE] error:', err);
    return NextResponse.json({ error: 'Erro ao excluir marca' }, { status: 500 });
  }
}
