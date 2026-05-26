/* ══════════════════════════════════════════
   /api/admin/products/[slug]
   ══════════════════════════════════════════
   GET    → detalhe completo de um produto
   PATCH  → atualizar campos (parcial)
   DELETE → soft delete (vira status: 'discontinued')

   Segurança: NextAuth + role 'admin' obrigatório.

   Nota: /api/admin/products/[slug]/flags continua existindo separado
   para a operação rápida do toggle de lançamentos.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
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

// ══════════════════════════════════════════
// GET — Detalhe do produto
// ══════════════════════════════════════════
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const { slug } = await ctx.params;
    await dbConnect();

    const product = await Product.findOne({ slug }).lean();

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error('[admin/products GET single] error:', err);
    return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 });
  }
}

// ══════════════════════════════════════════
// PATCH — Atualizar produto
// ══════════════════════════════════════════
const UpdateProductSchema = z
  .object({
    sku: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[A-Za-z0-9-_./]+$/)
      .optional(),
    slug: z
      .string()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(5000).optional(),
    shortDescription: z.string().max(280).optional(),
    productType: z.enum(['filter', 'sensor', 'accessory']).optional(),
    category: z.string().max(100).optional(),
    retailPrice: z.number().min(0).optional(),
    weight: z.number().min(0).optional(),
    dimensions: z
      .object({
        height: z.number().min(0),
        width: z.number().min(0),
        depth: z.number().min(0),
      })
      .optional(),
    status: z.enum(['active', 'inactive', 'discontinued']).optional(),
    isNewRelease: z.boolean().optional(),
    isPatented: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    stock: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    manageStock: z.boolean().optional(),
    oemCodes: z.array(z.string()).optional(),
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
      .optional(),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          alt: z.string().optional(),
          isPrimary: z.boolean().optional(),
        }),
      )
      .optional(),
    seo: z
      .object({
        title: z.string().max(200).optional(),
        description: z.string().max(300).optional(),
        keywords: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const { slug } = await ctx.params;
    const body = await req.json();
    const parsed = UpdateProductSchema.safeParse(body);

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

    const product = await Product.findOne({ slug });
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // Se mudar sku/slug, conferir unicidade
    const data = parsed.data;
    if (data.sku && data.sku !== product.sku) {
      const conflict = await Product.findOne({
        sku: data.sku,
        _id: { $ne: product._id },
      });
      if (conflict) {
        return NextResponse.json({ error: 'SKU já existe', conflictField: 'sku' }, { status: 409 });
      }
    }
    if (data.slug && data.slug !== product.slug) {
      const conflict = await Product.findOne({
        slug: data.slug,
        _id: { $ne: product._id },
      });
      if (conflict) {
        return NextResponse.json(
          { error: 'Slug já existe', conflictField: 'slug' },
          { status: 409 },
        );
      }
    }

    // Aplica campos
    Object.assign(product, data);
    await product.save();

    console.log(
      `[admin/products PATCH] ${guard.session.user.email} updated ${product.sku} (${product.slug})`,
    );

    return NextResponse.json({
      success: true,
      product: {
        slug: product.slug,
        sku: product.sku,
        _id: product._id.toString(),
      },
    });
  } catch (err) {
    console.error('[admin/products PATCH] error:', err);
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

// ══════════════════════════════════════════
// DELETE — Soft delete (status: discontinued)
// ══════════════════════════════════════════
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const { slug } = await ctx.params;
    // Se vier ?hard=true, exclui de verdade (uso raro)
    const hard = req.nextUrl.searchParams.get('hard') === 'true';

    await dbConnect();

    const product = await Product.findOne({ slug });
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    if (hard) {
      await product.deleteOne();
      console.log(
        `[admin/products DELETE hard] ${guard.session.user.email} HARD DELETED ${product.sku} (${product.slug})`,
      );
      return NextResponse.json({ success: true, hard: true });
    }

    product.status = 'discontinued';
    await product.save();

    console.log(
      `[admin/products DELETE soft] ${guard.session.user.email} discontinued ${product.sku} (${product.slug})`,
    );

    return NextResponse.json({
      success: true,
      hard: false,
      product: { slug: product.slug, sku: product.sku, status: 'discontinued' },
    });
  } catch (err) {
    console.error('[admin/products DELETE] error:', err);
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 });
  }
}
