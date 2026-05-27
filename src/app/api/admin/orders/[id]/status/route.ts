/* ══════════════════════════════════════════
   PATCH /api/admin/orders/[id]/status
   ══════════════════════════════════════════
   Ações de workflow do admin sobre um pedido.

   Aceita 4 actions (discriminated union):
   - 'updateFulfillment'  → muda fulfillmentStatus
   - 'addTracking'        → adiciona código de rastreio e marca como shipped
   - 'markPaidManually'   → marca como pago (útil para pedidos via PIX/boleto manual)
   - 'cancel'             → cancela com motivo

   Todas as ações registram quem fez (reviewedBy) e quando (timestamp).
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
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

const UpdateFulfillmentSchema = z.object({
  action: z.literal('updateFulfillment'),
  fulfillmentStatus: z.enum([
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
  ]),
  notes: z.string().max(500).optional(),
});

const AddTrackingSchema = z.object({
  action: z.literal('addTracking'),
  trackingCode: z.string().min(3).max(100),
  trackingUrl: z.string().url().optional().or(z.literal('')),
});

const MarkPaidSchema = z.object({
  action: z.literal('markPaidManually'),
  notes: z.string().max(500).optional(),
});

const CancelSchema = z.object({
  action: z.literal('cancel'),
  reason: z.string().min(3).max(500),
});

const ActionSchema = z.discriminatedUnion('action', [
  UpdateFulfillmentSchema,
  AddTrackingSchema,
  MarkPaidSchema,
  CancelSchema,
]);

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const { id } = await ctx.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);

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
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    const action = parsed.data.action;
    const adminId = new Types.ObjectId(String(guard.session.user.id));

    // ─── UPDATE FULFILLMENT ───
    if (action === 'updateFulfillment') {
      const newStatus = parsed.data.fulfillmentStatus;

      // Validação: não pode mudar de pedido já cancelado
      if (order.fulfillmentStatus === 'cancelled' && newStatus !== 'cancelled') {
        return NextResponse.json(
          {
            error: 'Pedido cancelado não pode mudar de status. Crie um novo pedido se necessário.',
          },
          { status: 409 },
        );
      }

      order.fulfillmentStatus = newStatus;

      // Se marcou como shipped pela primeira vez e ainda não tem timestamp
      if (newStatus === 'shipped' && !order.shipping?.shippedAt) {
        if (order.shipping) {
          order.shipping.shippedAt = new Date();
        }
      }

      // Se marcou como delivered
      if (newStatus === 'delivered' && order.shipping && !order.shipping.deliveredAt) {
        order.shipping.deliveredAt = new Date();
      }

      if (parsed.data.notes) {
        const prefix = order.notes ? `${order.notes}\n` : '';
        order.notes = `${prefix}[${new Date().toISOString()}] ${parsed.data.notes}`;
      }

      await order.save();

      console.log(
        `[admin/orders STATUS] ${guard.session.user.email} updated ${order.orderNumber} fulfillment → ${newStatus}`,
      );

      return NextResponse.json({
        success: true,
        order: {
          _id: String(order._id),
          orderNumber: order.orderNumber,
          fulfillmentStatus: order.fulfillmentStatus,
        },
      });
    }

    // ─── ADD TRACKING ───
    if (action === 'addTracking') {
      if (!order.shipping) {
        return NextResponse.json({ error: 'Pedido sem informação de envio' }, { status: 400 });
      }

      order.shipping.trackingCode = parsed.data.trackingCode.trim();
      if (parsed.data.trackingUrl) {
        order.shipping.trackingUrl = parsed.data.trackingUrl.trim();
      }
      if (!order.shipping.shippedAt) {
        order.shipping.shippedAt = new Date();
      }

      // Avança status para shipped se ainda não estava
      if (order.fulfillmentStatus === 'pending' || order.fulfillmentStatus === 'processing') {
        order.fulfillmentStatus = 'shipped';
      }

      await order.save();

      console.log(
        `[admin/orders TRACKING] ${guard.session.user.email} added tracking ${parsed.data.trackingCode} to ${order.orderNumber}`,
      );

      return NextResponse.json({
        success: true,
        order: {
          _id: String(order._id),
          orderNumber: order.orderNumber,
          trackingCode: order.shipping.trackingCode,
          fulfillmentStatus: order.fulfillmentStatus,
        },
      });
    }

    // ─── MARK PAID MANUALLY ───
    if (action === 'markPaidManually') {
      if (order.paymentStatus === 'paid') {
        return NextResponse.json({ error: 'Pedido já estava marcado como pago' }, { status: 409 });
      }

      order.paymentStatus = 'paid';
      if (order.payment) {
        order.payment.paidAt = new Date();
      }

      // Avança fulfillment para processing se ainda estava pending
      if (order.fulfillmentStatus === 'pending') {
        order.fulfillmentStatus = 'processing';
      }

      if (parsed.data.notes) {
        const prefix = order.notes ? `${order.notes}\n` : '';
        order.notes = `${prefix}[${new Date().toISOString()}] Pago manualmente: ${parsed.data.notes}`;
      } else {
        const prefix = order.notes ? `${order.notes}\n` : '';
        order.notes = `${prefix}[${new Date().toISOString()}] Marcado como pago manualmente por admin`;
      }

      await order.save();

      console.log(
        `[admin/orders MARK_PAID] ${guard.session.user.email} manually marked ${order.orderNumber} as paid`,
      );

      return NextResponse.json({
        success: true,
        order: {
          _id: String(order._id),
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
        },
      });
    }

    // ─── CANCEL ───
    if (order.fulfillmentStatus === 'cancelled') {
      return NextResponse.json({ error: 'Pedido já estava cancelado' }, { status: 409 });
    }

    if (order.fulfillmentStatus === 'delivered') {
      return NextResponse.json(
        {
          error: 'Pedidos já entregues não podem ser cancelados (use devolução).',
        },
        { status: 409 },
      );
    }

    order.fulfillmentStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelledBy = adminId;
    order.cancellationReason = parsed.data.reason;

    await order.save();

    console.log(
      `[admin/orders CANCEL] ${guard.session.user.email} cancelled ${order.orderNumber}: ${parsed.data.reason}`,
    );

    return NextResponse.json({
      success: true,
      order: {
        _id: String(order._id),
        orderNumber: order.orderNumber,
        fulfillmentStatus: order.fulfillmentStatus,
        cancellationReason: order.cancellationReason,
      },
    });
  } catch (err) {
    console.error('[admin/orders STATUS PATCH] error:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Erro ao atualizar pedido' },
      { status: 500 },
    );
  }
}
