/* ══════════════════════════════════════════
   ProductGrid — Original Filter
   ──────────────────────────────────────────
   Grid responsivo de produtos.
   - Mobile: 2 colunas
   - Tablet: 3 colunas
   - Desktop: 4 colunas
   ══════════════════════════════════════════ */

'use client';

import { ProductCard, type ProductCardData } from './product-card';

interface ProductGridProps {
  products: ProductCardData[];
  loading?: boolean;
  /** Quantos skeletons exibir durante loading */
  skeletonCount?: number;
}

export function ProductGrid({ products, loading = false, skeletonCount = 8 }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.sku} product={p} />
      ))}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div
      className="bg-brand-white border-brand-mist overflow-hidden border"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <div className="bg-brand-snow aspect-[4/3] animate-pulse" />
      <div className="border-brand-mist space-y-3 border-t p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="bg-brand-snow h-3 w-16 animate-pulse" />
          <div className="bg-brand-snow h-2.5 w-12 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <div className="bg-brand-snow h-4 w-full animate-pulse" />
          <div className="bg-brand-snow h-4 w-3/4 animate-pulse" />
        </div>
        <div className="bg-brand-snow h-3 w-20 animate-pulse" />
        <div className="border-brand-mist border-t pt-3">
          <div className="bg-brand-snow h-6 w-24 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
