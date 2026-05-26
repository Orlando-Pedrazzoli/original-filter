/* ══════════════════════════════════════════
   PATCH /api/admin/products/[slug]/flags
   ──────────────────────────────────────────
   Admin atualiza apenas as 3 flags públicas do produto:
   - isNewRelease  (mostra em /lancamentos)
   - isPatented    (badge de patenteado)
   - isFeatured    (destaque na home)

   Segurança:
   - NextAuth v5 obrigatório
   - role === 'admin' obrigatório
   - Body validado com Zod
   - Atualiza só as flags (não dá brecha para mexer em preço/estoque/etc)

   Resposta:
   - 200: { success, product: { slug, sku, isNewRelease, isPatented, isFeatured } }
   - 401: não autenticado
   - 403: autenticado mas sem role admin
   - 404: produto não encontrado
   - 400: payload inválido
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const FlagsSchema = z
  .object({
    isNewRelease: z.boolean().optional(),
    isPatented: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.isNewRelease !== undefined ||
      data.isPatented !== undefined ||
      data.isFeatured !== undefined,
    {
      message: 'Pelo menos uma flag deve ser informada',
    },
  );

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    // ─── Autenticação ───
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    // ─── Validação do body ───
    const body = await req.json();
    const parsed = FlagsSchema.safeParse(body);

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

    // ─── Buscar produto ───
    const { slug } = await ctx.params;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Slug inválido' }, { status: 400 });
    }

    await dbConnect();

    const product = await Product.findOne({ slug });

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // ─── Aplicar flags (só as enviadas) ───
    const flags = parsed.data;
    const before = {
      isNewRelease: product.isNewRelease,
      isPatented: product.isPatented,
      isFeatured: product.isFeatured,
    };

    if (flags.isNewRelease !== undefined) {
      product.isNewRelease = flags.isNewRelease;
    }
    if (flags.isPatented !== undefined) {
      product.isPatented = flags.isPatented;
    }
    if (flags.isFeatured !== undefined) {
      product.isFeatured = flags.isFeatured;
    }

    await product.save();

    // Log auditoria simples
    console.log(
      `[admin/flags] ${session.user.email} updated ${product.sku}:`,
      Object.entries(flags)
        .map(([k, v]) => `${k}: ${before[k as keyof typeof before]} → ${v}`)
        .join(', '),
    );

    return NextResponse.json({
      success: true,
      product: {
        slug: product.slug,
        sku: product.sku,
        isNewRelease: product.isNewRelease,
        isPatented: product.isPatented,
        isFeatured: product.isFeatured,
      },
    });
  } catch (err) {
    console.error('[admin/flags PATCH] error:', err);
    return NextResponse.json({ error: 'Erro ao atualizar flags do produto' }, { status: 500 });
  }
}
