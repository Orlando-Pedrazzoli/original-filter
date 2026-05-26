/* ══════════════════════════════════════════
   QualityCommitment — Original Filter
   ──────────────────────────────────────────
   Compromisso da Original Filter com clientes e parceiros.
   Texto baseado no site original.
   ══════════════════════════════════════════ */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Headphones, Handshake, ArrowRight } from 'lucide-react';
import { CONTACT } from '@/lib/constants';

const COMMITMENTS = [
  {
    icon: Headphones,
    eyebrow: 'Assistência técnica',
    title: 'Equipe especializada\nà sua disposição.',
    description:
      'Profissionais com vasta experiência no setor de filtros estão prontos para oferecer um serviço informativo, simples e seguro. Suporte completo do diagnóstico à indicação técnica.',
    cta: {
      label: 'Falar com a equipe',
      href: '/contato',
    },
  },
  {
    icon: Handshake,
    eyebrow: 'Relacionamento duradouro',
    title: 'Parcerias que duram\ndécadas.',
    description:
      'Valorizamos a confiança dos nossos clientes e parceiros. Construímos relacionamentos sólidos baseados em entrega consistente, atendimento ágil e suporte completo pós-venda.',
    cta: {
      label: 'Seja revendedor',
      href: '/seja-revendedor',
    },
  },
];

export function QualityCommitment() {
  return (
    <section className="bg-brand-snow border-brand-mist border-t py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        {/* Header */}
        <div className="mb-12 max-w-3xl md:mb-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
              Para além do produto
            </span>
          </div>
          <h2
            className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.035em',
            }}
          >
            Compromisso com
            <br />
            <span className="text-brand-yellow-deep">clientes e parceiros.</span>
          </h2>
        </div>

        {/* Grid de compromissos */}
        <div className="bg-brand-mist mb-10 grid grid-cols-1 gap-px md:grid-cols-2">
          {COMMITMENTS.map((c, i) => (
            <CommitmentCard key={c.eyebrow} commitment={c} index={i} />
          ))}
        </div>

        {/* Faixa de contato direto */}
        <div
          className="bg-brand-black flex flex-col justify-between gap-5 p-6 text-white md:flex-row md:items-center md:p-8"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <div>
            <div className="text-brand-yellow mb-1.5 font-mono text-[10px] tracking-[0.22em] uppercase">
              Atendimento direto
            </div>
            <div className="font-display text-lg font-bold md:text-xl">
              Dúvida técnica sobre nossos padrões de qualidade?
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a
              href={`tel:${CONTACT.phoneRaw}`}
              className="bg-brand-yellow text-brand-black font-display hover:bg-brand-yellow-bright inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold tracking-wide uppercase transition"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <Headphones className="size-4" strokeWidth={2} />
              {CONTACT.phone}
            </a>
            <Link
              href="/contato"
              className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex items-center justify-center gap-2 border border-white/25 px-5 py-3 text-sm font-semibold tracking-wide text-white uppercase transition"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              Formulário de contato
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommitmentCard({
  commitment,
  index,
}: {
  commitment: (typeof COMMITMENTS)[number];
  index: number;
}) {
  const Icon = commitment.icon;

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
          {commitment.eyebrow}
        </div>

        <h3
          className="font-display text-brand-black leading-[1.05] font-black whitespace-pre-line"
          style={{
            fontSize: 'clamp(1.375rem, 2.5vw, 1.875rem)',
            letterSpacing: '-0.025em',
          }}
        >
          {commitment.title}
        </h3>

        <p className="text-brand-steel mt-5 text-sm leading-relaxed md:text-base">
          {commitment.description}
        </p>

        <Link
          href={commitment.cta.href}
          className="font-display text-brand-black hover:text-brand-yellow-deep group mt-6 inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase transition"
        >
          {commitment.cta.label}
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2.5}
          />
        </Link>
      </div>
    </motion.div>
  );
}
