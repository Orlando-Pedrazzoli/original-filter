/* ══════════════════════════════════════════
   /admin/clientes — Lista de clientes
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { CustomersListClient } from './customers-list-client';

export const metadata: Metadata = {
  title: 'Clientes — Admin Original Filter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminCustomersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <Users className="text-brand-iron size-4" strokeWidth={2} />
          <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
            CRM
          </span>
        </div>
        <h1
          className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            letterSpacing: '-0.035em',
          }}
        >
          Clientes
        </h1>
        <p className="text-brand-iron mt-2">
          Gerencie clientes B2C e revendedores B2B. Ajuste tiers de desconto e ative/desative
          contas.
        </p>
      </div>

      <CustomersListClient />
    </div>
  );
}
