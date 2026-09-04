// src/components/warranty/warranty-coverage.tsx
/* ══════════════════════════════════════════
   WarrantyCoverage — Original Filter
   ──────────────────────────────────────────
   Condições para validar a garantia:
   - Armazenamento adequado
   - Instalação profissional
   - Bloco "Responsabilidade Total" em destaque

   Conteúdo do site original (politica-de-garantia) modernizado.
   ══════════════════════════════════════════ */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Wrench, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { CONTACT } from '@/lib/constants';
import { O_PATTERN_DARK } from '@/lib/brand-pattern';

const COVERAGE_REQUIREMENTS = [
  {
    icon: Package,
    code: 'Pré-requisito 01',
    title: 'Armazenamento\nadequado.',
    description:
      'Mantenha os filtros em locais isentos de umidade e poeira, sempre na embalagem original. A integridade da embalagem é fundamental para proteger o produto até o momento da instalação.',
    checklist: [
      'Local seco e ventilado',
      'Embalagem original lacrada',
      'Sem exposição direta a calor ou produtos químicos',
    ],
  },
  {
    icon: Wrench,
    code: 'Pré-requisito 02',
    title: 'Instalação\nprofissional.',
    description:
      'Conte com um profissional treinado para realizar a instalação. Siga rigorosamente as especificações presentes nos catálogos ou manuais do fabricante do veículo, máquina ou equipamento.',
    checklist: [
      'Profissional capacitado',
      'Catálogo ou manual do fabricante consultado',
      'Aplicação compatível com o veículo/equipamento',
    ],
  },
];

export function WarrantyCoverage() {
  return (
    <>
      {/* ─── Pré-requisitos para a garantia ─── */}
      <section className="bg-brand-snow py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          {/* Header */}
          <div className="mb-12 max-w-3xl md:mb-16">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-brand-yellow h-px w-8" />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Pré-requisitos da cobertura
              </span>
            </div>
            <h2
              className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '-0.035em',
              }}
            >
              Para usar a garantia.
              <br />
              <span className="text-brand-yellow-deep">Duas condições simples.</span>
            </h2>
            <p className="text-brand-iron mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
              Nossa garantia cobre defeitos de fabricação desde que o produto tenha sido armazenado
              e instalado conforme as orientações abaixo. São cuidados básicos que preservam a
              integridade do filtro até entrar em operação.
            </p>
          </div>

          {/* Grid de pré-requisitos */}
          <div className="bg-brand-mist grid grid-cols-1 gap-px md:grid-cols-2">
            {COVERAGE_REQUIREMENTS.map((req, i) => (
              <RequirementCard key={req.code} requirement={req} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Responsabilidade Total (faixa preta) ─── */}
      <section className="bg-brand-black relative overflow-hidden py-16 text-white md:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={O_PATTERN_DARK} />

        <div className="relative mx-auto max-w-7xl px-4 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12"
          >
            {/* Lado esquerdo: ícone + headline */}
            <div className="lg:col-span-7">
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck className="text-brand-yellow size-5" strokeWidth={2} />
                <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
                  Responsabilidade total
                </span>
              </div>
              <h2
                className="font-display leading-[0.95] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  letterSpacing: '-0.035em',
                }}
              >
                Defeito de fabricação?
                <br />
                <span className="text-brand-yellow">Assumimos o custo.</span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                Comprovada a avaria por defeito de fabricação, a Original Filter assume{' '}
                <strong className="text-white">todos os custos de reparo necessários</strong>. Nossa
                meta é devolver seu equipamento à condição anterior à falha — sem ônus para você.
              </p>
            </div>

            {/* Lado direito: bloco de garantia */}
            <div className="lg:col-span-5">
              <div
                className="bg-brand-graphite border border-white/10 p-6 md:p-8"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <div className="text-brand-yellow mb-4 font-mono text-[10px] tracking-[0.22em] uppercase">
                  Como funciona
                </div>
                <ul className="space-y-3.5">
                  {[
                    'Equipe técnica avalia o caso',
                    'Análise laboratorial do filtro',
                    'Custos de reparo cobertos pela Original Filter',
                    'Equipamento restaurado à condição anterior',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2
                        className="text-brand-yellow mt-0.5 size-4 shrink-0"
                        strokeWidth={2.5}
                      />
                      <span className="text-sm leading-snug text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
                  <a href={`tel:${CONTACT.phoneRaw}`} className="btn-primary w-full">
                    Acionar garantia
                    <ArrowRight className="size-4" />
                  </a>
                  <Link
                    href="/contato?assunto=garantia"
                    className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex w-full items-center justify-center gap-2 border border-white/20 px-5 py-3 text-xs font-semibold tracking-wide text-white uppercase transition"
                    style={{ borderRadius: 'var(--radius-edge)' }}
                  >
                    Formulário de garantia
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

function RequirementCard({
  requirement,
  index,
}: {
  requirement: (typeof COVERAGE_REQUIREMENTS)[number];
  index: number;
}) {
  const Icon = requirement.icon;

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
            {requirement.code}
          </div>
        </div>

        <h3
          className="font-display text-brand-black leading-[1] font-black whitespace-pre-line"
          style={{
            fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
            letterSpacing: '-0.03em',
          }}
        >
          {requirement.title}
        </h3>

        <p className="text-brand-steel mt-5 text-sm leading-relaxed md:text-base">
          {requirement.description}
        </p>

        {/* Checklist */}
        <ul className="border-brand-mist mt-5 space-y-2.5 border-t pt-5">
          {requirement.checklist.map((item) => (
            <li key={item} className="text-brand-iron flex items-start gap-2.5 text-sm">
              <CheckCircle2
                className="text-brand-yellow-deep mt-0.5 size-4 shrink-0"
                strokeWidth={2}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
