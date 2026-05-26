/* ══════════════════════════════════════════
   TrustSection — Original Filter
   ──────────────────────────────────────────
   Seção institucional com 3 pilares de confiança:
   - Centro de Pesquisa & Desenvolvimento próprio
   - Fabricação nacional em Cotia-SP
   - Linha completa fora-de-estrada e industrial

   Esta é a "alma" da homepage do ponto de vista institucional.
   ══════════════════════════════════════════ */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FlaskConical, MapPin, Globe, ArrowRight } from 'lucide-react';

const PILLARS = [
  {
    icon: FlaskConical,
    eyebrow: 'P&D próprio',
    title: 'Centro de Pesquisa\n& Desenvolvimento',
    description:
      'Laboratório próprio sempre à frente das inovações do mercado, alinhado com os mais exigentes fabricantes mundiais de veículos.',
  },
  {
    icon: MapPin,
    eyebrow: 'Fabricação nacional',
    title: 'Indústria brasileira\nem Cotia-SP',
    description:
      'Linha completa de filtros automotivos, agrícolas, industriais e fora-de-estrada produzidos no Brasil com tecnologia internacional.',
  },
  {
    icon: Globe,
    eyebrow: 'Cobertura global',
    title: 'Compromisso com\nqualidade superior.',
    description:
      'Filtros de reposição projetados para atender e superar as expectativas dos fabricantes mundiais — Volvo, Scania, Mercedes-Benz, Caterpillar, John Deere e muito mais.',
  },
];

export function TrustSection() {
  return (
    <section className="bg-brand-snow relative overflow-hidden py-20 md:py-28">
      {/* Grid técnico de fundo */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-12">
        {/* Header */}
        <div className="mb-16 max-w-4xl md:mb-20">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
              Nossos diferenciais
            </span>
          </div>
          <h2
            className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
            style={{
              fontSize: 'clamp(2.25rem, 5.5vw, 4rem)',
              letterSpacing: '-0.035em',
            }}
          >
            Qualidade Superior em
            <br />
            <span className="text-brand-yellow-deep">Filtros Automotivos e Sensores.</span>
          </h2>
          <p className="text-brand-iron mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
            A <strong className="text-brand-black">Original Filter</strong> destaca-se no mercado de
            autopeças como especialista em filtros automotivos, agrícolas, industriais e
            fora-de-estrada. Nossa linha de reposição é projetada para atender e superar as
            expectativas dos mais exigentes fabricantes mundiais de veículos.
          </p>
        </div>

        {/* Pilares */}
        <div className="bg-brand-mist mb-12 grid grid-cols-1 gap-px md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <Pillar key={pillar.eyebrow} pillar={pillar} index={i} />
          ))}
        </div>

        {/* CTA institucional */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="bg-brand-black flex flex-col items-start justify-between gap-6 p-8 text-white md:flex-row md:items-center md:p-10"
        >
          <div>
            <div className="text-brand-yellow mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
              Sobre nós
            </div>
            <p
              className="font-display text-xl leading-tight font-bold md:text-2xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Conheça nossa história, propósitos e política de qualidade.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/sobre"
              className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex items-center gap-2 border border-white/30 px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              Sobre nós
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/qualidade"
              className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex items-center gap-2 border border-white/30 px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              Política de qualidade
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Pillar({ pillar, index }: { pillar: (typeof PILLARS)[number]; index: number }) {
  const Icon = pillar.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-brand-white relative p-8 md:p-10"
    >
      <div className="bg-brand-yellow absolute top-8 bottom-8 left-0 w-1 md:top-10 md:bottom-10" />

      <div className="pl-5">
        <Icon className="text-brand-iron mb-5 size-10" strokeWidth={1.5} />

        <div className="text-brand-iron mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
          {pillar.eyebrow}
        </div>

        <h3
          className="font-display text-brand-black leading-[1.05] font-black whitespace-pre-line"
          style={{
            fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
            letterSpacing: '-0.02em',
          }}
        >
          {pillar.title}
        </h3>

        <p className="text-brand-steel mt-4 text-sm leading-relaxed">{pillar.description}</p>
      </div>
    </motion.div>
  );
}
