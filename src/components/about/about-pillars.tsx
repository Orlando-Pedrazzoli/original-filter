/* ══════════════════════════════════════════
   AboutPillars — Original Filter
   ──────────────────────────────────────────
   Missão, Visão e Valores em 3 cards no padrão industrial-editorial.
   Texto baseado no site original com tom modernizado.
   ══════════════════════════════════════════ */

'use client';

import { motion } from 'framer-motion';
import { Compass, Eye, Anchor } from 'lucide-react';

const PILLARS = [
  {
    icon: Compass,
    eyebrow: 'Missão',
    title: 'Elevar o padrão\nda filtragem.',
    description:
      'Ser referência de excelência em filtragem industrial e automotiva, reconhecida por profissionais e consumidores em todos os segmentos onde atuamos.',
  },
  {
    icon: Eye,
    eyebrow: 'Visão',
    title: 'Vanguarda\nem tecnologia.',
    description:
      'Liderar a evolução da filtragem com inovação contínua, antecipando demandas do mercado e entregando soluções alinhadas às exigências dos maiores fabricantes do mundo.',
  },
  {
    icon: Anchor,
    eyebrow: 'Valores',
    title: 'Ética, qualidade,\ntransparência.',
    description:
      'Compromissos inegociáveis em cada produto entregue e cada relação construída. Competência técnica e integridade são a base de tudo o que fazemos.',
  },
];

export function AboutPillars() {
  return (
    <section className="bg-brand-snow py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <div className="mb-12 max-w-3xl md:mb-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
              Nosso propósito
            </span>
          </div>
          <h2
            className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.035em',
            }}
          >
            Três pilares.
            <br />
            <span className="text-brand-yellow-deep">Uma única identidade.</span>
          </h2>
        </div>

        <div className="bg-brand-mist grid grid-cols-1 gap-px md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <PillarCard key={pillar.eyebrow} pillar={pillar} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarCard({ pillar, index }: { pillar: (typeof PILLARS)[number]; index: number }) {
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

        <div className="text-brand-yellow-deep mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
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
