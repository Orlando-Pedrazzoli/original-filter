'use client';

import { MAIN_BRANDS } from '@/lib/constants';

/* ══════════════════════════════════════════
   Original Filter — Brands Carousel
   Infinite scroll with manufacturer logos
   Adapted from shadcn integration-hero
   ══════════════════════════════════════════ */

// Extended list of brands for a fuller carousel
const ALL_BRANDS = [
  ...MAIN_BRANDS.map((b) => b.name),
  'Caterpillar',
  'John Deere',
  'Cummins',
  'New Holland',
  'Case',
  'Massey Ferguson',
  'Renault Trucks',
];

// Repeat brands enough times for seamless infinite loop
const repeated = (items: string[], times = 4) =>
  Array.from({ length: times }).flatMap(() => items);

const CAROUSEL_CSS = `
  @keyframes scroll-left {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes scroll-right {
    0% { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
  .brands-scroll-left {
    animation: scroll-left 40s linear infinite;
  }
  .brands-scroll-right {
    animation: scroll-right 40s linear infinite;
  }
  .brands-scroll-left:hover,
  .brands-scroll-right:hover {
    animation-play-state: paused;
  }
`;

// Split brands into two rows
const ROW_1 = ALL_BRANDS.slice(0, Math.ceil(ALL_BRANDS.length / 2));
const ROW_2 = ALL_BRANDS.slice(Math.ceil(ALL_BRANDS.length / 2));

export default function BrandsCarousel() {
  return (
    <section className="relative overflow-hidden border-b border-surface-alt bg-white py-10">
      <style dangerouslySetInnerHTML={{ __html: CAROUSEL_CSS }} />

      {/* Title */}
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Filtros para as principais montadoras
      </p>

      {/* Carousel container */}
      <div className="relative">
        {/* Row 1 — scrolls left */}
        <div className="flex gap-6 whitespace-nowrap brands-scroll-left">
          {repeated(ROW_1, 6).map((brand, i) => (
            <div
              key={`r1-${i}`}
              className="flex h-14 flex-shrink-0 items-center justify-center rounded-xl border border-surface-alt bg-surface/50 px-8 transition-all hover:border-brand/30 hover:shadow-md hover:shadow-brand/5"
            >
              <span className="text-sm font-bold uppercase tracking-wider text-muted-dark">
                {brand}
              </span>
            </div>
          ))}
        </div>

        {/* Row 2 — scrolls right (inverted) */}
        <div className="mt-4 flex gap-6 whitespace-nowrap brands-scroll-right">
          {repeated(ROW_2, 6).map((brand, i) => (
            <div
              key={`r2-${i}`}
              className="flex h-14 flex-shrink-0 items-center justify-center rounded-xl border border-surface-alt bg-surface/50 px-8 transition-all hover:border-brand/30 hover:shadow-md hover:shadow-brand/5"
            >
              <span className="text-sm font-bold uppercase tracking-wider text-muted-dark">
                {brand}
              </span>
            </div>
          ))}
        </div>

        {/* Fade overlays — match bg-white */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}