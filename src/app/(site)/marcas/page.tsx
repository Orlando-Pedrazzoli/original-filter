/* ══════════════════════════════════════════
   /marcas — Índice de todas as marcas
   ──────────────────────────────────────────
   Server Component. Lista todas as marcas ativas
   agrupadas por categoria (rodoviário, agrícola, etc).

   Cada marca → card com logo + nome + contagem de produtos.
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Truck, Wheat, HardHat, Car, Factory, Tags } from 'lucide-react';
import dbConnect from '@/lib/db';
import Brand from '@/models/Brand';
import Product from '@/models/Product';
import { BrandCard, type BrandCardData } from '@/components/brands/brand-card';
import { PageHero } from '@/components/shared/page-hero';

export const metadata: Metadata = {
  title: 'Marcas — Original Filter',
  description:
    'Todas as montadoras atendidas pela linha Original Filter: Volvo, Scania, Mercedes-Benz, Iveco, MAN e outras. Filtros e sensores auditados por normas IATF, QS e ISO.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 600; // ISR 10min

type BrandCategory = 'rodoviario' | 'agricola' | 'maquinas-pesadas' | 'automotivo' | 'industrial';

const CATEGORY_CONFIG: Record<
  BrandCategory,
  { label: string; description: string; icon: typeof Truck }
> = {
  rodoviario: {
    label: 'Rodoviário',
    description: 'Caminhões e ônibus pesados',
    icon: Truck,
  },
  'maquinas-pesadas': {
    label: 'Máquinas pesadas',
    description: 'Construção e mineração',
    icon: HardHat,
  },
  agricola: {
    label: 'Agrícola',
    description: 'Tratores, colheitadeiras e equipamentos rurais',
    icon: Wheat,
  },
  automotivo: {
    label: 'Automotivo',
    description: 'Carros leves e utilitários',
    icon: Car,
  },
  industrial: {
    label: 'Industrial',
    description: 'Geradores e equipamentos estacionários',
    icon: Factory,
  },
};

const CATEGORY_ORDER: BrandCategory[] = [
  'rodoviario',
  'maquinas-pesadas',
  'agricola',
  'automotivo',
  'industrial',
];

export default async function MarcasIndexPage() {
  await dbConnect();

  const brands = await Brand.find({ isActive: true })
    .select('name slug logo country category displayOrder')
    .sort({ category: 1, displayOrder: 1, name: 1 })
    .lean();

  if (brands.length === 0) {
    return (
      <>
        <PageHero
          eyebrow="Marcas"
          title="Em breve."
          description="Estamos cadastrando as marcas atendidas pela linha Original Filter."
          breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Marcas' }]}
          variant="dark"
        />
      </>
    );
  }

  // Contar produtos por marca (NOME uppercase em applications)
  const brandNames = brands.map((b) => b.name.toUpperCase());
  const productCounts = await Product.aggregate([
    {
      $match: {
        status: 'active',
        'applications.brand': { $in: brandNames },
      },
    },
    { $unwind: '$applications' },
    { $match: { 'applications.brand': { $in: brandNames } } },
    {
      $group: {
        _id: '$applications.brand',
        count: { $addToSet: '$_id' },
      },
    },
    { $project: { _id: 1, count: { $size: '$count' } } },
  ]);

  const countByBrand = new Map<string, number>(
    productCounts.map((p: { _id: string; count: number }) => [p._id, p.count]),
  );

  // Mapear para BrandCardData e agrupar por categoria
  const cards: BrandCardData[] = brands.map((b) => ({
    slug: b.slug,
    name: b.name,
    logo: b.logo ?? '',
    country: b.country,
    productsCount: countByBrand.get(b.name.toUpperCase()) ?? 0,
  }));

  const grouped = new Map<BrandCategory, BrandCardData[]>();
  for (const b of brands) {
    const cat = b.category as BrandCategory;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push({
      slug: b.slug,
      name: b.name,
      logo: b.logo ?? '',
      country: b.country,
      productsCount: countByBrand.get(b.name.toUpperCase()) ?? 0,
    });
  }

  const totalBrands = brands.length;
  const totalCategories = CATEGORY_ORDER.filter((c) => grouped.has(c)).length;
  const totalProductsCovered = Array.from(countByBrand.values()).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* ─── HERO ─── */}
      <PageHero
        eyebrow="Marcas atendidas"
        title="Cobertura completa para montadoras nacionais e importadas."
        description="Linha Original Filter desenvolvida para atender as principais marcas de veículos pesados, agrícolas e industriais. Produtos auditados pelas normas IATF 16949:2016, QS 9000 e ISO 9001."
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Marcas' }]}
        variant="dark"
        size="lg"
      />

      {/* ─── KPIs ─── */}
      <section className="bg-brand-yellow border-brand-mist relative overflow-hidden border-b">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, transparent, transparent 16px, #000 16px, #000 17px)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-12 md:py-10">
          <div className="grid grid-cols-3 gap-6 md:gap-8">
            <KpiBlock
              value={String(totalBrands)}
              label="Marcas atendidas"
              icon={<Tags className="size-4" strokeWidth={2} />}
            />
            <KpiBlock value={String(totalCategories)} label="Categorias" />
            <KpiBlock value={`${totalProductsCovered}+`} label="Produtos no catálogo" />
          </div>
        </div>
      </section>

      {/* ─── GRUPOS POR CATEGORIA ─── */}
      <section className="bg-brand-white py-12 md:py-20">
        <div className="mx-auto max-w-7xl space-y-16 px-4 md:space-y-20 md:px-12">
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped.get(cat);
            if (!items || items.length === 0) return null;

            const config = CATEGORY_CONFIG[cat];
            const Icon = config.icon;

            return (
              <div key={cat}>
                {/* Header da categoria */}
                <div className="mb-8 grid grid-cols-1 items-end gap-6 md:mb-10 md:grid-cols-12">
                  <div className="md:col-span-8">
                    <div className="mb-3 flex items-center gap-3">
                      <Icon className="text-brand-iron size-4" strokeWidth={2} />
                      <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                        Linha {config.label}
                      </span>
                    </div>
                    <h2
                      className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
                      style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                        letterSpacing: '-0.035em',
                      }}
                    >
                      {config.label}
                      <span className="text-brand-yellow-deep">.</span>
                    </h2>
                    <p className="text-brand-iron mt-2">{config.description}</p>
                  </div>

                  <div className="md:col-span-4 md:text-right">
                    <div className="text-brand-iron font-mono text-[10px] tracking-[0.22em] uppercase">
                      Marcas nesta linha
                    </div>
                    <div
                      className="font-display text-brand-black mt-1 leading-none font-black tracking-tight"
                      style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        letterSpacing: '-0.035em',
                      }}
                    >
                      {String(items.length).padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {/* Grid de marcas */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5">
                  {items.map((b, i) => (
                    <BrandCard key={b.slug} brand={b} index={i} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── CTA final ─── */}
      <section className="bg-brand-black relative overflow-hidden py-16 text-white md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-12">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
              Sua marca não está aqui?
            </span>
            <div className="bg-brand-yellow h-px w-8" />
          </div>
          <h2
            className="font-display mb-5 leading-[0.95] font-black tracking-tight"
            style={{
              fontSize: 'clamp(1.875rem, 4.5vw, 3rem)',
              letterSpacing: '-0.035em',
            }}
          >
            Use o cross-reference
            <br />
            <span className="text-brand-yellow">com o código OEM.</span>
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base text-white/70 md:text-lg">
            Mesmo que sua montadora não esteja listada, é possível que tenhamos o produto
            equivalente. Use o código OEM original para confirmar.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/cross-reference"
              className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright font-display inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold tracking-wide uppercase transition"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              Cross-reference
              <ChevronRight className="size-4" />
            </Link>
            <Link
              href="/contato?assunto=tecnico"
              className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex items-center justify-center gap-2 border-2 border-white/25 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              Falar com técnico
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

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
