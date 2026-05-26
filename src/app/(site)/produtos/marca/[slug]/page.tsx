/* ══════════════════════════════════════════
   /produtos/marca/[slug] — Página de marca
   ──────────────────────────────────────────
   Server Component. SEO próprio.
   Lê direto do MongoDB.

   Estratégia de busca de produtos:
   1. Tenta por product.brand (referência direta ao Brand._id)
   2. Fallback: busca produtos com applications.brand === brand.name.toUpperCase()
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ChevronRight,
  Package,
  Activity,
  Filter as FilterIcon,
  Wrench,
  ArrowRight,
  Globe,
  Sparkles,
  Award,
  ImageOff,
} from 'lucide-react';
import dbConnect from '@/lib/db';
import Brand from '@/models/Brand';
import ProductModel from '@/models/Product';
import { auth } from '@/lib/auth';
import { ProductCard, type ProductCardData } from '@/components/products/product-card';
import { CONTACT } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // ISR 5min

// ─── Tipos auxiliares ───
type BrandCategory = 'rodoviario' | 'agricola' | 'maquinas-pesadas' | 'automotivo' | 'industrial';

type ProductDoc = {
  _id: { toString(): string };
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

type BrandDoc = {
  _id: { toString(): string };
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  country?: string;
  category: BrandCategory;
  isActive?: boolean;
};

// ─── Helpers ───
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

const CATEGORY_LABELS: Record<BrandCategory, string> = {
  rodoviario: 'Rodoviário',
  agricola: 'Agrícola',
  'maquinas-pesadas': 'Máquinas pesadas',
  automotivo: 'Automotivo',
  industrial: 'Industrial',
};

// ─── Metadata dinâmica para SEO ───
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const brand = (await Brand.findOne({
    slug,
    isActive: true,
  }).lean()) as unknown as BrandDoc | null;

  if (!brand) {
    return {
      title: 'Marca não encontrada — Original Filter',
      robots: { index: false },
    };
  }

  return {
    title: `${brand.name} — Filtros e sensores Original Filter`,
    description:
      brand.description ||
      `Linha completa de filtros e sensores Original Filter para ${brand.name}. Produtos auditados pelas normas IATF 16949, QS 9000 e ISO 9001.`,
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tipo?: string; page?: string }>;
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  await dbConnect();

  // ─── Buscar marca ───
  const brand = (await Brand.findOne({
    slug,
    isActive: true,
  }).lean()) as unknown as BrandDoc | null;

  if (!brand) {
    notFound();
  }

  // ─── Discount tier do usuário logado ───
  const session = await auth();
  const discountTier = session?.user?.discountTier ?? 0;

  // ─── Filtros da URL ───
  const filterType =
    sp.tipo && ['filter', 'sensor', 'accessory'].includes(sp.tipo) ? sp.tipo : undefined;
  const page = Math.max(1, parseInt(sp.page || '1', 10));
  const LIMIT = 24;

  // ─── Buscar produtos da marca ───
  // Estratégia: aplicar OR entre (brand._id) e (applications.brand === BRAND_NAME)
  const brandNameUpper = brand.name.toUpperCase();

  const productFilter: Record<string, unknown> = {
    status: 'active',
    $or: [{ brand: brand._id }, { 'applications.brand': brandNameUpper }],
  };

  if (filterType) {
    productFilter.productType = filterType;
  }

  const [products, total, allCounts] = await Promise.all([
    ProductModel.find(productFilter)
      .select(
        'sku slug title category productType images retailPrice isPatented isNewRelease status applications',
      )
      .sort({ isNewRelease: -1, sku: 1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT)
      .lean() as unknown as Promise<ProductDoc[]>,
    ProductModel.countDocuments(productFilter),
    // Contagens por tipo (sem o filtro de tipo aplicado)
    ProductModel.aggregate([
      {
        $match: {
          status: 'active',
          $or: [{ brand: brand._id }, { 'applications.brand': brandNameUpper }],
        },
      },
      { $group: { _id: '$productType', count: { $sum: 1 } } },
    ]) as Promise<Array<{ _id: string; count: number }>>,
  ]);

  const productsCardData = products.map((p) => toCardData(p, discountTier));

  // KPIs por tipo
  const countByType = new Map<string, number>(allCounts.map((c) => [c._id ?? 'filter', c.count]));
  const totalAll = Array.from(countByType.values()).reduce((a, b) => a + b, 0);
  const totalFilters = countByType.get('filter') ?? 0;
  const totalSensors = countByType.get('sensor') ?? 0;
  const totalAccessories = countByType.get('accessory') ?? 0;

  const pages = Math.ceil(total / LIMIT);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="bg-brand-snow border-brand-mist relative overflow-hidden border-b">
        {/* Padrão decorativo amarelo no canto */}
        <div
          className="pointer-events-none absolute top-0 right-0 bottom-0 w-1/3 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, transparent, transparent 18px, #000 18px, #000 19px)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-12 md:py-20">
          {/* Breadcrumb */}
          <nav className="mb-8 flex flex-wrap items-center gap-1.5 font-mono text-xs tracking-widest uppercase">
            <Link href="/" className="text-brand-iron hover:text-brand-yellow-deep transition">
              Início
            </Link>
            <ChevronRight className="text-brand-mist size-3" />
            <Link
              href="/produtos"
              className="text-brand-iron hover:text-brand-yellow-deep transition"
            >
              Catálogo
            </Link>
            <ChevronRight className="text-brand-mist size-3" />
            <Link
              href="/marcas"
              className="text-brand-iron hover:text-brand-yellow-deep transition"
            >
              Marcas
            </Link>
            <ChevronRight className="text-brand-mist size-3" />
            <span className="text-brand-black">{brand.name}</span>
          </nav>

          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
            {/* Logo grande */}
            <div className="lg:col-span-4">
              <div
                className="bg-brand-white border-brand-mist relative flex aspect-square max-w-[280px] items-center justify-center overflow-hidden border"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    sizes="280px"
                    className="object-contain p-8"
                    priority
                  />
                ) : (
                  <ImageOff className="text-brand-mist size-12" strokeWidth={1.25} />
                )}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="lg:col-span-8">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="bg-brand-black text-brand-yellow inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  {CATEGORY_LABELS[brand.category]}
                </span>
                {brand.country && (
                  <span className="text-brand-iron inline-flex items-center gap-1.5 font-mono text-xs">
                    <Globe className="size-3" strokeWidth={2} />
                    {brand.country}
                  </span>
                )}
              </div>

              <h1
                className="font-display text-brand-black mb-4 leading-[0.9] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
                  letterSpacing: '-0.04em',
                }}
              >
                {brand.name}
                <span className="text-brand-yellow-deep">.</span>
              </h1>

              {brand.description ? (
                <p className="text-brand-iron max-w-2xl text-base leading-relaxed md:text-xl">
                  {brand.description}
                </p>
              ) : (
                <p className="text-brand-iron max-w-2xl text-base leading-relaxed md:text-xl">
                  Linha completa de filtros e sensores Original Filter para veículos {brand.name}.
                  Componentes auditados pelas normas IATF 16949:2016, QS 9000 e ISO 9001.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAIXA DE KPIS ─── */}
      <section className="bg-brand-yellow border-brand-mist relative overflow-hidden border-b">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, transparent, transparent 16px, #000 16px, #000 17px)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-12 md:py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            <KpiBlock
              value={String(totalAll)}
              label="Produtos para esta marca"
              icon={<Package className="size-4" strokeWidth={2} />}
            />
            <KpiBlock
              value={String(totalFilters)}
              label="Filtros"
              icon={<FilterIcon className="size-4" strokeWidth={2} />}
            />
            <KpiBlock
              value={String(totalSensors)}
              label="Sensores"
              icon={<Activity className="size-4" strokeWidth={2} />}
            />
            <KpiBlock
              value={String(totalAccessories)}
              label="Acessórios"
              icon={<Wrench className="size-4" strokeWidth={2} />}
            />
          </div>
        </div>
      </section>

      {/* ─── FILTROS + GRID ─── */}
      <section className="bg-brand-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          {/* Header da lista + filtros */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-brand-yellow h-px w-8" />
                <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                  Catálogo {brand.name}
                </span>
              </div>
              <h2
                className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                  letterSpacing: '-0.035em',
                }}
              >
                {filterType ? (
                  <>
                    {filterType === 'filter' && 'Filtros'}
                    {filterType === 'sensor' && 'Sensores'}
                    {filterType === 'accessory' && 'Acessórios'} para {brand.name}.
                  </>
                ) : (
                  <>Todos os produtos.</>
                )}
              </h2>
            </div>

            {totalAll > 0 && (
              <div className="text-brand-iron font-mono text-xs tracking-widest uppercase">
                Mostrando <strong className="text-brand-black">{total}</strong>{' '}
                {total === 1 ? 'produto' : 'produtos'}
              </div>
            )}
          </div>

          {/* Tabs de filtro */}
          {totalAll > 0 && (
            <div className="-mx-4 mb-8 flex items-center gap-1 overflow-x-auto px-4 pb-1">
              <FilterTab
                href={`/produtos/marca/${brand.slug}`}
                active={!filterType}
                count={totalAll}
              >
                Todos
              </FilterTab>
              {totalFilters > 0 && (
                <FilterTab
                  href={`/produtos/marca/${brand.slug}?tipo=filter`}
                  active={filterType === 'filter'}
                  count={totalFilters}
                  icon={<FilterIcon className="size-3" strokeWidth={2} />}
                >
                  Filtros
                </FilterTab>
              )}
              {totalSensors > 0 && (
                <FilterTab
                  href={`/produtos/marca/${brand.slug}?tipo=sensor`}
                  active={filterType === 'sensor'}
                  count={totalSensors}
                  icon={<Activity className="size-3" strokeWidth={2} />}
                >
                  Sensores
                </FilterTab>
              )}
              {totalAccessories > 0 && (
                <FilterTab
                  href={`/produtos/marca/${brand.slug}?tipo=accessory`}
                  active={filterType === 'accessory'}
                  count={totalAccessories}
                  icon={<Wrench className="size-3" strokeWidth={2} />}
                >
                  Acessórios
                </FilterTab>
              )}
            </div>
          )}

          {/* Grid ou estado vazio */}
          {productsCardData.length === 0 ? (
            <EmptyState brandName={brand.name} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
                {productsCardData.map((p) => (
                  <ProductCard key={p.sku} product={p} />
                ))}
              </div>

              {/* Paginação simples server-rendered */}
              {pages > 1 && (
                <Pagination
                  brandSlug={brand.slug}
                  currentPage={page}
                  totalPages={pages}
                  filterType={filterType}
                />
              )}
            </>
          )}
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
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
                <Award className="text-brand-yellow size-5" strokeWidth={2} />
                <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
                  Não encontrou o produto?
                </span>
              </div>
              <h2
                className="font-display leading-[0.95] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.875rem, 4.5vw, 3rem)',
                  letterSpacing: '-0.035em',
                }}
              >
                Use o cross-reference
                <br />
                <span className="text-brand-yellow">com o código OEM.</span>
              </h2>
              <p className="mt-5 max-w-xl text-base text-white/70 md:text-lg">
                Tem o código do filtro {brand.name} mas não achou aqui? Use a ferramenta de
                cross-reference para encontrar o equivalente Original Filter.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <Link
                href="/cross-reference"
                className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright font-display inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold tracking-wide uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Cross-reference
                <ArrowRight className="size-4" />
              </Link>
              <a
                href={`tel:${CONTACT.phoneRaw}`}
                className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex w-full items-center justify-center gap-2 border-2 border-white/25 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                {CONTACT.phone}
              </a>
              <Link
                href="/contato?assunto=tecnico"
                className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex w-full items-center justify-center gap-2 border-2 border-white/25 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Suporte técnico
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════
//   Componentes auxiliares
// ═══════════════════════════════════════════

