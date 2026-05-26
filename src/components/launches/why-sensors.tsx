/* ══════════════════════════════════════════
   WhySensors — Original Filter
   ──────────────────────────────────────────
   Reforça por que escolher os sensores Original Filter.
   3 pilares: Tecnologia · Aplicação · Cobertura
   ══════════════════════════════════════════ */

'use client';

import { motion } from 'framer-motion';
import { Cpu, Target, Globe2 } from 'lucide-react';

const REASONS = [
  {
    icon: Cpu,
    code: 'Diferencial 01',
    title: 'Tecnologia\neletrônica.',
    description:
      'Sensores NOx desenvolvidos para sistemas SCR (Selective Catalytic Reduction) usados em motores Euro V e Euro VI. Componentes eletrônicos críticos para o pós-tratamento de gases.',
    points: [
      'Resposta em milissegundos',
      'Calibração de fábrica certificada',
      'Conformidade com OEM',
    ],
  },
  {
    icon: Target,
    code: 'Diferencial 02',
    title: 'Aplicação\nprecisa.',
    description:
      'Cada sensor tem aplicação específica validada por aplicação. Trabalhamos com referência cruzada exata para evitar falhas de instalação ou diagnóstico incorreto.',
    points: [
      'Cross-reference por código OEM',
      'Aplicação por veículo e motor',
      'Catálogo técnico com diagrama',
    ],
  },
  {
    icon: Globe2,
    code: 'Diferencial 03',
    title: 'Cobertura\namplia.',
    description:
      'Linha em expansão cobrindo principais montadoras pesadas (Volvo, Scania, Mercedes-Benz, Iveco, MAN) e fabricantes de equipamentos agrícolas e industriais.',
    points: ['Caminhões e ônibus pesados', 'Tratores e colheitadeiras', 'Geradores e equipamentos'],
  },
];

export function WhySensors() {
  return (
    <section className="bg-brand-white border-brand-mist border-t py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        {/* Header */}
        <div className="mb-12 max-w-3xl md:mb-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
              Por que sensores Original Filter
            </span>
          </div>
          <h2
            className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.035em',
            }}
          >
            Três diferenciais
            <br />
            <span className="text-brand-yellow-deep">que importam.</span>
          </h2>
          <p className="text-brand-iron mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
            Não é só mais um filtro: sensores são componentes eletrônicos críticos que influenciam
            diretamente no desempenho do motor e na emissão de poluentes.
          </p>
        </div>

        {/* Grid */}
        <div className="bg-brand-mist grid grid-cols-1 gap-px md:grid-cols-3">
          {REASONS.map((reason, i) => (
            <ReasonCard key={reason.code} reason={reason} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReasonCard({ reason, index }: { reason: (typeof REASONS)[number]; index: number }) {
  const Icon = reason.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-brand-white group hover:bg-brand-paper relative p-8 transition-colors md:p-10"
    >
      <div className="bg-brand-yellow absolute top-8 bottom-8 left-0 w-1 md:top-10 md:bottom-10" />

      <div className="pl-5">
        <div className="mb-5 flex items-start justify-between">
          <Icon
            className="text-brand-iron group-hover:text-brand-black size-12 transition"
            strokeWidth={1.5}
          />
          <div className="text-brand-yellow-deep font-mono text-[10px] tracking-[0.22em] uppercase">
            {reason.code}
          </div>
        </div>

        <h3
          className="font-display text-brand-black leading-[1] font-black whitespace-pre-line"
          style={{
            fontSize: 'clamp(1.375rem, 2.5vw, 1.875rem)',
            letterSpacing: '-0.025em',
          }}
        >
          {reason.title}
        </h3>

        <p className="text-brand-steel mt-5 text-sm leading-relaxed md:text-base">
          {reason.description}
        </p>

        <ul className="border-brand-mist mt-5 space-y-2 border-t pt-5">
          {reason.points.map((p) => (
            <li key={p} className="text-brand-iron flex items-start gap-2 text-xs">
              <span className="bg-brand-yellow-deep mt-1.5 size-1 shrink-0 rounded-full" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
