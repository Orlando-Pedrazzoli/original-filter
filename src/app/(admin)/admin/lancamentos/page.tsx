/* ══════════════════════════════════════════
   /admin/lancamentos — Gestão de Lançamentos
   ──────────────────────────────────────────
   Migrada para o route group (admin) — usa o layout admin
   (sidebar + topbar) em vez de hero próprio.

   Guard de auth já é feito pelo middleware + layout (admin).
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Activity, Sparkles, ExternalLink, Settings2 } from 'lucide-react';
import dbConnect from '@/lib/db';
import ProductModel from '@/models/Product';
import { AdminLaunchesClient } from './admin-launches-client';

export const metadata: Metadata = {
  title: 'Lançamentos — Admin Original Filter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export type AdminProductRow = {
  slug: string;
  sku: string;
  title: string;
  productType: string;
  category: string;
  primaryImage: string | null;
  isNewRelease: boolean;
  isPatented: boolean;
  isFeatured: boolean;
  status: string;
};

export default async function AdminLancamentosPage() {
  await dbConnect();

  const products = (await ProductModel.find({
    status: { $in: ['active', 'inactive'] },
  })
    .select('slug sku title productType category images isNewRelease isPatented isFeatured status')
    .sort({ isNewRelease: -1, productType: 1, sku: 1 })
    .limit(2000)
    .lean()) as unknown as Array<{
    slug: string;
    sku: string;
    title: string;
    productType?: string;
    category?: string;
    images?: { url: string; isPrimary?: boolean }[];
    isNewRelease?: boolean;
    isPatented?: boolean;
    isFeatured?: boolean;
    status: string;
  }>;

  const rows: AdminProductRow[] = products.map((p) => ({
    slug: p.slug,
    sku: p.sku,
    title: p.title,
    productType: p.productType ?? 'filter',
    category: p.category ?? '',
    primaryImage: p.images?.find((i) => i.isPrimary)?.url ?? p.images?.[0]?.url ?? null,
    isNewRelease: p.isNewRelease ?? false,
    isPatented: p.isPatented ?? false,
    isFeatured: p.isFeatured ?? false,
    status: p.status,
  }));

  const kpis = {
    total: rows.length,
    launches: rows.filter((r) => r.isNewRelease).length,
    sensors: rows.filter((r) => r.productType === 'sensor').length,
    sensorsAsLaunch: rows.filter((r) => r.productType === 'sensor' && r.isNewRelease).length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="mb-3 flex items-center gap-3">
            <Settings2 className="text-brand-iron size-4" strokeWidth={2} />
            <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
              Gestão de catálogo
            </span>
          </div>
          <h1
            className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              letterSpacing: '-0.035em',
            }}
          >
            Lançamentos e
            <br />
            <span className="text-brand-yellow-deep">flags públicas.</span>
          </h1>
          <p className="text-brand-iron mt-3 max-w-2xl text-sm leading-relaxed md:text-base">
            Marque ou desmarque produtos como lançamento. As mudanças são salvas automaticamente e
            aparecem em{' '}
            <Link
              href="/lancamentos"
              target="_blank"
              className="text-brand-yellow-deep inline-flex items-center gap-1 hover:underline"
            >
              /lancamentos <ExternalLink className="size-3" />
            </Link>{' '}
            em até 5 minutos (ISR).
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-brand-mist grid grid-cols-2 gap-px">
            <KpiBox value={kpis.total} label="Total no catálogo" />
            <KpiBox
              value={kpis.launches}
              label="Marcados como lançamento"
              highlight
              icon={<Sparkles className="size-3.5" strokeWidth={2} />}
            />
            <KpiBox
              value={kpis.sensors}
              label="Sensores"
              icon={<Activity className="size-3.5" strokeWidth={2} />}
            />
            <KpiBox
              value={`${kpis.sensorsAsLaunch}/${kpis.sensors}`}
              label="Sensores em destaque"
              highlight
            />
          </div>
        </div>
      </div>

      <AdminLaunchesClient rows={rows} />
    </div>
  );
}

function KpiBox({
  value,
  label,
  highlight,
  icon,
}: {
  value: string | number;
  label: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`p-4 md:p-5 ${
        highlight ? 'bg-brand-black text-brand-yellow' : 'bg-brand-white text-brand-black'
      }`}
    >
      <div
        className={`mb-2 flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase ${
          highlight ? 'opacity-70' : 'text-brand-iron'
        }`}
      >
        {icon}
        {label}
      </div>
      <div
        className="font-display leading-none font-black tracking-tight"
        style={{
          fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </div>
    </div>
  );
}
