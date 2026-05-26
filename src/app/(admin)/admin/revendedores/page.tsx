/* ══════════════════════════════════════════
   /admin/revendedores — Aplicações de revendedores
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { ClipboardList } from 'lucide-react';
import { ResellersListClient } from './resellers-list-client';

export const metadata: Metadata = {
  title: 'Revendedores — Admin Original Filter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminResellersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <ClipboardList className="text-brand-iron size-4" strokeWidth={2} />
          <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
            Programa B2B
          </span>
        </div>
        <h1
          className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            letterSpacing: '-0.035em',
          }}
        >
          Revendedores
        </h1>
        <p className="text-brand-iron mt-2">
          Aplicações enviadas pelo formulário público. Aprove para criar conta B2B com tier de
          desconto, ou rejeite com motivo.
        </p>
      </div>

      <ResellersListClient />
    </div>
  );
}
