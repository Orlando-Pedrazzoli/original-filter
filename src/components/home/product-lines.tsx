/* ══════════════════════════════════════════
   ProductLines — Original Filter
   ──────────────────────────────────────────
   4-5 cards grandes das linhas de aplicação.
   Pulla dados de /api/vehicle-selector/lines + /api/vehicle-selector/brands
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

// Imagens de fundo por slug — cards com imagem ganham overlay escuro e texto branco
const LINE_IMAGES: Record<string, string> = {
  rodoviario: '/images/rodoviaria.jpg',
  'maquinas-pesadas': '/images/maquinas-pesadas.jpg',
  industrial: '/images/industrial.jpg',
  automotivo: '/images/automotivo.jpg',
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {lines.map((line, i) => (
            <LineCard key={line.slug} line={line} index={i} />
          ))}

          {/* Card extra: ver tudo */}
          {lines.length > 0 && (
            <Link
              href="/produtos"
              aria-label="Veja todos os produtos"
              className="group bg-brand-white relative block overflow-hidden"
              style={{ aspectRatio: '1323 / 1029', borderRadius: '8px' }}
            >
              <Image
                src="/images/todos-produtos.jpg"
                alt="Veja todos os produtos"
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          )}

          {/* Card extra: seja revendedor */}
          {lines.length > 0 && (
            <Link
              href="/seja-revendedor"
              aria-label="Seja um revendedor"
              className="group relative block overflow-hidden"
              style={{
                aspectRatio: '1323 / 1029',
                backgroundColor: '#fcd103',
                borderRadius: '8px',
              }}
            >
              <Image
                src="/images/revendedor.png"
                alt="Seja um revendedor"
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function LineCard({ line, index }: { line: VehicleLine; index: number }) {
  const Icon = LINE_ICONS[line.slug] ?? Truck;
  const imageSrc = LINE_IMAGES[line.slug];

  // ─── Card COM imagem: só a imagem, sem texto/overlay ───
  if (imageSrc) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: index * 0.06 }}
      >
        <Link
          href={`/produtos?linha=${line.slug}`}
          aria-label={line.label}
          className="group bg-brand-white relative block overflow-hidden"
          style={{ aspectRatio: '1323 / 1029', borderRadius: '8px' }}
        >
          <Image
            src={imageSrc}
            alt={line.label}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </motion.div>
    );
  }

  // ─── Card SEM imagem: layout original com texto ───
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link
        href={`/produtos?linha=${line.slug}`}
        className="group bg-brand-white hover:bg-brand-paper relative flex flex-col justify-between p-8 transition-colors md:p-10"
        style={{ aspectRatio: '1323 / 1029', borderRadius: '8px' }}
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