function KpiBlock({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
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

function FilterTab({
  href,
  active,
  count,
  icon,
  children,
}: {
  href: string;
  active?: boolean;
  count: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`font-display inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition ${
        active
          ? 'bg-brand-black text-brand-yellow'
          : 'bg-brand-white text-brand-iron border-brand-mist hover:border-brand-iron border'
      }`}
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {icon}
      {children}
      <span
        className={`font-mono text-[10px] ${active ? 'text-brand-yellow/70' : 'text-brand-steel'}`}
      >
        ({count})
      </span>
    </Link>
  );
}

function EmptyState({ brandName }: { brandName: string }) {
  return (
    <div
      className="bg-brand-snow border-brand-mist border p-10 text-center md:p-16"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <Sparkles className="text-brand-yellow-deep mx-auto mb-4 size-12" strokeWidth={1.5} />
      <h3
        className="font-display text-brand-black mb-3 leading-tight font-black"
        style={{
          fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)',
          letterSpacing: '-0.025em',
        }}
      >
        Em breve produtos para {brandName}.
      </h3>
      <p className="text-brand-iron mx-auto mb-6 max-w-md leading-relaxed">
        Estamos expandindo a linha. Enquanto isso, explore nosso catálogo completo ou fale com nossa
        equipe técnica para uma consulta.
      </p>
      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        <Link
          href="/produtos"
          className="bg-brand-black hover:bg-brand-graphite font-display inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold tracking-wide text-white uppercase transition"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          Catálogo completo
          <ArrowRight className="size-3.5" />
        </Link>
        <Link
          href="/contato?assunto=tecnico"
          className="border-brand-mist hover:border-brand-iron text-brand-iron hover:text-brand-black font-display inline-flex items-center justify-center gap-2 border px-5 py-3 text-xs font-semibold tracking-wide uppercase transition"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          Falar com técnico
        </Link>
      </div>
    </div>
  );
}

