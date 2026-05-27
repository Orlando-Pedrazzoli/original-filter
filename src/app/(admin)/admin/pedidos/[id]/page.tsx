/* ══════════════════════════════════════════
   /admin/pedidos/[id] — Detalhe do pedido
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Types } from 'mongoose';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { OrderDetailClient } from './order-detail-client';

export const metadata: Metadata = {
  title: 'Pedido — Admin Original Filter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    notFound();
  }

  await dbConnect();

  const order = (await Order.findById(id).lean()) as Record<string, unknown> | null;

  if (!order) {
    notFound();
  }

  // Serializa (Mongoose lean retorna ObjectIds, Dates, etc — JSON friendly)
  const serialized = JSON.parse(JSON.stringify(order));

  return <OrderDetailClient order={serialized} />;
}
