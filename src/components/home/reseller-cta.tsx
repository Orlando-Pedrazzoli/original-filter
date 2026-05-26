/* ══════════════════════════════════════════
   ResellerCTA — Original Filter
   ──────────────────────────────────────────
   Faixa amarela impactante chamando para o formulário "Seja Revendedor".
   Última seção antes do footer — push final de conversão B2B.
   ══════════════════════════════════════════ */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Percent, Headphones } from 'lucide-react';

const PERKS = [
  {
    icon: Percent,
    label: 'Descontos exclusivos',
    detail: 'Tabela B2B com até 20% off conforme volume',
  },
  {
    icon: Building2,
    label: 'Programa estruturado',
    detail: 'Aprovação ágil, área do revendedor dedicada',
  },
  {
    icon: Headphones,
    label: 'Suporte comercial',
    detail: 'Atendimento direto da equipe Original Filter',
  },
];

export function ResellerCTA() {
  return (
    <section className="bg-brand-black relative overflow-hidden py-20 text-white md:py-28">
      {/* Padrão hexagonal grande no fundo direito */}
      <svg
        className="pointer-events-none absolute top-1/2 right-[-10%] aspect-square w-[60%] -translate-y-1/2 opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
      >
        <defs>
          <pattern id="hex-cta" width="40" height="34.6" patternUnits="userSpaceOnUse">
            <polygon
              points="20,2 37,12 37,28 20,38 3,28 3,12"
              fill="none"
              stroke="#FFD700"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-cta)" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 md:px-12">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Esquerda: headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="bg-brand-yellow h-px w-8" />
              <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
                Programa de revendedores
              </span>
            </div>
            <h2
              className="font-display leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
                letterSpacing: '-0.035em',
              }}
            >
              Seja parceiro
              <br />
              <span className="text-brand-yellow">Original Filter.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Você é distribuidor, oficina, frota ou loja de autopeças? Cadastre-se em nosso
              programa de revenda e tenha acesso a condições comerciais exclusivas, suporte dedicado
              e linha completa de filtros e sensores.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/seja-revendedor" className="btn-primary">
                Cadastrar minha empresa
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contato"
                className="font-display inline-flex items-center justify-center gap-2 border border-white/25 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition hover:bg-white/10"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Falar com comercial
              </Link>
            </div>
          </motion.div>

          {/* Direita: vantagens */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-px bg-white/5"
          >
            {PERKS.map((perk, i) => (
              <PerkRow key={perk.label} perk={perk} index={i} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PerkRow({ perk, index }: { perk: (typeof PERKS)[number]; index: number }) {
  const Icon = perk.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      className="bg-brand-graphite hover:bg-brand-charcoal flex items-start gap-5 p-6 transition-colors md:p-7"
    >
      <div className="bg-brand-yellow/10 text-brand-yellow flex size-12 shrink-0 items-center justify-center">
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <div>
        <div className="text-brand-yellow mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
          {String(index + 1).padStart(2, '0')} · {perk.label}
        </div>
        <div className="font-display text-base font-semibold text-white">{perk.detail}</div>
      </div>
    </motion.div>
  );
}
