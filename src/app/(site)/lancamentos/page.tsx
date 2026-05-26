/* ══════════════════════════════════════════
   /lancamentos — Lançamentos Original Filter
   ──────────────────────────────────────────
   Server Component (SEO + performance).
   Lê direto do MongoDB sem passar por API (mesmo padrão de /produtos).

   Estrutura:
   1. PageHero dark com KPI total
   2. SensorsSpotlight (sensores NOx em destaque)
   3. LaunchesGrid (outros lançamentos)
   4. WhySensors (3 diferenciais técnicos)
   5. CTA final
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Sparkles, Activity, PackageSearch, Headphones } from 'lucide-react';
import dbConnect from '@/lib/db';
import ProductModel from '@/models/Product';
import { auth } from '@/lib/auth';
import { PageHero } from '@/components/shared/page-hero';
import { SensorsSpotlight } from '@/components/launches/sensors-spotlight';
import { LaunchesGrid } from '@/components/launches/launches-grid';
import { WhySensors } from '@/components/launches/why-sensors';
import { CONTACT } from '@/lib/constants';
import type { ProductCardData } from '@/components/products/product-card';

export const metadata: Metadata = {
  title: 'Lançamentos — Original Filter',
  description:
    'Novidades Original Filter: sensores NOx para sistemas SCR Euro V/Euro VI, ' +
    'filtros e acessórios em linha. Componentes auditados pelas normas ' +
    'IATF 16949:2016, QS 9000 e ISO 9001.',
};

// ISR: revalida a cada 5 minutos (para refletir mudanças do admin)
export const revalidate = 300;

// ── Tipo seguro vindo do MongoDB ──
type ProductDoc = {
  sku: string;
  slug: string;
  title: string;
  category?: string;
  productType?: string;
  images?: { url: string; isPrimary?: boolean }[];
  retailPrice?: number;
  isPatented?: boolean;
  isNewRelease?: boolean;
  status: string;
  applications?: unknown[];
};

// ── Converte documento do Mongo em shape do ProductCard ──
function toCardData(doc: ProductDoc, discountTier: number): ProductCardData {
  const primaryImage = doc.images?.find((i) => i.isPrimary)?.url ?? doc.images?.[0]?.url ?? null;

  const retailPrice = doc.retailPrice ?? 0;
  const finalPrice = discountTier > 0 ? retailPrice * (1 - discountTier / 100) : retailPrice;

  return {
    sku: doc.sku,
    slug: doc.slug,
    title: doc.title,
    category: doc.category ?? '',
    productType: doc.productType ?? 'filter',
    primaryImage,
    retailPrice,
    finalPrice,
    discountTier,
    isPatented: doc.isPatented ?? false,
    isNewRelease: doc.isNewRelease ?? false,
    status: doc.status,
    applicationsCount: doc.applications?.length ?? 0,
  };
}

export default async function LancamentosPage() {
  // ─── Auth para pegar discountTier (se for revendedor logado) ───
  const session = await auth();
  const discountTier = session?.user?.discountTier ?? 0;

  // ─── DB ───
  await dbConnect();

  // 1) Sensores que são lançamento (limitado a 12 para a vitrine)
  const sensors = (await ProductModel.find({
    status: 'active',
    productType: 'sensor',
    isNewRelease: true,
  })
    .sort({ updatedAt: -1, sku: 1 })
    .limit(12)
    .lean()) as unknown as ProductDoc[];

  // 2) Total de sensores no catálogo (independente de isNewRelease)
  const totalSensors = await ProductModel.countDocuments({
    status: 'active',
    productType: 'sensor',
  });

  // 3) Outros lançamentos (não-sensores) — até 8 produtos
  const otherLaunches = (await ProductModel.find({
    status: 'active',
    isNewRelease: true,
    productType: { $ne: 'sensor' },
  })
    .sort({ updatedAt: -1, sku: 1 })
    .limit(8)
    .lean()) as unknown as ProductDoc[];

  // 4) Total de lançamentos
  const totalLaunches = await ProductModel.countDocuments({
    status: 'active',
    isNewRelease: true,
  });

  // ─── Converte para shape de UI ───
  const sensorsData = sensors.map((d) => toCardData(d, discountTier));
  const otherLaunchesData = otherLaunches.map((d) => toCardData(d, discountTier));

  return (
    <>
      {/* ─── 1. Hero ─── */}
      <PageHero
        eyebrow="Lançamentos"
        title="Novidades em filtragem e sensores."
        description="Sensores NOx para sistemas SCR Euro V/Euro VI, novos filtros e acessórios da linha Original Filter. Componentes auditados e em constante expansão."
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Lançamentos' }]}
        variant="dark"
        size="lg"
      />

      {/* ─── Faixa de KPIs ─── */}
      <section className="bg-brand-yellow relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, transparent, transparent 16px, #000 16px, #000 17px)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-12 md:py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            <KpiBlock value={String(totalLaunches).padStart(2, '0')} label="Produtos em destaque" />
            <KpiBlock
              value={String(sensorsData.length).padStart(2, '0')}
              label="Sensores novos"
              icon={<Activity className="size-4" strokeWidth={2} />}
            />
            <KpiBlock
              value={String(otherLaunchesData.length).padStart(2, '0')}
              label="Outras novidades"
              icon={<Sparkles className="size-4" strokeWidth={2} />}
            />
            <KpiBlock
              value={String(totalSensors)}
              label="Sensores no catálogo total"
              icon={<PackageSearch className="size-4" strokeWidth={2} />}
            />
          </div>
        </div>
      </section>

      {/* ─── 2. Sensores em destaque ─── */}
      <SensorsSpotlight sensors={sensorsData} totalSensors={totalSensors} />

      {/* ─── 3. Outros lançamentos ─── */}
      <LaunchesGrid products={otherLaunchesData} />

      {/* ─── 4. Por que sensores Original Filter ─── */}
      <WhySensors />

      {/* ─── 5. CTA final dark ─── */}
      <section className="bg-brand-black relative overflow-hidden py-16 text-white md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 md:px-12">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <Headphones className="text-brand-yellow size-5" strokeWidth={2} />
                <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
                  Suporte técnico especializado
                </span>
              </div>
              <h2
                className="font-display leading-[0.95] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.875rem, 4.5vw, 3rem)',
                  letterSpacing: '-0.035em',
                }}
              >
                Dúvida sobre aplicação
                <br />
                <span className="text-brand-yellow">de um sensor?</span>
              </h2>
              <p className="mt-5 max-w-xl text-base text-white/70 md:text-lg">
                Nossa equipe técnica conhece em detalhe cada sensor da linha. Atendimento direto da
                fábrica para confirmar referência cruzada e aplicação correta.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <a
                href={`tel:${CONTACT.phoneRaw}`}
                className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright font-display inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold tracking-wide uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                {CONTACT.phone}
                <ArrowRight className="size-4" />
              </a>
              <Link
                href="/cross-reference"
                className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex w-full items-center justify-center gap-2 border-2 border-white/25 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Cross-reference
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contato?assunto=tecnico"
                className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex w-full items-center justify-center gap-2 border-2 border-white/25 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Formulário técnico
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── KpiBlock interno ───
function KpiBlock({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-brand-black/70 mb-2 flex items-center gap-2">
        {icon}
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase">{label}</span>
      </div>
      <div
        className="font-display text-brand-black leading-none font-black tracking-tight"
        style={{
          fontSize: 'clamp(1.875rem, 3.5vw, 2.5rem)',
          letterSpacing: '-0.035em',
        }}
      >
        {value}
      </div>
    </div>
  );
}
