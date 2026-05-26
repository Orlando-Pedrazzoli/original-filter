/* ══════════════════════════════════════════
   RelatedProducts — Original Filter
   ──────────────────────────────────────────
   Mostra 4 produtos da mesma categoria, excluindo o atual.
   Pulla via /api/products?categoria=... e filtra o slug atual.
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard, type ProductCardData } from '@/components/products/product-card';

interface ApiResponse {
  items: ProductCardData[];
}

interface RelatedProductsProps {
  category: string;
  currentSlug: string;
  categoryLabel?: string;
}

export function RelatedProducts({ category, currentSlug, categoryLabel }: RelatedProductsProps) {
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    fetch(`/api/products?categoria=${encodeURIComponent(category)}&limit=8`)
      .then((r) => r.json())
      .then((d: ApiResponse) => {
        const filtered = (d.items ?? []).filter((p) => p.slug !== currentSlug).slice(0, 4);
        setProducts(filtered);
      })
      .catch(() => {});
  }, [category, currentSlug]);

  if (products.length === 0) return null;

  const niceCategory =
    categoryLabel ?? category.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

  return (
    <section className="bg-brand-white border-brand-mist border-t py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-brand-yellow h-px w-8" />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Mais da categoria
              </span>
            </div>
            <h2
              className="font-display text-brand-black font-black"
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                letterSpacing: '-0.025em',
              }}
            >
              {niceCategory}
            </h2>
          </div>
          <Link
            href={`/produtos?categoria=${category}`}
            className="border-brand-mist hover:border-brand-black font-display inline-flex items-center gap-2 border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            Ver todos
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.sku} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
