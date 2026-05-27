/* ══════════════════════════════════════════
   /admin/clientes/[id] — Detalhe do cliente
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Types } from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { CustomerDetailClient } from './customer-detail-client';

export const metadata: Metadata = {
  title: 'Cliente — Admin Original Filter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    notFound();
  }

  await dbConnect();

  const [user, orders, stats] = await Promise.all([
    User.findById(id)
      .select(
        'name email phone whatsapp cpf company role discountTier isActive image lastLogin addresses createdAt updatedAt approvedFromApplication',
      )
      .lean(),
    Order.find({ customer: new Types.ObjectId(id) })
      .select(
        'orderNumber subtotal discountTotal shippingCost total paymentStatus fulfillmentStatus payment.method shipping.method shipping.trackingCode createdAt',
      )
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
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
    notFound();
  }

  // Não permite ver admin por aqui
  if (user.role === 'admin') {
    notFound();
  }

  const aggStats = (
    stats as Array<{
      totalOrders: number;
      totalPaid: number;
      paidOrders: number;
      totalDiscount: number;
      firstOrderAt: Date | null;
      lastOrderAt: Date | null;
    }>
  )[0] ?? {
    totalOrders: 0,
    totalPaid: 0,
    paidOrders: 0,
    totalDiscount: 0,
    firstOrderAt: null,
    lastOrderAt: null,
  };

  // Serializa para passar pro client
  const customer = JSON.parse(JSON.stringify(user));
  const ordersSerialized = JSON.parse(JSON.stringify(orders));
  const statsSerialized = JSON.parse(JSON.stringify(aggStats));

  return (
    <CustomerDetailClient customer={customer} orders={ordersSerialized} stats={statsSerialized} />
  );
}
