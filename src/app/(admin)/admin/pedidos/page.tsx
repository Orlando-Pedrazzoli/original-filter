/* ══════════════════════════════════════════
   /admin/pedidos — Lista de pedidos
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { ShoppingBag } from 'lucide-react';
import { OrdersListClient } from './orders-list-client';

export const metadata: Metadata = {
  title: 'Pedidos — Admin Original Filter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminOrdersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <ShoppingBag className="text-brand-iron size-4" strokeWidth={2} />
          <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
            Operação
          </span>
        </div>
        <h1
          className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            letterSpacing: '-0.035em',
          }}
        >
          Pedidos
        </h1>
        <p className="text-brand-iron mt-2">
          Acompanhe o ciclo de vida de cada pedido: pagamento, separação, envio e entrega.
        </p>
      </div>

      <OrdersListClient />
    </div>
  );
}
