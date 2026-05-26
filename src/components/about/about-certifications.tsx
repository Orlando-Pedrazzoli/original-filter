/* ══════════════════════════════════════════
   AboutCertifications — Original Filter
   ──────────────────────────────────────────
   Selos das normas internacionais seguidas pela empresa.
   Informação extraída da Política de Qualidade do site original:
   IATF 16949:2016 · QS 9000 · ISO 9001
   ══════════════════════════════════════════ */

'use client';

import { motion } from 'framer-motion';
import { Award, ShieldCheck, BadgeCheck } from 'lucide-react';

const CERTIFICATIONS = [
  {
    icon: Award,
    code: 'IATF 16949:2016',
    label: 'Setor automotivo',
    description:
      'Padrão internacional específico para fornecedores da indústria automotiva, exigindo melhoria contínua, prevenção de defeitos e gestão eficaz da cadeia de suprimentos.',
  },
  {
    icon: ShieldCheck,
    code: 'QS 9000',
    label: 'Big Three automotivo',
    description:
      'Norma harmonizada de qualidade originalmente desenvolvida para fornecedores da Ford, GM e Chrysler. Foco em controles rigorosos de processo e desempenho.',
  },
  {
    icon: BadgeCheck,
    code: 'ISO 9001',
    label: 'Gestão da qualidade',
    description:
      'Sistema de gestão da qualidade internacional, aplicável a qualquer organização. Garante processos padronizados, auditados e em melhoria contínua.',
  },
];

export function AboutCertifications() {
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
        <div className="mb-12 max-w-3xl md:mb-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
              Padrões internacionais
            </span>
          </div>
          <h2
            className="font-display leading-[0.95] font-black tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.035em',
            }}
          >
            Auditados pelas
            <br />
            <span className="text-brand-yellow">normas mais exigentes.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            Nossos processos de fabricação seguem três normas internacionais reconhecidas no setor
            automotivo e industrial. Auditados regularmente, garantem que cada filtro produzido
            mantenha o mesmo padrão de qualidade.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px bg-white/5 md:grid-cols-3">
          {CERTIFICATIONS.map((cert, i) => (
            <CertificationCard key={cert.code} cert={cert} index={i} />
          ))}
        </div>

        <p className="mt-8 font-mono text-xs tracking-widest text-white/40 uppercase">
          ↳ Processos padronizados · auditorias periódicas · melhoria contínua
        </p>
      </div>
    </section>
  );
}

function CertificationCard({
  cert,
  index,
}: {
  cert: (typeof CERTIFICATIONS)[number];
  index: number;
}) {
  const Icon = cert.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-brand-black hover:bg-brand-graphite p-8 transition md:p-10"
    >
      <Icon className="text-brand-yellow mb-6 size-10" strokeWidth={1.5} />

      <div className="text-brand-yellow mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
        {cert.label}
      </div>

      <div
        className="font-display leading-none font-black tracking-tight text-white"
        style={{
          fontSize: 'clamp(1.375rem, 2.2vw, 1.75rem)',
          letterSpacing: '-0.025em',
        }}
      >
        {cert.code}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-white/60">{cert.description}</p>
    </motion.div>
  );
}
