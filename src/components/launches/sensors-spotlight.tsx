/* ══════════════════════════════════════════
   SensorsSpotlight — Original Filter
   ──────────────────────────────────────────
   Seção dedicada a destacar os sensores NOx novos.
   Aparece com fundo preto, layout próprio (não usa o ProductCard padrão),
   pois sensores merecem tratamento diferenciado.
   ══════════════════════════════════════════ */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Activity, Zap, ArrowUpRight, Sparkles, ImageOff, ArrowRight } from 'lucide-react';
import type { ProductCardData } from '@/components/products/product-card';
import { cleanProductTitle } from '@/utils/format';

interface SensorsSpotlightProps {
  sensors: ProductCardData[];
  totalSensors: number;
}

export function SensorsSpotlight({ sensors, totalSensors }: SensorsSpotlightProps) {
  if (sensors.length === 0) {
    return (
      <section className="bg-brand-black relative overflow-hidden py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-12">
          <Activity className="text-brand-yellow mx-auto mb-4 size-12" strokeWidth={1.5} />
          <h2
            className="font-display mb-3 leading-tight font-black"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              letterSpacing: '-0.025em',
            }}
          >
            Linha de sensores em desenvolvimento.
          </h2>
          <p className="mx-auto max-w-md text-white/60">
            Nossa linha de sensores NOx será destacada aqui em breve. Acompanhe os lançamentos.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-brand-black relative overflow-hidden text-white">
      {/* Padrão circuit decorativo */}
      <svg
        className="pointer-events-none absolute top-0 right-0 bottom-0 w-1/3 opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMaxYMid slice"
      >
        <defs>
          <pattern id="circuit-pat" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M0 40 L30 40 L30 10 L60 10 L60 70 L80 70"
              fill="none"
              stroke="#FFD700"
              strokeWidth="1.5"
            />
            <circle cx="30" cy="40" r="3" fill="#FFD700" />
            <circle cx="60" cy="10" r="3" fill="#FFD700" />
            <circle cx="60" cy="70" r="3" fill="#FFD700" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-pat)" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-12 md:py-24">
        {/* Header */}
        <div className="mb-12 grid grid-cols-1 items-end gap-8 md:mb-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-4 flex items-center gap-3">
              <Activity className="text-brand-yellow size-4" strokeWidth={2} />
              <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
                Destaque · Sensores NOx
              </span>
            </div>

            <h2
              className="font-display leading-[0.9] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
                letterSpacing: '-0.04em',
              }}
            >
              Sensores
              <br />
              <span className="text-brand-yellow">de nova geração.</span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              Componentes eletrônicos críticos para o pós-tratamento de gases em motores Euro V e
              Euro VI. Compatíveis com sistemas SCR, monitoram a eficiência do catalisador e a
              qualidade da queima.
            </p>
          </div>

          {/* KPI total de sensores */}
          <div className="lg:col-span-4 lg:text-right">
            <div className="text-brand-yellow mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
              Total no catálogo
            </div>
            <div
              className="font-display leading-none font-black text-white"
              style={{
                fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                letterSpacing: '-0.04em',
              }}
            >
              {totalSensors}
            </div>
            <div className="mt-2 font-mono text-xs tracking-widest text-white/50 uppercase">
              sensores · NOx · temperatura · pressão
            </div>
          </div>
        </div>

        {/* Grid de sensores destacados */}
        <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
          {sensors.slice(0, 6).map((sensor, i) => (
            <SensorCard key={sensor.sku} sensor={sensor} index={i} />
          ))}
        </div>

        {/* CTA ver todos */}
        <div className="mt-8 text-center">
          <Link
            href="/produtos?tipo=sensor"
            className="hover:border-brand-yellow hover:bg-brand-yellow/5 hover:text-brand-yellow font-display inline-flex items-center gap-2 border border-white/20 px-6 py-3 text-sm font-semibold tracking-wide text-white uppercase transition"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            Ver todos os {totalSensors} sensores
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Card de sensor (variante específica, mais "técnica") ───
function SensorCard({ sensor, index }: { sensor: ProductCardData; index: number }) {
  const cleanTitle = cleanProductTitle(sensor.title, sensor.sku);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link
        href={`/produtos/${sensor.slug}`}
        className="group bg-brand-black hover:bg-brand-graphite relative block h-full p-5 transition-colors md:p-6"
      >
        {/* Badge */}
        <div className="mb-4 flex items-center justify-between">
          <div className="bg-brand-yellow text-brand-black inline-flex items-center gap-1 px-2 py-0.5">
            <Sparkles className="size-2.5" strokeWidth={2.5} />
            <span className="font-mono text-[9px] font-bold tracking-widest uppercase">
              Lançamento
            </span>
          </div>
          <Activity
            className="text-brand-yellow/50 group-hover:text-brand-yellow size-4 transition"
            strokeWidth={2}
          />
        </div>

        {/* Imagem */}
        <div className="bg-brand-graphite relative mb-4 flex aspect-square items-center justify-center overflow-hidden border border-white/5">
          {sensor.primaryImage ? (
            <Image
              src={sensor.primaryImage}
              alt={cleanTitle || sensor.sku}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <ImageOff className="size-10 text-white/20" strokeWidth={1.25} />
          )}
        </div>

        {/* SKU + título */}
        <div className="space-y-2">
          <div className="text-brand-yellow font-mono text-sm font-bold tracking-wider">
            {sensor.sku}
          </div>
          <div className="line-clamp-2 text-sm leading-snug text-white/80 transition group-hover:text-white">
            {cleanTitle || sensor.title}
          </div>

          {/* Footer técnico */}
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] tracking-widest text-white/40 uppercase">
            <span>
              {sensor.applicationsCount > 0 ? (
                <>
                  <span className="text-brand-yellow font-bold">{sensor.applicationsCount}</span>{' '}
                  aplicações
                </>
              ) : (
                'Aplicações em cadastro'
              )}
            </span>
            <ArrowUpRight className="group-hover:text-brand-yellow size-3 opacity-0 transition-all group-hover:opacity-100" />
          </div>
        </div>

        {/* Faixa amarela vertical no hover */}
        <div className="bg-brand-yellow absolute top-0 bottom-0 left-0 w-1 origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />
      </Link>
    </motion.div>
  );
}
