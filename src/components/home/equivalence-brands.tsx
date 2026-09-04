// src/components/home/equivalence-brands.tsx
/* ══════════════════════════════════════════
   EquivalenceBrands — Original Filter
   ──────────────────────────────────────────
   Prova de cobertura: as marcas mais frequentes nas referências
   cruzadas do catálogo, com a contagem real de códigos que a
   Original Filter substitui de cada uma (via /api/stats).

   Nota jurídica no rodapé da seção: marcas citadas apenas como
   referência de equivalência — prática padrão do setor de
   reposição (aftermarket).
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CatalogStats } from '@/lib/search-types';

export function EquivalenceBrands() {
  const [stats, setStats] = useState<CatalogStats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d: CatalogStats) => setStats(d))
      .catch(() => {});
  }, []);

  const brands = stats?.topEquivalenceBrands ?? [];
  if (stats && brands.length === 0) return null;

  return (
    <section className="bg-brand-white border-brand-mist border-t">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-12 md:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Coluna de contexto */}
          <div className="lg:col-span-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-brand-yellow h-px w-8" />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Cobertura de mercado
              </span>
            </div>
            <h2
              className="font-display text-brand-black font-black"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', letterSpacing: '-0.025em' }}
            >
              Já compra outra marca? Nós temos o equivalente.
            </h2>
            <p className="text-brand-iron mt-4 leading-relaxed">
              {stats ? (
                <>
                  São{' '}
                  <span className="text-brand-black font-bold">
                    {stats.totalCrossReferences.toLocaleString('pt-BR')} referências cruzadas
                  </span>{' '}
                  de{' '}
                  <span className="text-brand-black font-bold">
                    {stats.equivalenceBrandCount} fabricantes
                  </span>{' '}
                  mapeadas no nosso catálogo. Busque pelo código que você já conhece.
                </>
              ) : (
                'Milhares de referências cruzadas mapeadas no nosso catálogo. Busque pelo código que você já conhece.'
              )}
            </p>
            <Link
              href="/cross-reference"
              className="text-brand-black hover:text-brand-yellow-deep group mt-5 inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase transition"
            >
              Converter um código agora
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </Link>
          </div>

          {/* Grade de marcas */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(stats ? brands : Array.from({ length: 12 })).map((b, i) => {
                const brand = b as { name: string; count: number } | undefined;
                return (
                  <div
                    key={brand?.name ?? i}
                    className="border-brand-mist bg-brand-snow flex items-baseline justify-between gap-2 border px-3.5 py-3"
                    style={{ borderRadius: 'var(--radius-edge)' }}
                  >
                    {brand ? (
                      <>
                        <span className="text-brand-black truncate font-mono text-xs font-bold tracking-wider uppercase">
                          {brand.name}
                        </span>
                        <span className="text-brand-steel shrink-0 font-mono text-[10px]">
                          {brand.count} cód.
                        </span>
                      </>
                    ) : (
                      <span className="h-4 w-24 animate-pulse bg-black/10" />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-brand-steel mt-4 text-[11px] leading-relaxed">
              As marcas citadas pertencem aos seus respectivos titulares e são mencionadas
              exclusivamente como referência de equivalência técnica entre códigos de filtros.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
