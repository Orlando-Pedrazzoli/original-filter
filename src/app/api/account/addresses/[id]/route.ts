/* ══════════════════════════════════════════
   /api/account/addresses/[id]
   ══════════════════════════════════════════
   PATCH  → atualiza endereço pelo índice
   DELETE → remove endereço pelo índice

   "id" é o ÍNDICE no array `addresses` do user (0, 1, 2...).
   Decisão: como o subdocumento Address tem `{ _id: false }`,
   não temos _id. Usar índice é simples e funciona pra crud
   na conta do user.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function requireLogin() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
    };
  }
  return { session };
}

const UpdateAddressSchema = z.object({
  label: z.enum(['principal', 'cobranca', 'entrega']),
  cep: z.string().regex(/^\d{5}-?\d{3}$/),
  logradouro: z.string().min(2).max(200),
  numero: z.string().min(1).max(20),
  complemento: z.string().max(100).optional(),
  bairro: z.string().min(2).max(100),
  cidade: z.string().min(2).max(100),
  uf: z.string().length(2),
  isDefault: z.boolean().default(false),
});

// ══════════════════════════════════════════
// PATCH — Atualizar
// ══════════════════════════════════════════
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireLogin();
  if ('error' in guard) return guard.error;

  try {
    const { id } = await ctx.params;
    const index = parseInt(id, 10);

    if (Number.isNaN(index) || index < 0) {
      return NextResponse.json({ error: 'Índice de endereço inválido' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = UpdateAddressSchema.safeParse(body);

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
    const user = await User.findById(guard.session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (index >= user.addresses.length) {
      return NextResponse.json({ error: 'Endereço não encontrado' }, { status: 404 });
    }

    const updated = {
      ...parsed.data,
      uf: parsed.data.uf.toUpperCase(),
      cep: parsed.data.cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2'),
    };

    // Se marcou como default, desmarca os outros
    if (updated.isDefault) {
      user.addresses.forEach((a, i) => {
        if (i !== index) a.isDefault = false;
      });
    }

    user.addresses[index] = updated;
    await user.save();

    console.log(`[account/addresses PATCH] ${user.email} updated address #${index}`);

    return NextResponse.json({
      success: true,
      address: { id: index, ...updated },
    });
  } catch (err) {
    console.error('[account/addresses PATCH] error:', err);
    return NextResponse.json({ error: 'Erro ao atualizar endereço' }, { status: 500 });
  }
}

// ══════════════════════════════════════════
// DELETE — Remover
// ══════════════════════════════════════════
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireLogin();
  if ('error' in guard) return guard.error;

  try {
    const { id } = await ctx.params;
    const index = parseInt(id, 10);

    if (Number.isNaN(index) || index < 0) {
      return NextResponse.json({ error: 'Índice de endereço inválido' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(guard.session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (index >= user.addresses.length) {
      return NextResponse.json({ error: 'Endereço não encontrado' }, { status: 404 });
    }

    const removed = user.addresses[index];
    const wasDefault = removed.isDefault;

    user.addresses.splice(index, 1);

    // Se removeu o default, promove o primeiro restante (se houver)
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    console.log(`[account/addresses DELETE] ${user.email} removed address #${index}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[account/addresses DELETE] error:', err);
    return NextResponse.json({ error: 'Erro ao remover endereço' }, { status: 500 });
  }
}
