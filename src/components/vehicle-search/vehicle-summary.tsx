// src/components/vehicle-search/vehicle-summary.tsx
/* ══════════════════════════════════════════
   VehicleSummary — Original Filter
   ──────────────────────────────────────────
   Card de resumo dos resultados da busca por veículo.
   - Mostra o veículo selecionado em destaque
   - KPIs por categoria (X filtros de ar, Y filtros de óleo, etc.)
   - Botão "Refazer busca" para limpar query
   ══════════════════════════════════════════ */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { O_PATTERN_DARK } from '@/lib/brand-pattern';
import {
  Truck,
  RotateCcw,
  Wind,
  Droplets,
  Fuel,
  Filter as FilterIcon,
  Cog,
  Activity,
  Wrench,
} from 'lucide-react';

interface VehicleQuery {
  brand: string;
  model: string | null;
  engine: string | null;
  year: number | null;
}

interface VehicleSummaryProps {
  query: VehicleQuery;
  total: number;
  byCategory: Record<string, number>;
}

/** Ícone amigável por categoria (fallback Wrench). */
function categoryIcon(slug: string): React.ElementType {
  if (slug.includes('ar-cabine') || slug.includes('cabine')) return Wind;
  if (slug.includes('ar')) return Wind;
  if (slug.includes('oleo')) return Droplets;
  if (slug.includes('combustivel')) return Fuel;
  if (slug.includes('separador')) return FilterIcon;
  if (slug.includes('hidraulic')) return Cog;
  if (slug.includes('sensor')) return Activity;
  return Wrench;
}

function prettyCategory(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function VehicleSummary({ query, total, byCategory }: VehicleSummaryProps) {
  const entries = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  return (
    <section className="bg-brand-black relative overflow-hidden text-white">
      {/* Grid blueprint sutil */}
      <div aria-hidden className="absolute inset-0" style={O_PATTERN_DARK} />

      <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-12 md:py-14">
        {/* Header com veículo selecionado */}
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Truck className="text-brand-yellow size-4" strokeWidth={2} />
              <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
                Veículo selecionado
              </span>
            </div>
            <h2
              className="font-display leading-[1] font-black tracking-tight"
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
                letterSpacing: '-0.03em',
              }}
            >
              {query.brand}
              {query.model && (
                <>
                  {' '}
                  <span className="text-brand-yellow">{query.model}</span>
                </>
              )}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs tracking-widest text-white/60 uppercase">
              {query.engine && (
                <span>
                  Motor: <span className="font-bold text-white">{query.engine}</span>
                </span>
              )}
              {query.year && (
                <>
                  {query.engine && <div className="h-3 w-px bg-white/20" />}
                  <span>
                    Ano: <span className="font-bold text-white">{query.year}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-end gap-4">
            <div>
              <div className="text-brand-yellow mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
                Compatíveis
              </div>
              <div
                className="font-display leading-none font-black text-white"
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  letterSpacing: '-0.04em',
                }}
              >
                {total}
              </div>
            </div>
            <Link
              href="/buscar-por-veiculo"
              className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex items-center gap-2 border border-white/20 px-4 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-white uppercase transition"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <RotateCcw className="size-3.5" />
              Refazer busca
            </Link>
          </div>
        </div>

        {/* KPIs por categoria */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-6">
            {entries.slice(0, 6).map(([slug, count], i) => (
              <CategoryKPI key={slug} slug={slug} count={count} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryKPI({ slug, count, index }: { slug: string; count: number; index: number }) {
  const Icon = categoryIcon(slug);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-brand-black hover:bg-brand-graphite p-4 transition md:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="bg-brand-yellow/10 text-brand-yellow flex size-9 shrink-0 items-center justify-center">
          <Icon className="size-4" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="font-display text-2xl leading-none font-black tracking-tight text-white">
            {count}
          </div>
          <div className="mt-1 truncate font-mono text-[10px] tracking-widest text-white/60 uppercase">
            {prettyCategory(slug)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
