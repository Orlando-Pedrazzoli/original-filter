/* ══════════════════════════════════════════
   SustainabilityPillars — Original Filter
   ──────────────────────────────────────────
   3 pilares da política de sustentabilidade.
   Conteúdo modernizado preservando os fatos do site original
   (/politica-de-sustentabilidade).
   ══════════════════════════════════════════ */

'use client';

import { motion } from 'framer-motion';
import { Leaf, Users, ShieldCheck } from 'lucide-react';

const PILLARS = [
  {
    icon: Leaf,
    eyebrow: 'Pilar ambiental',
    title: 'Sustentabilidade\nambiental.',
    description:
      'Processos produtivos com foco em eficiência energética, redução de resíduos e uso responsável de matéria-prima. Trabalhamos para minimizar nosso impacto em cada etapa da fabricação.',
    points: [
      'Otimização do consumo energético',
      'Gestão criteriosa de resíduos industriais',
      'Embalagens com materiais recicláveis',
    ],
  },
  {
    icon: Users,
    eyebrow: 'Pilar social',
    title: 'Responsabilidade\nsocial.',
    description:
      'Compromisso com nossa equipe, com a comunidade local em Cotia-SP e com toda a cadeia de fornecedores e distribuidores. Crescimento com integridade e respeito.',
    points: [
      'Ambiente de trabalho seguro e digno',
      'Capacitação contínua dos colaboradores',
      'Parcerias éticas de longo prazo',
    ],
  },
  {
    icon: ShieldCheck,
    eyebrow: 'Pilar qualidade',
    title: 'Qualidade\nconsciente.',
    description:
      'Produtos duráveis que cumprem rigorosamente as funções para as quais foram projetados. Filtros eficientes prolongam a vida útil dos equipamentos e reduzem o desperdício.',
    points: [
      'Filtros com vida útil estendida',
      'Auditoria contínua de fornecedores',
      'Conformidade com normas internacionais',
    ],
  },
];

export function SustainabilityPillars() {
  return (
    <section className="bg-brand-snow py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        {/* Header */}
        <div className="mb-12 max-w-3xl md:mb-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
              Nossa abordagem
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
            <span className="text-brand-yellow-deep">Um compromisso integrado.</span>
          </h2>
          <p className="text-brand-iron mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
            Nossa política de sustentabilidade não é uma área isolada — está entrelaçada nas
            decisões de produção, no relacionamento com pessoas e na qualidade que entregamos.
          </p>
        </div>

        {/* Grid de pilares */}
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
      className="bg-brand-white group hover:bg-brand-paper relative p-8 transition-colors md:p-10"
    >
      <div className="bg-brand-yellow absolute top-8 bottom-8 left-0 w-1 md:top-10 md:bottom-10" />

      <div className="pl-5">
        <Icon
          className="text-brand-iron group-hover:text-brand-black mb-5 size-12 transition"
          strokeWidth={1.5}
        />

        <div className="text-brand-yellow-deep mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
          {pillar.eyebrow}
        </div>

        <h3
          className="font-display text-brand-black leading-[1] font-black whitespace-pre-line"
          style={{
            fontSize: 'clamp(1.375rem, 2.5vw, 1.875rem)',
            letterSpacing: '-0.03em',
          }}
        >
          {pillar.title}
        </h3>

        <p className="text-brand-steel mt-5 text-sm leading-relaxed md:text-base">
          {pillar.description}
        </p>

        {/* Pontos práticos */}
        <ul className="border-brand-mist mt-5 space-y-2 border-t pt-5">
          {pillar.points.map((p) => (
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
