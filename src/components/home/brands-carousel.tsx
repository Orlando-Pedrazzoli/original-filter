/* ══════════════════════════════════════════
   BrandsCarousel — Original Filter
   ──────────────────────────────────────────
   Marquee horizontal infinito com as 22 montadoras suportadas.
   Como ainda não temos logos das marcas no Cloudinary, exibimos
   os nomes em tipografia industrial. Quando o Gabriel mandar os
   logos, substituir o texto pelo <Image>.
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { VehicleBrandOption } from '@/lib/search-types';

export function BrandsCarousel() {
  const [brands, setBrands] = useState<VehicleBrandOption[]>([]);

  useEffect(() => {
    fetch('/api/vehicle-selector/brands')
      .then((r) => r.json())
      .then((d: { brands: VehicleBrandOption[] }) => {
        setBrands(d.brands ?? []);
      })
      .catch(() => {});
  }, []);

  if (brands.length === 0) return null;

  // Duplica para criar loop infinito sem corte
  const doubled = [...brands, ...brands];

  return (
    <section className="bg-brand-white border-brand-mist overflow-hidden border-y py-16 md:py-20">
      <div className="mx-auto mb-10 max-w-7xl px-4 md:px-12">
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-brand-yellow h-px w-8" />
          <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
            Marcas atendidas
          </span>
        </div>
        <h2
          className="font-display text-brand-black font-black"
          style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            letterSpacing: '-0.03em',
          }}
        >
          {brands.length} montadoras{' '}
          <span className="text-brand-iron font-light">cobertas no catálogo.</span>
        </h2>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* Fade nas pontas */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-24 md:w-40"
          style={{
            background: 'linear-gradient(to right, #FFFFFF 0%, rgba(255,255,255,0) 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-24 md:w-40"
          style={{
            background: 'linear-gradient(to left, #FFFFFF 0%, rgba(255,255,255,0) 100%)',
          }}
        />

        <div className="animate-marquee flex whitespace-nowrap">
          {doubled.map((brand, i) => (
            <Link
              key={`${brand.slug}-${i}`}
              href={`/produtos/marca/${brand.slug}`}
              className="group border-brand-mist hover:border-brand-yellow hover:bg-brand-snow mx-2 inline-flex h-20 min-w-[180px] items-center justify-center border px-6 transition md:h-24 md:min-w-[220px]"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <span
                className="font-display text-brand-iron group-hover:text-brand-black text-center text-sm font-bold tracking-wide uppercase transition-colors md:text-base"
                style={{ letterSpacing: '0.05em' }}
              >
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 45s linear infinite;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
