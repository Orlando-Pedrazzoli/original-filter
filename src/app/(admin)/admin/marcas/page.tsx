/* ══════════════════════════════════════════
   /admin/marcas — Lista de marcas
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Tags, Plus } from 'lucide-react';
import { BrandsListClient } from './brands-list-client';

export const metadata: Metadata = {
  title: 'Marcas — Admin Original Filter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminBrandsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Tags className="text-brand-iron size-4" strokeWidth={2} />
            <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
              Catálogo
            </span>
          </div>
          <h1
            className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              letterSpacing: '-0.035em',
            }}
          >
            Marcas
          </h1>
          <p className="text-brand-iron mt-2">
            Cadastre montadoras (Volvo, Scania, MB...) com logo, descrição e categoria.
          </p>
        </div>

        <Link
          href="/admin/marcas/nova"
          className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wide uppercase transition"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <Plus className="size-4" strokeWidth={2.5} />
          Nova marca
        </Link>
      </div>

      <BrandsListClient />
    </div>
  );
}
