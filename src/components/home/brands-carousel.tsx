/* ══════════════════════════════════════════
   BrandsCarousel — Original Filter
   ──────────────────────────────────────────
   Marquee horizontal infinito com as montadoras suportadas.
   - Auto-loop em TODAS as telas (desktop e mobile).
   - Pausa ao passar o mouse, focar por teclado, ou segurar o toque/clique
     (:has(a:active)), p/ quem quiser clicar numa marca.
   - prefers-reduced-motion: estático e rolável (a11y) — regra em globals.css.
   - O conteúdo é renderizado em 2 sets idênticos; translateX(-50%) costura
     o loop sem corte. IMPORTANTE: o track NÃO tem padding próprio — o -50%
     precisa equivaler a exatamente 1 set, e padding quebraria essa conta.
     O respiro das pontas vem dos gradientes de fade.
   - Catálogo pequeno: a técnica -50% só preenche a tela se 1 set já for
     mais largo que a viewport. Por isso, com poucas marcas, repetimos o
     array antes de montar os sets, evitando "vazio" antes do reset.

   Logos: enquanto não houver logos no Cloudinary, exibimos os nomes em
   tipografia industrial. Quando o Gabriel mandar, trocar o <span> por <Image>.
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { VehicleBrandOption } from '@/lib/search-types';

interface BrandsCarouselProps {
  /** Marcas vindas do servidor (Server Component). Sem prop, carrega via fetch. */
  initialBrands?: VehicleBrandOption[];
}

/* Abaixo deste número de marcas, 1 set pode não estourar a largura da tela,
   deixando um vazio no fim do ciclo. Repetimos o array para garantir overflow.
   ~8 itens × min-width 220px ≈ 1760px cobre a maioria dos desktops largos.
   Ajuste o limite se mudar o min-width do BrandItem. */
const MIN_BRANDS_FOR_FILL = 8;

export function BrandsCarousel({ initialBrands }: BrandsCarouselProps) {
  const [brands, setBrands] = useState<VehicleBrandOption[]>(initialBrands ?? []);

  useEffect(() => {
    if (initialBrands && initialBrands.length > 0) return;
    fetch('/api/vehicle-selector/brands')
      .then((r) => r.json())
      .then((d: { brands: VehicleBrandOption[] }) => setBrands(d.brands ?? []))
      .catch(() => {});
  }, [initialBrands]);

  if (brands.length === 0) return <BrandsSkeleton />;

  // Unidade de repetição do marquee. Cada "set" abaixo usa esta lista, então
  // os dois sets continuam idênticos e o translateX(-50%) segue exato.
  const loop = brands.length < MIN_BRANDS_FOR_FILL ? [...brands, ...brands] : brands;

  return (
    <section
      aria-labelledby="brands-heading"
      className="bg-brand-white border-brand-mist overflow-hidden border-y py-16 md:py-20"
    >
      <div className="mx-auto mb-10 max-w-7xl px-4 md:px-12">
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-brand-yellow h-px w-8" />
          <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
            Marcas atendidas
          </span>
        </div>
        <h2
          id="brands-heading"
          className="font-display text-brand-black font-black"
          style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', letterSpacing: '-0.03em' }}
        >
          {brands.length} montadoras{' '}
          <span className="text-brand-iron font-light">cobertas no catálogo.</span>
        </h2>
      </div>

      {/* Marquee */}
      <div className="of-marquee relative">
        {/* Fade nas pontas */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-16 md:w-40"
          style={{ background: 'linear-gradient(to right, #FFFFFF 0%, rgba(255,255,255,0) 100%)' }}
        />
        <div
          className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-16 md:w-40"
          style={{ background: 'linear-gradient(to left, #FFFFFF 0%, rgba(255,255,255,0) 100%)' }}
        />

        <div className="of-marquee-viewport">
          <ul
            className="of-marquee-track flex w-max list-none flex-nowrap items-center whitespace-nowrap"
            aria-label="Montadoras cobertas no catálogo"
          >
            {/* Set real — único visível p/ leitor de tela e Tab */}
            {loop.map((brand, i) => (
              <li key={`real-${brand.slug}-${i}`} className="of-marquee-item">
                <BrandItem brand={brand} />
              </li>
            ))}
            {/* Set clone — só p/ costurar o loop; invisível a SR/teclado */}
            {loop.map((brand, i) => (
              <li
                key={`clone-${brand.slug}-${i}`}
                className="of-marquee-item of-marquee-clone"
                aria-hidden="true"
                inert
              >
                <BrandItem brand={brand} tabIndex={-1} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── Item de marca ───
function BrandItem({ brand, tabIndex }: { brand: VehicleBrandOption; tabIndex?: number }) {
  return (
    <Link
      href={`/produtos/marca/${brand.slug}`}
      tabIndex={tabIndex}
      className="group border-brand-mist hover:border-brand-yellow hover:bg-brand-snow mx-2 inline-flex h-20 min-w-[160px] items-center justify-center border px-6 transition md:h-24 md:min-w-[220px]"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <span
        className="font-display text-brand-iron group-hover:text-brand-black text-center text-sm font-bold tracking-wide uppercase transition-colors md:text-base"
        style={{ letterSpacing: '0.05em' }}
      >
        {brand.name}
      </span>
    </Link>
  );
}

// ─── Skeleton (reserva espaço, evita CLS) ───
function BrandsSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="bg-brand-white border-brand-mist overflow-hidden border-y py-16 md:py-20"
    >
      <div className="mx-auto mb-10 max-w-7xl px-4 md:px-12">
        <div className="mb-3 h-3 w-32 animate-pulse bg-black/5" />
        <div className="h-8 w-72 animate-pulse bg-black/5" />
      </div>
      <div className="flex overflow-hidden px-4 md:px-12">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="mx-2 h-20 min-w-[160px] shrink-0 animate-pulse bg-black/5 md:h-24 md:min-w-[220px]"
            style={{ borderRadius: 'var(--radius-edge)' }}
          />
        ))}
      </div>
    </section>
  );
}
