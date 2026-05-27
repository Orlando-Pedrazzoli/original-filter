/* ══════════════════════════════════════════
   /api/admin/customers/[id]
   ══════════════════════════════════════════
   GET   → detalhe completo + pedidos recentes
   PATCH → editar role, discountTier, isActive

   NÃO permite editar:
   - Email (admin pode pedir trocar via suporte se necessário)
   - Senha (use /api/auth/forgot-password)
   - Dados pessoais (cliente edita no /conta/perfil)

   Foco: admin gerencia tier B2B e ativação de conta.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
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

// ══════════════════════════════════════════
// GET — Detalhe do cliente
// ══════════════════════════════════════════
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const { id } = await ctx.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await dbConnect();

    const [user, orders, stats] = await Promise.all([
      User.findById(id)
        .select(
          'name email phone whatsapp cpf company role discountTier isActive image lastLogin addresses createdAt updatedAt approvedFromApplication',
        )
        .lean(),
      // Últimos 50 pedidos
      Order.find({ customer: new Types.ObjectId(id) })
        .select(
          'orderNumber subtotal discountTotal shippingCost total paymentStatus fulfillmentStatus payment.method shipping.method shipping.trackingCode createdAt',
        )
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      // Stats agregados
      Order.aggregate([
        { $match: { customer: new Types.ObjectId(id) } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalPaid: {
              $sum: {
                $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0],
              },
            },
            paidOrders: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] },
            },
            totalDiscount: { $sum: '$discountTotal' },
            firstOrderAt: { $min: '$createdAt' },
            lastOrderAt: { $max: '$createdAt' },
          },
        },
      ]),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const aggStats = (
      stats as Array<{
        totalOrders: number;
        totalPaid: number;
        paidOrders: number;
        totalDiscount: number;
        firstOrderAt: Date;
        lastOrderAt: Date;
      }>
    )[0] ?? {
      totalOrders: 0,
      totalPaid: 0,
      paidOrders: 0,
      totalDiscount: 0,
      firstOrderAt: null,
      lastOrderAt: null,
    };

    return NextResponse.json({
      customer: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        whatsapp: user.whatsapp ?? '',
        cpf: user.cpf ?? '',
        company: user.company ?? null,
        role: user.role,
        discountTier: user.discountTier ?? 0,
        isActive: user.isActive ?? true,
        image: user.image ?? '',
        lastLogin: user.lastLogin ?? null,
        addresses: user.addresses ?? [],
        approvedFromApplication: user.approvedFromApplication
          ? String(user.approvedFromApplication)
          : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      orders: (orders as unknown as Array<Record<string, unknown> & { _id: unknown }>).map((o) => ({
        ...o,
        _id: String(o._id),
      })),
      stats: aggStats,
    });
  } catch (err) {
    console.error('[admin/customers GET single] error:', err);
    return NextResponse.json({ error: 'Erro ao buscar cliente' }, { status: 500 });
  }
}

// ══════════════════════════════════════════
// PATCH — Editar
// ══════════════════════════════════════════
const PatchSchema = z
  .object({
    role: z.enum(['retail', 'reseller']).optional(),
    discountTier: z
      .union([z.literal(0), z.literal(5), z.literal(10), z.literal(15), z.literal(20)])
      .optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const { id } = await ctx.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);

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
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Não é possível editar contas de admin por aqui' },
        { status: 403 },
      );
    }

    const data = parsed.data;

    // Mudança de role: retail ↔ reseller
    if (data.role !== undefined && data.role !== user.role) {
      // Promovendo para reseller mas sem company → erro
      if (data.role === 'reseller' && !user.company?.cnpj) {
        return NextResponse.json(
          {
            error:
              'Para promover para revendedor, o cliente precisa ter dados de empresa cadastrados. Peça que ele atualize no perfil ou use o fluxo de aprovação de revendedor.',
          },
          { status: 400 },
        );
      }
      // Demovendo para retail: zera tier
      if (data.role === 'retail') {
        user.discountTier = 0;
      }
      user.role = data.role;
    }

    if (data.discountTier !== undefined) {
      // Tier > 0 só faz sentido para reseller
      if (data.discountTier > 0 && user.role !== 'reseller') {
        return NextResponse.json(
          {
            error:
              'Tier > 0% só pode ser aplicado a revendedores. Promova para revendedor primeiro.',
          },
          { status: 400 },
        );
      }
      user.discountTier = data.discountTier;
    }

    if (data.isActive !== undefined) {
      user.isActive = data.isActive;
    }

    await user.save();

    console.log(
      `[admin/customers PATCH] ${guard.session.user.email} updated ${user.email}: ${JSON.stringify(data)}`,
    );

    return NextResponse.json({
      success: true,
      customer: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        discountTier: user.discountTier,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error('[admin/customers PATCH] error:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Erro ao atualizar cliente' },
      { status: 500 },
    );
  }
}
