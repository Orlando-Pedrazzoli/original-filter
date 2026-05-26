/* ══════════════════════════════════════════
   LaunchesGrid — Original Filter
   ──────────────────────────────────────────
   Grid de outros lançamentos (não-sensores).
   Usa o ProductCard padrão para manter consistência com o catálogo.
   ══════════════════════════════════════════ */

'use client';

import Link from 'next/link';
import { Filter, ArrowRight, PackageSearch } from 'lucide-react';
import { ProductCard, type ProductCardData } from '@/components/products/product-card';

interface LaunchesGridProps {
  products: ProductCardData[];
}

export function LaunchesGrid({ products }: LaunchesGridProps) {
  if (products.length === 0) {
    return null; // Nada para mostrar, esconde a seção
  }

  return (
    <section className="bg-brand-snow py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        {/* Header */}
        <div className="mb-10 grid grid-cols-1 items-end gap-6 md:mb-14 md:grid-cols-12">
          <div className="md:col-span-8">
            <div className="mb-4 flex items-center gap-3">
              <Filter className="text-brand-iron size-4" strokeWidth={2} />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Filtros e acessórios
              </span>
            </div>
            <h2
              className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '-0.035em',
              }}
            >
              Outros lançamentos
              <br />
              <span className="text-brand-yellow-deep">da linha Original Filter.</span>
            </h2>
          </div>

          <div className="md:col-span-4 md:text-right">
            <div className="text-brand-iron font-mono text-[10px] tracking-[0.22em] uppercase">
              Produtos novos
            </div>
            <div
              className="font-display text-brand-black mt-1 leading-none font-black"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                letterSpacing: '-0.035em',
              }}
            >
              {String(products.length).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/produtos"
            className="bg-brand-black hover:bg-brand-graphite font-display inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold tracking-wide text-white uppercase transition"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <PackageSearch className="size-4" />
            Explorar catálogo completo
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
