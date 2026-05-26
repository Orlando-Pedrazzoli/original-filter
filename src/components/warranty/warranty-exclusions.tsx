/* ══════════════════════════════════════════
   WarrantyExclusions — Original Filter
   ──────────────────────────────────────────
   - 4 cards de exclusões e limitações da garantia
   - 3 passos de como acionar a garantia

   Conteúdo do site original (politica-de-garantia).
   ══════════════════════════════════════════ */

'use client';

import { motion } from 'framer-motion';
import {
  XCircle,
  Settings2,
  AlertTriangle,
  Zap,
  Hammer,
  MessageSquare,
  ClipboardCheck,
  Truck,
} from 'lucide-react';

const EXCLUSIONS = [
  {
    icon: Settings2,
    code: 'Exclusão 01',
    title: 'Modificações e alterações',
    description:
      'A garantia não se aplica a filtros que tenham sido modificados ou alterados de alguma forma. Qualquer intervenção não autorizada invalida automaticamente a cobertura.',
  },
  {
    icon: AlertTriangle,
    code: 'Exclusão 02',
    title: 'Aplicação divergente',
    description:
      'Se o filtro for aplicado de maneira divergente ao catálogo ou manual do fabricante, a garantia não será válida. Siga sempre as orientações específicas para cada veículo, máquina ou equipamento.',
  },
  {
    icon: Zap,
    code: 'Exclusão 03',
    title: 'Danos externos',
    description:
      'Não cobrimos danos causados por agentes externos, como acidentes, falhas com energia elétrica, uso inadequado, contaminação severa ou negligência operacional.',
  },
  {
    icon: Hammer,
    code: 'Exclusão 04',
    title: 'Desmontagem e substituição',
    description:
      'Custos relacionados à desmontagem ou substituição de produtos soldados ou afixados em estruturas não estão incluídos na garantia. Apenas o produto Original Filter está coberto.',
  },
];

const ACTIVATION_STEPS = [
  {
    icon: MessageSquare,
    title: 'Entre em contato',
    description:
      'Acione nossa equipe técnica pelo telefone, email ou formulário. Descreva o problema observado, número do filtro, aplicação e contexto da falha.',
  },
  {
    icon: ClipboardCheck,
    title: 'Análise técnica',
    description:
      'Nossa equipe avalia a documentação enviada e, quando necessário, solicita o envio do filtro para análise laboratorial. Diagnóstico em poucos dias úteis.',
  },
  {
    icon: Truck,
    title: 'Reparo ou substituição',
    description:
      'Comprovado o defeito de fabricação, assumimos os custos de reparo e organizamos a substituição. Equipamento restaurado à condição anterior à falha.',
  },
];

export function WarrantyExclusions() {
  return (
    <>
      {/* ─── Exclusões ─── */}
      <section className="bg-brand-white border-brand-mist border-t py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          {/* Header */}
          <div className="mb-12 max-w-3xl md:mb-16">
            <div className="mb-4 flex items-center gap-3">
              <XCircle className="text-brand-iron size-4" strokeWidth={2} />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Limitações da cobertura
              </span>
            </div>
            <h2
              className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '-0.035em',
              }}
            >
              Exclusões e
              <br />
              <span className="text-brand-yellow-deep">limitações.</span>
            </h2>
            <p className="text-brand-iron mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
              Por transparência, listamos as situações em que a garantia não se aplica. Conhecer
              essas condições ajuda a preservar a cobertura e evitar surpresas.
            </p>
          </div>

          {/* Grid de exclusões */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {EXCLUSIONS.map((excl, i) => (
              <ExclusionCard key={excl.code} exclusion={excl} index={i} />
            ))}
          </div>

          {/* Disclaimer */}
          <div className="text-brand-steel mt-8 flex items-start gap-3 text-xs">
            <AlertTriangle className="text-brand-iron mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <span className="max-w-3xl leading-relaxed">
              Casos não enumerados acima são avaliados individualmente por nossa equipe técnica. Em
              caso de dúvida sobre a cobertura, consulte-nos antes da instalação ou uso do produto.
            </span>
          </div>
        </div>
      </section>

      {/* ─── Como acionar (3 passos) ─── */}
      <section className="bg-brand-snow border-brand-mist border-t py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          {/* Header */}
          <div className="mb-12 max-w-3xl md:mb-16">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-brand-yellow h-px w-8" />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Acionar a garantia
              </span>
            </div>
            <h2
              className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '-0.035em',
              }}
            >
              Três passos.
              <br />
              <span className="text-brand-yellow-deep">Processo simples e ágil.</span>
            </h2>
            <p className="text-brand-iron mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
              Identificou um possível defeito de fabricação? Veja como acionar nossa equipe técnica
              e ativar sua garantia.
            </p>
          </div>

          {/* Grid de passos */}
          <div className="bg-brand-mist relative grid grid-cols-1 gap-px md:grid-cols-3">
            {ACTIVATION_STEPS.map((step, i) => (
              <ActivationStep key={step.title} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Card de exclusão ───
function ExclusionCard({
  exclusion,
  index,
}: {
  exclusion: (typeof EXCLUSIONS)[number];
  index: number;
}) {
  const Icon = exclusion.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="bg-brand-snow border-brand-mist group hover:border-brand-iron flex gap-5 border p-6 transition-colors md:p-7"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {/* Ícone */}
      <div className="bg-brand-white border-brand-mist text-brand-iron group-hover:text-brand-black group-hover:border-brand-iron flex size-12 shrink-0 items-center justify-center border transition">
        <Icon className="size-5" strokeWidth={1.75} />
      </div>

      {/* Texto */}
      <div className="min-w-0 flex-1">
        <div className="text-brand-iron mb-1.5 font-mono text-[10px] tracking-[0.22em] uppercase">
          {exclusion.code}
        </div>
        <h3 className="font-display text-brand-black mb-2 text-base leading-tight font-black md:text-lg">
          {exclusion.title}
        </h3>
        <p className="text-brand-steel text-sm leading-relaxed">{exclusion.description}</p>
      </div>
    </motion.div>
  );
}

// ─── Passo de ativação ───
function ActivationStep({
  step,
  index,
}: {
  step: (typeof ACTIVATION_STEPS)[number];
  index: number;
}) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-brand-white group hover:bg-brand-paper relative p-8 transition-colors md:p-10"
    >
      {/* Número da etapa em ghost text */}
      <div className="font-display text-brand-mist/40 pointer-events-none absolute top-6 right-6 text-6xl leading-none font-black tracking-tighter md:text-7xl">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="bg-brand-yellow absolute top-8 bottom-8 left-0 w-1 md:top-10 md:bottom-10" />

      <div className="relative pl-5">
        <div className="bg-brand-black text-brand-yellow group-hover:bg-brand-graphite mb-5 flex size-12 items-center justify-center transition">
          <Icon className="size-5" strokeWidth={2} />
        </div>

        <div className="text-brand-yellow-deep mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
          Passo {String(index + 1).padStart(2, '0')}
        </div>

        <h3
          className="font-display text-brand-black mb-3 leading-tight font-black"
          style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
            letterSpacing: '-0.02em',
          }}
        >
          {step.title}
        </h3>

        <p className="text-brand-steel text-sm leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}
