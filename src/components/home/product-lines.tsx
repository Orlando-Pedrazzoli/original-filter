/* ══════════════════════════════════════════
   ProductLines — Original Filter
   ──────────────────────────────────────────
   4-5 cards grandes das linhas de aplicação.
   Pulla dados de /api/vehicle-selector/lines + /api/vehicle-selector/brands
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Truck, Sprout, Mountain, Car, Factory } from 'lucide-react';
import type { VehicleLine } from '@/lib/search-types';

const LINE_ICONS: Record<string, React.ElementType> = {
  rodoviario: Truck,
  agricola: Sprout,
  'maquinas-pesadas': Mountain,
  automotivo: Car,
  industrial: Factory,
};

export function ProductLines() {
  const [lines, setLines] = useState<VehicleLine[]>([]);

  useEffect(() => {
    fetch('/api/vehicle-selector/lines')
      .then((r) => r.json())
      .then((d: { lines: VehicleLine[] }) => setLines(d.lines ?? []))
      .catch(() => {});
  }, []);

  return (
    <section className="bg-brand-snow py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        {/* Cabeçalho de seção */}
        <div className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-brand-yellow h-px w-8" />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Linhas de aplicação
              </span>
            </div>
            <h2
              className="font-display text-brand-black max-w-2xl leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Especialistas em
              <br />
              <span className="text-brand-yellow-deep">cinco frentes.</span>
            </h2>
          </div>
          <p className="text-brand-iron max-w-md text-base md:text-lg">
            Filtros automotivos, agrícolas, industriais e fora-de-estrada. Linha completa de
            reposição para os mais exigentes fabricantes mundiais de veículos.
          </p>
        </div>

        {/* Grid de cards */}
        <div className="bg-brand-mist grid grid-cols-1 gap-px md:grid-cols-2 lg:grid-cols-3">
          {lines.map((line, i) => (
            <LineCard key={line.slug} line={line} index={i} />
          ))}

          {/* Card extra: ver tudo */}
          {lines.length > 0 && (
            <Link
              href="/produtos"
              className="group bg-brand-black hover:bg-brand-graphite relative p-8 text-white transition md:p-10"
            >
              <div className="flex h-full min-h-[260px] flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-yellow h-px w-8" />
                  <span className="text-brand-yellow font-mono text-[10px] tracking-[0.22em] uppercase">
                    Catálogo completo
                  </span>
                </div>
                <div>
                  <h3
                    className="font-display mt-6 text-3xl leading-none font-black md:text-4xl"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    Veja todos
                    <br />
                    os produtos
                  </h3>
                  <div className="font-display text-brand-yellow mt-6 inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase transition-all group-hover:gap-3">
                    Acessar catálogo
                    <ArrowUpRight className="size-4" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function LineCard({ line, index }: { line: VehicleLine; index: number }) {
  const Icon = LINE_ICONS[line.slug] ?? Truck;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link
        href={`/produtos?linha=${line.slug}`}
        className="group bg-brand-white hover:bg-brand-paper relative flex h-full min-h-[260px] flex-col justify-between p-8 transition-colors md:p-10"
      >
        {/* Faixa amarela vertical à esquerda */}
        <div className="bg-brand-yellow absolute top-0 bottom-0 left-0 w-1 opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Ícone grande no canto */}
        <div className="mb-6 flex items-start justify-between">
          <Icon
            className="text-brand-iron group-hover:text-brand-black size-12 transition-colors md:size-14"
            strokeWidth={1.25}
          />
          <ArrowUpRight
            className="text-brand-mist group-hover:text-brand-yellow-deep size-5 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={2}
          />
        </div>

        {/* Texto */}
        <div>
          <div className="text-brand-iron mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
            Linha {String(index + 1).padStart(2, '0')}
          </div>
          <h3
            className="font-display text-brand-black text-2xl leading-none font-black md:text-3xl"
            style={{ letterSpacing: '-0.03em' }}
          >
            {line.label}
          </h3>
          <p className="text-brand-steel mt-3 text-sm leading-relaxed">{line.description}</p>
          <div className="text-brand-iron mt-5 font-mono text-xs tracking-wider uppercase">
            <span className="text-brand-yellow-deep font-bold">{line.brandCount ?? 0}</span>{' '}
            montadoras
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
