/* ══════════════════════════════════════════
   ReverseLogistics — Original Filter
   ──────────────────────────────────────────
   Seção dedicada à logística reversa de filtros usados.
   Conteúdo modernizado do site original (/logistica-reversa).

   Apresenta: 4 etapas do processo + 3 KPIs ambientais
   ══════════════════════════════════════════ */

'use client';

import { motion } from 'framer-motion';
import {
  Recycle,
  PackageOpen,
  TestTubes,
  CheckCircle2,
  ArrowRight,
  Droplet,
  Mountain,
  TreePine,
} from 'lucide-react';

const PROCESS_STEPS = [
  {
    icon: PackageOpen,
    code: 'Etapa 01',
    title: 'Coleta',
    description:
      'Filtros usados são recolhidos junto aos pontos de venda, oficinas e clientes parceiros através de um sistema estruturado de coleta.',
  },
  {
    icon: TestTubes,
    code: 'Etapa 02',
    title: 'Triagem',
    description:
      'Material recebido passa por separação criteriosa: metais, polímeros e elementos filtrantes seguem caminhos específicos de tratamento.',
  },
  {
    icon: Recycle,
    code: 'Etapa 03',
    title: 'Reciclagem',
    description:
      'Componentes recicláveis voltam para a cadeia produtiva. Metais e plásticos recuperados reduzem a demanda por matéria-prima virgem.',
  },
  {
    icon: CheckCircle2,
    code: 'Etapa 04',
    title: 'Destinação correta',
    description:
      'Resíduos não recicláveis recebem destinação ambientalmente adequada conforme legislação vigente, evitando contaminação de solo e água.',
  },
];

const ENVIRONMENTAL_KPIS = [
  {
    icon: Droplet,
    metric: '4.5L',
    unit: 'óleo recuperado',
    description: 'por filtro reciclado em média',
  },
  {
    icon: Mountain,
    metric: '380g',
    unit: 'aço recuperado',
    description: 'por carcaça metálica processada',
  },
  {
    icon: TreePine,
    metric: 'Zero',
    unit: 'aterro comum',
    description: 'componentes nunca vão para destinação inadequada',
  },
];

export function ReverseLogistics() {
  return (
    <section className="bg-brand-black relative overflow-hidden py-16 text-white md:py-24">
      {/* Grid blueprint sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-12">
        {/* Header */}
        <div className="mb-12 max-w-3xl md:mb-16">
          <div className="mb-4 flex items-center gap-3">
            <Recycle className="text-brand-yellow size-4" strokeWidth={2} />
            <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
              Logística reversa
            </span>
          </div>
          <h2
            className="font-display leading-[0.95] font-black tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.035em',
            }}
          >
            Fechamos o ciclo.
            <br />
            <span className="text-brand-yellow">Do produto à reciclagem.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            Filtros usados contêm óleo, contaminantes e materiais que não podem ser descartados em
            qualquer lugar. Operamos um sistema completo de logística reversa que devolve esses
            componentes ao ciclo produtivo ou os destina adequadamente.
          </p>
        </div>

        {/* Diagrama horizontal do processo */}
        <div className="relative">
          {/* Linha conectora horizontal */}
          <div
            className="from-brand-yellow/0 via-brand-yellow/50 to-brand-yellow/0 pointer-events-none absolute top-[5rem] right-[5%] left-[5%] hidden h-px bg-gradient-to-r lg:block"
            aria-hidden="true"
          />

          <div className="relative grid grid-cols-1 gap-px bg-white/5 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => (
              <ProcessStep
                key={step.code}
                step={step}
                index={i}
                isLast={i === PROCESS_STEPS.length - 1}
              />
            ))}
          </div>
        </div>

        {/* KPIs ambientais */}
        <div className="mt-14 md:mt-20">
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="font-mono text-[11px] tracking-[0.25em] text-white/60 uppercase">
              Impacto positivo · valores médios
            </span>
          </div>

          <div className="grid grid-cols-1 gap-px bg-white/5 md:grid-cols-3">
            {ENVIRONMENTAL_KPIS.map((kpi, i) => (
              <KpiCard key={kpi.unit} kpi={kpi} index={i} />
            ))}
          </div>

          <p className="mt-6 font-mono text-xs tracking-widest text-white/40 uppercase">
            ↳ Estimativas baseadas em filtros automotivos de tamanho médio. Valores reais variam por
            categoria.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Etapa do processo ───
function ProcessStep({
  step,
  index,
  isLast,
}: {
  step: (typeof PROCESS_STEPS)[number];
  index: number;
  isLast: boolean;
}) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-brand-black hover:bg-brand-graphite relative p-6 transition md:p-8"
    >
      {/* Número da etapa em destaque */}
      <div className="font-display absolute top-6 right-6 text-5xl leading-none font-black tracking-tighter text-white/[0.08] md:text-6xl">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Ícone com bolinha amarela conectora */}
      <div className="relative mb-5">
        <div className="bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30 flex size-14 items-center justify-center border">
          <Icon className="size-6" strokeWidth={1.75} />
        </div>
        {/* Setinha para próxima etapa - só desktop */}
        {!isLast && (
          <div className="text-brand-yellow absolute top-1/2 -right-6 z-10 hidden -translate-y-1/2 items-center justify-center lg:flex">
            <ArrowRight className="size-4" strokeWidth={2} />
          </div>
        )}
      </div>

      <div className="relative">
        <div className="text-brand-yellow mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
          {step.code}
        </div>
        <h3
          className="font-display mb-3 leading-tight font-black text-white"
          style={{
            fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
            letterSpacing: '-0.025em',
          }}
        >
          {step.title}
        </h3>
        <p className="text-sm leading-relaxed text-white/60">{step.description}</p>
      </div>
    </motion.div>
  );
}

// ─── KPI ambiental ───
function KpiCard({ kpi, index }: { kpi: (typeof ENVIRONMENTAL_KPIS)[number]; index: number }) {
  const Icon = kpi.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-brand-black hover:bg-brand-graphite p-6 transition md:p-8"
    >
      <div className="flex items-start gap-5">
        <div className="bg-brand-yellow text-brand-black flex size-12 shrink-0 items-center justify-center">
          <Icon className="size-5" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div
            className="font-display leading-none font-black tracking-tight text-white"
            style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              letterSpacing: '-0.035em',
            }}
          >
            {kpi.metric}
          </div>
          <div className="text-brand-yellow mt-2 font-mono text-[10px] tracking-widest uppercase">
            {kpi.unit}
          </div>
          <div className="mt-2 text-xs leading-relaxed text-white/50">{kpi.description}</div>
        </div>
      </div>
    </motion.div>
  );
}
