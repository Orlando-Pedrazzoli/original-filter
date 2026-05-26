/* ══════════════════════════════════════════
   /produtos/[slug] — Detalhe do produto
   ──────────────────────────────────────────
   Server Component. Busca direto no MongoDB para SEO,
   gera metadata dinâmico e renderiza:
   - Galeria de imagens (client)
   - ProductInfo (client com state de quantidade)
   - Specs técnicas (server)
   - Tabela de aplicações (client com filtro)
   - Códigos OEM (client com copy-to-clipboard)
   - Produtos relacionados (client com fetch)
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Brand from '@/models/Brand';
import { auth } from '@/lib/auth';
import type { DiscountTier, UserRole } from '@/types';

import { ProductGallery } from '@/components/product-detail/product-gallery';
import { ProductInfo } from '@/components/product-detail/product-info';
import { ProductSpecs } from '@/components/product-detail/product-specs';
import { ProductApplications } from '@/components/product-detail/product-applications';
import { ProductOemCodes } from '@/components/product-detail/product-oem-codes';
import { RelatedProducts } from '@/components/product-detail/related-products';
import { cleanProductTitle } from '@/utils/format';

interface PageParams {
  params: Promise<{ slug: string }>;
}

interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface ProductApplication {
  brand: string;
  model: string;
  engine?: string;
  yearStart?: number;
  yearEnd?: number;
}

interface ProductData {
  _id: { toString(): string };
  sku: string;
  slug: string;
  productType: string;
  category: string;
  title: string;
  description: string;
  shortDescription?: string;
  retailPrice: number;
  weight: number;
  dimensions: { height: number; width: number; depth: number };
  applications: ProductApplication[];
  oemCodes: string[];
  status: string;
  isPatented: boolean;
  isNewRelease: boolean;
  images: ProductImage[];
  replacedBy?: { sku: string; slug: string; title: string } | null;
}

async function getProduct(slug: string) {
  await dbConnect();
  // Toca em Brand para registrar schema (evita warning de populate)
  void Brand;

  const product = (await Product.findOne({ slug })
    .populate('replacedBy', 'sku slug title')
    .lean()) as unknown as ProductData | null;

  return product;
}

function applyDiscount(
  retailPrice: number,
  role: UserRole | 'guest',
  tier: DiscountTier,
): { finalPrice: number; appliedTier: DiscountTier } {
  if (role === 'reseller' && tier > 0) {
    const factor = 1 - tier / 100;
    return {
      finalPrice: Math.round(retailPrice * factor * 100) / 100,
      appliedTier: tier,
    };
  }
  return { finalPrice: retailPrice, appliedTier: 0 };
}

// ─── Metadata dinâmico (SEO crítico para o produto) ───
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Produto não encontrado',
    };
  }

  const cleanTitle = cleanProductTitle(product.title, product.sku);
  const title = `${product.sku} — ${cleanTitle || product.title}`;
  const desc =
    product.shortDescription ||
    product.description?.slice(0, 160) ||
    `Filtro ${product.sku} Original Filter com ${product.applications?.length ?? 0} aplicações automotivas.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'website',
      images: product.images?.[0]?.url
        ? [
            {
              url: product.images[0].url,
              alt: product.images[0].alt || cleanTitle,
            },
          ]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const session = await auth();
  const role: UserRole | 'guest' = session?.user?.role ?? 'guest';
  const tier: DiscountTier = session?.user?.discountTier ?? 0;

  const { finalPrice, appliedTier } = applyDiscount(product.retailPrice, role, tier);

  // Fire-and-forget: incrementa viewCount
  Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } }).catch((e) =>
    console.error('viewCount inc fail:', e),
  );

  const cleanTitle = cleanProductTitle(product.title, product.sku);

  return (
    <>
      {/* ─── Breadcrumb + back link ─── */}
      <div className="bg-brand-snow border-brand-mist border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-12">
          <nav className="flex flex-wrap items-center gap-1 font-mono text-xs tracking-widest uppercase">
            <Link href="/" className="text-brand-steel hover:text-brand-yellow-deep transition">
              Início
            </Link>
            <span className="text-brand-mist">/</span>
            <Link
              href="/produtos"
              className="text-brand-steel hover:text-brand-yellow-deep transition"
            >
              Catálogo
            </Link>
            <span className="text-brand-mist">/</span>
            <Link
              href={`/produtos?categoria=${product.category}`}
              className="text-brand-steel hover:text-brand-yellow-deep transition"
            >
              {product.category.replace(/-/g, ' ')}
            </Link>
            <span className="text-brand-mist">/</span>
            <span className="text-brand-yellow-deep truncate">{product.sku}</span>
          </nav>
          <Link
            href="/produtos"
            className="text-brand-iron hover:text-brand-black flex items-center gap-1 text-xs whitespace-nowrap transition"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Voltar ao catálogo</span>
          </Link>
        </div>
      </div>

      {/* ─── Galeria + Info principal ─── */}
      <section className="bg-brand-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-12 md:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <ProductGallery
              images={product.images ?? []}
              productName={cleanTitle || product.title}
              sku={product.sku}
            />
            <ProductInfo
              sku={product.sku}
              title={product.title}
              shortDescription={product.shortDescription}
              description={product.description}
              category={product.category}
              productType={product.productType}
              retailPrice={product.retailPrice}
              finalPrice={finalPrice}
              appliedDiscountTier={appliedTier}
              appliedRole={role}
              status={product.status}
              isPatented={product.isPatented}
              isNewRelease={product.isNewRelease}
              replacedBy={product.replacedBy ?? null}
              applicationsCount={product.applications?.length ?? 0}
            />
          </div>
        </div>
      </section>

      {/* ─── Descrição completa (se houver e for diferente do shortDescription) ─── */}
      {product.description && product.description.length > 0 && (
        <section className="bg-brand-white border-brand-mist border-t">
          <div className="mx-auto max-w-7xl px-4 py-12 md:px-12 md:py-16">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <div className="mb-3 flex items-center gap-3">
                  <div className="bg-brand-yellow h-px w-8" />
                  <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                    Sobre o produto
                  </span>
                </div>
                <h2
                  className="font-display text-brand-black font-black"
                  style={{
                    fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Detalhes técnicos.
                </h2>
              </div>
              <div className="lg:col-span-9">
                <div className="prose prose-neutral text-brand-iron max-w-none leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Especificações ─── */}
      <section className="bg-brand-white border-brand-mist border-t">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <ProductSpecs
            weight={product.weight}
            dimensions={product.dimensions}
            productType={product.productType}
            category={product.category}
            sku={product.sku}
          />
        </div>
      </section>

      {/* ─── Aplicações ─── */}
      <section className="bg-brand-snow border-brand-mist border-t">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <ProductApplications applications={product.applications ?? []} productSku={product.sku} />
        </div>
      </section>

      {/* ─── Códigos OEM (cross-reference reverso) ─── */}
      <ProductOemCodes oemCodes={product.oemCodes ?? []} productSku={product.sku} />

      {/* ─── Produtos relacionados ─── */}
      <RelatedProducts category={product.category} currentSlug={product.slug} />
    </>
  );
}
