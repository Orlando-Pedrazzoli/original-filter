/* ══════════════════════════════════════════
   QualityPillars — Original Filter
   ──────────────────────────────────────────
   4 pilares que sustentam a política de qualidade.
   Conteúdo do site original modernizado.
   ══════════════════════════════════════════ */

'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, FlaskConical, ClipboardCheck, Gauge } from 'lucide-react';

const PILLARS = [
  {
    icon: ShieldCheck,
    eyebrow: 'Pilar 01',
    title: 'Padrões\nelevados.',
    description:
      'Cada filtro é projetado em estreita colaboração com fabricantes globais de equipamentos, máquinas e veículos. Especificações rigorosas garantem filtragem eficaz e proteção máxima dos componentes.',
  },
  {
    icon: FlaskConical,
    eyebrow: 'Pilar 02',
    title: 'Laboratórios\navançados.',
    description:
      'Bateria completa de testes em equipamentos de última geração: vazão, eficiência de filtragem, resistência à pressão e durabilidade. Cada filtro atende e supera os padrões estabelecidos.',
  },
  {
    icon: ClipboardCheck,
    eyebrow: 'Pilar 03',
    title: 'Processos\nauditados.',
    description:
      'Linhas de fabricação padronizadas e auditadas regularmente conforme as normas IATF 16949:2016, QS 9000 e ISO 9001. Consistência absoluta lote após lote.',
  },
  {
    icon: Gauge,
    eyebrow: 'Pilar 04',
    title: 'Controle\nrigoroso.',
    description:
      'Inspeção de qualidade obrigatória antes de cada lote sair da fábrica. Conformidade técnica garantida em vedações, elementos filtrantes e estruturas — componentes premium escolhidos com cuidado.',
  },
];

export function QualityPillars() {
  return (
    <section className="bg-brand-snow py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <div className="mb-12 max-w-3xl md:mb-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
              Nosso compromisso
            </span>
          </div>
          <h2
            className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.035em',
            }}
          >
            Quatro pilares.
            <br />
            <span className="text-brand-yellow-deep">Qualidade absoluta.</span>
          </h2>
          <p className="text-brand-iron mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
            A reputação Original Filter não nasceu por acaso. Ela se sustenta em quatro pilares
            trabalhados todos os dias por nossa equipe técnica.
          </p>
        </div>

        <div className="bg-brand-mist grid grid-cols-1 gap-px md:grid-cols-2">
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
            {pillar.eyebrow}
          </div>
        </div>

        <h3
          className="font-display text-brand-black leading-[1] font-black whitespace-pre-line"
          style={{
            fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
            letterSpacing: '-0.03em',
          }}
        >
          {pillar.title}
        </h3>

        <p className="text-brand-steel mt-5 text-sm leading-relaxed md:text-base">
          {pillar.description}
        </p>
      </div>
    </motion.div>
  );
}
