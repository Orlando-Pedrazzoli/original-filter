// src/app/(site)/produtos/categoria/[slug]/page.tsx
/* ══════════════════════════════════════════
   /produtos/categoria/[slug] — Página de Categoria
   ──────────────────────────────────────────
   Server Component (SEO-first): conteúdo institucional da
   categoria (textos oficiais do Gabriel em category-content.ts)
   + listagem dos produtos ativos da categoria renderizada no
   servidor, direto do MongoDB.

   Categorias sem texto cadastrado exibem só a listagem.
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { FILTER_CATEGORIES, SENSOR_CATEGORIES, ACCESSORY_CATEGORIES } from '@/lib/constants';
import { CATEGORY_CONTENT } from '@/lib/data/category-content';
import { ProductGrid } from '@/components/products/product-grid';
import type { ProductCardData } from '@/components/products/product-card';

// Revalida a listagem a cada hora (catálogo muda pouco)
export const revalidate = 3600;

interface PageParams {
  params: Promise<{ slug: string }>;
}

const ALL_CATEGORIES = [...FILTER_CATEGORIES, ...SENSOR_CATEGORIES, ...ACCESSORY_CATEGORIES];

function getCategoryName(slug: string): string | null {
  return ALL_CATEGORIES.find((c) => c.slug === slug)?.name ?? null;
}

interface LeanProduct {
  sku: string;
  slug: string;
  title: string;
  category: string;
  productType: string;
  images?: { url: string; isPrimary: boolean }[];
  retailPrice: number;
  isPatented: boolean;
  isNewRelease: boolean;
  status: string;
  applications?: unknown[];
}

async function getCategoryProducts(slug: string): Promise<ProductCardData[]> {
  await dbConnect();
  const products = (await Product.find(
    { category: slug, status: 'active' },
    {
      sku: 1,
      slug: 1,
      title: 1,
      category: 1,
      productType: 1,
      images: 1,
      retailPrice: 1,
      isPatented: 1,
      isNewRelease: 1,
      status: 1,
      applications: 1,
    },
  )
    .sort({ sku: 1 })
    .lean()) as unknown as LeanProduct[];

  return products.map((p) => ({
    sku: p.sku,
    slug: p.slug,
    title: p.title,
    category: p.category,
    productType: p.productType,
    primaryImage: p.images?.find((img) => img.isPrimary)?.url ?? p.images?.[0]?.url ?? null,
    retailPrice: p.retailPrice,
    finalPrice: p.retailPrice,
    discountTier: 0,
    isPatented: p.isPatented,
    isNewRelease: p.isNewRelease,
    status: p.status,
    applicationsCount: p.applications?.length ?? 0,
  }));
}

// ─── Metadata dinâmico ───
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const content = CATEGORY_CONTENT[slug];
  const name = getCategoryName(slug);

  if (!name) return { title: 'Categoria não encontrada' };

  return {
    title: content?.pageTitle ?? `${name} — Original Filter`,
    description:
      content?.metaDescription ??
      `Catálogo de ${name} Original Filter: qualidade superior em filtros automotivos, agrícolas e industriais.`,
  };
}

export default async function CategoriaPage({ params }: PageParams) {
  const { slug } = await params;
  const name = getCategoryName(slug);
  if (!name) notFound();

  const content = CATEGORY_CONTENT[slug];
  const products = await getCategoryProducts(slug);

  return (
    <>
      {/* ─── Hero da categoria (preto, contínuo com o navbar) ─── */}
      <section className="bg-brand-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-12 md:py-16">
          <nav className="mb-5 flex flex-wrap items-center gap-1 font-mono text-xs tracking-widest uppercase">
            <Link href="/" className="text-white/50 transition hover:text-white">
              Início
            </Link>
            <span className="text-white/30">/</span>
            <Link href="/produtos" className="text-white/50 transition hover:text-white">
              Catálogo
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-brand-yellow">{name}</span>
          </nav>
          <h1
            className="font-display font-black"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
          >
            {content?.pageTitle ?? name}
          </h1>
          {content && (
            <p className="mt-5 max-w-3xl leading-relaxed text-white/70 md:text-lg">
              {content.intro}
            </p>
          )}
        </div>
        <div className="bg-brand-yellow h-0.5" />
      </section>

      {/* ─── Conteúdo institucional ─── */}
      {content && (
        <section className="bg-brand-white">
          <div className="mx-auto max-w-7xl px-4 py-12 md:px-12 md:py-16">
            {/* Por que é importante */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="bg-brand-yellow h-px w-8" />
                  <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                    Função no motor
                  </span>
                </div>
                <h2
                  className="font-display text-brand-black font-black"
                  style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.9rem)', letterSpacing: '-0.02em' }}
                >
                  {content.whyTitle}
                </h2>
              </div>
              <div className="lg:col-span-8">
                <ol className="space-y-5">
                  {content.whyItems.map((item, i) => (
                    <li key={item.title} className="flex gap-4">
                      <span
                        className="bg-brand-yellow text-brand-black font-display flex size-8 shrink-0 items-center justify-center text-sm font-black"
                        style={{ borderRadius: 'var(--radius-edge)' }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-brand-black font-display font-bold">{item.title}</div>
                        <p className="text-brand-iron mt-1 leading-relaxed">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Vantagens */}
            <div className="border-brand-mist mt-14 border-t pt-12">
              <div className="mb-8">
                <div className="mb-3 flex items-center gap-3">
                  <div className="bg-brand-yellow h-px w-8" />
                  <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                    Diferenciais
                  </span>
                </div>
                <h2
                  className="font-display text-brand-black font-black"
                  style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.9rem)', letterSpacing: '-0.02em' }}
                >
                  {content.advantagesTitle}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {content.advantages.map((adv) => (
                  <div
                    key={adv.title}
                    className="border-brand-mist bg-brand-snow border p-5"
                    style={{ borderRadius: 'var(--radius-edge)' }}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className="text-brand-yellow-deep mt-0.5 size-5 shrink-0"
                        strokeWidth={2}
                      />
                      <div>
                        <div className="text-brand-black font-display font-bold">{adv.title}</div>
                        <p className="text-brand-iron mt-1 text-sm leading-relaxed">{adv.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manutenção */}
            {content.maintenanceTitle && content.maintenanceText && (
              <div
                className="border-brand-yellow bg-brand-snow mt-12 border-l-4 p-6 md:p-8"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <h2 className="font-display text-brand-black text-lg font-black">
                  {content.maintenanceTitle}
                </h2>
                <p className="text-brand-iron mt-2 max-w-3xl leading-relaxed">
                  {content.maintenanceText}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Produtos da categoria ─── */}
      <section className="bg-brand-white border-brand-mist border-t">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-12 md:py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-brand-yellow h-px w-8" />
                <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                  Catálogo
                </span>
              </div>
              <h2
                className="font-display text-brand-black font-black"
                style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.9rem)', letterSpacing: '-0.02em' }}
              >
                {name}: {products.length} {products.length === 1 ? 'produto' : 'produtos'}
              </h2>
            </div>
            <Link
              href={`/produtos?categoria=${slug}`}
              className="text-brand-black hover:text-brand-yellow-deep group inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase transition"
            >
              Ver no catálogo com filtros
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </Link>
          </div>

          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <p className="text-brand-iron">
              Nenhum produto ativo nesta categoria no momento.{' '}
              <Link href="/produtos" className="text-brand-black underline underline-offset-2">
                Ver catálogo completo
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      {/* ─── Fechamento institucional ─── */}
      {content && content.closingBlocks.length > 0 && (
        <section className="bg-brand-black text-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 md:grid-cols-2 md:px-12 md:py-20">
            {content.closingBlocks.map((block) => (
              <div key={block.title}>
                <h2
                  className="font-display font-black"
                  style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.6rem)', letterSpacing: '-0.02em' }}
                >
                  {block.title}
                </h2>
                <p className="mt-3 leading-relaxed text-white/70">{block.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
