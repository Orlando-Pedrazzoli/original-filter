/* ══════════════════════════════════════════
   FeaturedPatented — Original Filter
   ──────────────────────────────────────────
   Destaca os 8 produtos patenteados — diferencial competitivo da marca.
   Pulla via /api/products?isPatented=true (já existe na API).
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Award, ArrowRight, Sparkles } from 'lucide-react';

interface PatentedProduct {
  sku: string;
  slug: string;
  title: string;
  category: string;
  productType: string;
  primaryImage: string | null;
}

interface ApiResponse {
  items: Array<{
    sku: string;
    slug: string;
    title: string;
    category: string;
    productType: string;
    primaryImage: string | null;
    isPatented: boolean;
  }>;
}

export function FeaturedPatented() {
  const [products, setProducts] = useState<PatentedProduct[]>([]);

  useEffect(() => {
    fetch('/api/products?isPatented=true&limit=8')
      .then((r) => r.json())
      .then((d: ApiResponse) => {
        setProducts(
          (d.items ?? [])
            .filter((p) => p.isPatented)
            .slice(0, 8)
            .map(({ sku, slug, title, category, productType, primaryImage }) => ({
              sku,
              slug,
              title,
              category,
              productType,
              primaryImage,
            })),
        );
      })
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="bg-brand-graphite relative overflow-hidden py-20 text-white md:py-28">
      {/* Padrão hexagonal sutil */}
      <svg
        className="pointer-events-none absolute top-0 right-0 bottom-0 w-1/3 opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMaxYMid slice"
      >
        <defs>
          <pattern id="hexp-pat" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon
              points="30,3 56,18 56,42 30,57 4,42 4,18"
              fill="none"
              stroke="#FFD700"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexp-pat)" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 md:px-12">
        {/* Header */}
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Award className="text-brand-yellow size-4" strokeWidth={2} />
              <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
                Linha Patenteada · tecnologia exclusiva
              </span>
            </div>
            <h2
              className="font-display max-w-2xl leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Patentes próprias.
              <br />
              <span className="text-brand-yellow">Performance única.</span>
            </h2>
            <p className="mt-5 max-w-xl text-white/60">
              Soluções desenvolvidas pelo nosso Centro de Pesquisa & Desenvolvimento, registradas no
              INPI e únicas no mercado de reposição brasileiro.
            </p>
          </div>
          <Link
            href="/lancamentos"
            className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex items-center gap-2 border border-white/20 px-5 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-white uppercase transition"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            Ver lançamentos
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Grid de produtos */}
        <div className="grid grid-cols-2 gap-px bg-white/5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <PatentedCard key={p.sku} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PatentedCard({ product, index }: { product: PatentedProduct; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link
        href={`/produtos/${product.slug}`}
        className="group bg-brand-black hover:bg-brand-graphite relative flex aspect-square flex-col p-5 transition-colors md:p-6"
      >
        {/* Badge PATENTEADO */}
        <div className="mb-3 flex items-center justify-between">
          <div className="bg-brand-yellow text-brand-black inline-flex items-center gap-1 px-2 py-0.5">
            <Sparkles className="size-2.5" strokeWidth={2.5} />
            <span className="font-mono text-[9px] font-bold tracking-widest uppercase">
              Patenteado
            </span>
          </div>
        </div>

        {/* Imagem do produto */}
        <div className="relative my-3 flex flex-1 items-center justify-center">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="font-mono text-xs tracking-widest text-white/20 uppercase">
              Imagem em breve
            </div>
          )}
        </div>

        {/* SKU + título */}
        <div className="space-y-1.5">
          <div className="text-brand-yellow font-mono text-xs tracking-wider">{product.sku}</div>
          <div className="line-clamp-2 text-xs leading-snug text-white/80 transition-colors group-hover:text-white md:text-sm">
            {product.title
              .replace(product.sku, '')
              .replace(/^\s*-?\s*/, '')
              .trim()}
          </div>
        </div>

        {/* Hover indicator */}
        <div className="bg-brand-yellow absolute right-0 bottom-0 left-0 h-0.5 origin-left scale-x-0 transition-transform group-hover:scale-x-100" />
      </Link>
    </motion.div>
  );
}
