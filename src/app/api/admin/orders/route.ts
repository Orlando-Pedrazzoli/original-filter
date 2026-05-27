/* ══════════════════════════════════════════
   GET /api/admin/orders
   ══════════════════════════════════════════
   Lista paginada de pedidos.

   Query params:
   - q                    (busca por orderNumber, customer email/name)
   - paymentStatus        (pending | processing | paid | failed | refunded | chargeback)
   - fulfillmentStatus    (pending | processing | shipped | delivered | cancelled | returned)
   - role                 (retail | reseller) — filtro por tipo de cliente
   - startDate            (ISO date — pedidos a partir de)
   - endDate              (ISO date — pedidos até)
   - sort                 (createdAt | total | orderNumber)
   - order                (asc | desc) — padrão desc
   - page                 (1..) — padrão 1
   - limit                (1..100) — padrão 25

   Retorna também counts agregados por status para badges das tabs.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
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

const VALID_PAYMENT_STATUS = ['pending', 'processing', 'paid', 'failed', 'refunded', 'chargeback'];
const VALID_FULFILLMENT_STATUS = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
];

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get('q')?.trim() || '';
    const paymentStatus = sp.get('paymentStatus') || '';
    const fulfillmentStatus = sp.get('fulfillmentStatus') || '';
    const role = sp.get('role') || '';
    const startDate = sp.get('startDate') || '';
    const endDate = sp.get('endDate') || '';
    const sort = sp.get('sort') || 'createdAt';
    const order = (sp.get('order') === 'asc' ? 1 : -1) as 1 | -1;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '25', 10)));

    await dbConnect();

    const filter: Record<string, unknown> = {};

    if (VALID_PAYMENT_STATUS.includes(paymentStatus)) {
      filter.paymentStatus = paymentStatus;
    }
    if (VALID_FULFILLMENT_STATUS.includes(fulfillmentStatus)) {
      filter.fulfillmentStatus = fulfillmentStatus;
    }
    if (role === 'retail' || role === 'reseller') {
      filter['customerSnapshot.role'] = role;
    }

    // Range de datas
    if (startDate || endDate) {
      const createdAt: Record<string, Date> = {};
      if (startDate) {
        const d = new Date(startDate);
        if (!Number.isNaN(d.getTime())) createdAt.$gte = d;
      }
      if (endDate) {
        const d = new Date(endDate);
        if (!Number.isNaN(d.getTime())) {
          d.setHours(23, 59, 59, 999);
          createdAt.$lte = d;
        }
      }
      if (Object.keys(createdAt).length > 0) filter.createdAt = createdAt;
    }

    // Busca
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { orderNumber: regex },
        { 'customerSnapshot.name': regex },
        { 'customerSnapshot.email': regex },
        { 'customerSnapshot.document': regex },
      ];
    }

    const validSort = ['createdAt', 'total', 'orderNumber'];
    const sortField = validSort.includes(sort) ? sort : 'createdAt';
    const sortObj: Record<string, 1 | -1> = { [sortField]: order };

    const [items, total, statusCounts] = await Promise.all([
      Order.find(filter)
        .select(
          'orderNumber customerSnapshot subtotal discountTotal shippingCost total paymentStatus fulfillmentStatus payment.method shipping.method shipping.trackingCode createdAt',
        )
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
      // Counts agregados por fulfillmentStatus (sem aplicar o filtro de status atual)
      Order.aggregate([
        ...(q || role || startDate || endDate
          ? [
              {
                $match: {
                  ...(q
                    ? {
                        $or: [
                          { orderNumber: new RegExp(q, 'i') },
                          { 'customerSnapshot.name': new RegExp(q, 'i') },
                          { 'customerSnapshot.email': new RegExp(q, 'i') },
                          { 'customerSnapshot.document': new RegExp(q, 'i') },
                        ],
                      }
                    : {}),
                  ...(role ? { 'customerSnapshot.role': role } : {}),
                  ...((startDate || endDate) && filter.createdAt
                    ? { createdAt: filter.createdAt }
                    : {}),
                },
              },
            ]
          : []),
        {
          $group: {
            _id: '$fulfillmentStatus',
            count: { $sum: 1 },
            totalValue: { $sum: '$total' },
          },
        },
      ]),
    ]);

    const countByStatus = new Map<string, { count: number; totalValue: number }>(
      (statusCounts as Array<{ _id: string; count: number; totalValue: number }>).map((s) => [
        s._id,
        { count: s.count, totalValue: s.totalValue },
      ]),
    );

    const rows = items.map((o) => ({
      _id: String(o._id),
      orderNumber: o.orderNumber,
      customerName: o.customerSnapshot?.name ?? '',
      customerEmail: o.customerSnapshot?.email ?? '',
      customerRole: o.customerSnapshot?.role ?? 'retail',
      customerTier: o.customerSnapshot?.discountTier ?? 0,
      subtotal: o.subtotal ?? 0,
      discountTotal: o.discountTotal ?? 0,
      shippingCost: o.shippingCost ?? 0,
      total: o.total ?? 0,
      paymentStatus: o.paymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      paymentMethod: o.payment?.method ?? '',
      shippingMethod: o.shipping?.method ?? '',
      trackingCode: o.shipping?.trackingCode ?? '',
      createdAt: o.createdAt,
    }));

    return NextResponse.json({
      items: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      counts: {
        pending: countByStatus.get('pending')?.count ?? 0,
        processing: countByStatus.get('processing')?.count ?? 0,
        shipped: countByStatus.get('shipped')?.count ?? 0,
        delivered: countByStatus.get('delivered')?.count ?? 0,
        cancelled: countByStatus.get('cancelled')?.count ?? 0,
        returned: countByStatus.get('returned')?.count ?? 0,
      },
      stats: {
        totalRevenue: Array.from(countByStatus.values()).reduce((acc, v) => acc + v.totalValue, 0),
        paidRevenue:
          (countByStatus.get('processing')?.totalValue ?? 0) +
          (countByStatus.get('shipped')?.totalValue ?? 0) +
          (countByStatus.get('delivered')?.totalValue ?? 0),
      },
      filters: {
        q,
        paymentStatus,
        fulfillmentStatus,
        role,
        startDate,
        endDate,
        sort,
        order: order === 1 ? 'asc' : 'desc',
      },
    });
  } catch (err) {
    console.error('[admin/orders GET] error:', err);
    return NextResponse.json({ error: 'Erro ao listar pedidos' }, { status: 500 });
  }
}
