/* ══════════════════════════════════════════
   GET /api/admin/orders/[id]
   ──────────────────────────────────────────
   Retorna detalhe completo do pedido para o admin.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
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

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const { id } = await ctx.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error('[admin/orders GET single] error:', err);
    return NextResponse.json({ error: 'Erro ao buscar pedido' }, { status: 500 });
  }
}