function Pagination({
  brandSlug,
  currentPage,
  totalPages,
  filterType,
}: {
  brandSlug: string;
  currentPage: number;
  totalPages: number;
  filterType?: string;
}) {
  function buildUrl(page: number): string {
    const params = new URLSearchParams();
    if (filterType) params.set('tipo', filterType);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return `/produtos/marca/${brandSlug}${qs ? `?${qs}` : ''}`;
  }

  const pageNumbers = computePageNumbers(currentPage, totalPages);

  return (
    <div className="mt-10 flex items-center justify-center gap-1">
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="border-brand-mist hover:border-brand-iron text-brand-iron hover:text-brand-black inline-flex h-9 items-center justify-center border px-3 font-mono text-xs font-bold transition"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          ← Anterior
        </Link>
      )}

      {pageNumbers.map((n, i) =>
        n === '...' ? (
          <span key={`gap-${i}`} className="text-brand-mist px-2 font-mono text-xs">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={buildUrl(n)}
            className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center border px-2 font-mono text-xs font-bold transition ${
              n === currentPage
                ? 'bg-brand-black border-brand-black text-brand-yellow'
                : 'bg-brand-white border-brand-mist text-brand-iron hover:border-brand-iron hover:text-brand-black'
            }`}
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            {n}
          </Link>
        ),
      )}

      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="border-brand-mist hover:border-brand-iron text-brand-iron hover:text-brand-black inline-flex h-9 items-center justify-center border px-3 font-mono text-xs font-bold transition"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          Próxima →
        </Link>
      )}
    </div>
  );
}

function computePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const result: (number | '...')[] = [];
  result.push(1);
  if (current > 3) result.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) result.push(i);
  if (current < total - 2) result.push('...');
  result.push(total);
  return result;
}
