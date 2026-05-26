/* ══════════════════════════════════════════
   ResellerBenefits — Original Filter
   ──────────────────────────────────────────
   Sidebar lateral com benefícios e diferenciais do programa de revendedores.
   Aparece ao lado do formulário (sticky no desktop).
   ══════════════════════════════════════════ */

'use client';

import { motion } from 'framer-motion';
import { Percent, Headphones, Truck, TrendingUp, ShieldCheck, Award } from 'lucide-react';
import { CONTACT } from '@/lib/constants';

const BENEFITS = [
  {
    icon: Percent,
    title: 'Desconto progressivo',
    description: 'Tabela B2B com até 20% off conforme volume mensal.',
  },
  {
    icon: Headphones,
    title: 'Suporte comercial dedicado',
    description: 'Atendimento direto da nossa equipe técnica e comercial.',
  },
  {
    icon: Truck,
    title: 'Logística eficiente',
    description: 'Estoque robusto em Cotia-SP com entregas para todo o Brasil.',
  },
  {
    icon: TrendingUp,
    title: 'Linha completa',
    description: '370+ produtos cobrindo 22 montadoras nacionais e importadas.',
  },
];

export function ResellerBenefits() {
  return (
    <div className="bg-brand-mist space-y-px lg:sticky lg:top-32">
      {/* Header da sidebar */}
      <div className="bg-brand-black p-6 text-white">
        <div className="mb-2 flex items-center gap-3">
          <Award className="text-brand-yellow size-4" strokeWidth={2} />
          <span className="text-brand-yellow font-mono text-[10px] tracking-[0.22em] uppercase">
            Programa de revendedores
          </span>
        </div>
        <h3
          className="font-display leading-tight font-black"
          style={{
            fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
            letterSpacing: '-0.025em',
          }}
        >
          O que você ganha
          <br />
          <span className="text-brand-yellow">ao se tornar parceiro.</span>
        </h3>
      </div>

      {/* Benefícios */}
      {BENEFITS.map((benefit, i) => (
        <BenefitCard key={benefit.title} benefit={benefit} index={i} />
      ))}

      {/* Selo de confiança */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, delay: BENEFITS.length * 0.06 }}
        className="bg-brand-yellow p-6"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-brand-black mt-0.5 size-5 shrink-0" strokeWidth={2} />
          <div>
            <div className="text-brand-black/70 mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
              Confiabilidade comprovada
            </div>
            <div className="font-display text-brand-black text-sm leading-snug font-bold">
              Auditados pelas normas IATF 16949:2016, QS 9000 e ISO 9001.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contato direto */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, delay: (BENEFITS.length + 1) * 0.06 }}
        className="bg-brand-white p-6"
      >
        <div className="text-brand-iron mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
          Dúvidas antes de aplicar?
        </div>
        <div className="font-display text-brand-black mb-3 text-sm leading-snug font-bold">
          Fale direto com nossa equipe comercial.
        </div>
        <a
          href={`tel:${CONTACT.phoneRaw}`}
          className="text-brand-yellow-deep hover:text-brand-black block font-mono text-lg font-bold tracking-tight transition"
        >
          {CONTACT.phone}
        </a>
      </motion.div>
    </div>
  );
}

function BenefitCard({ benefit, index }: { benefit: (typeof BENEFITS)[number]; index: number }) {
  const Icon = benefit.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="bg-brand-white group hover:bg-brand-snow relative p-5 transition-colors md:p-6"
    >
      <div className="bg-brand-yellow absolute top-0 bottom-0 left-0 w-1 origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />

      <div className="flex items-start gap-4">
        <div className="bg-brand-yellow/10 text-brand-yellow-deep flex size-10 shrink-0 items-center justify-center">
          <Icon className="size-4" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-brand-iron mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
            Benefício {String(index + 1).padStart(2, '0')}
          </div>
          <div className="font-display text-brand-black mb-1 text-sm leading-snug font-bold">
            {benefit.title}
          </div>
          <div className="text-brand-steel text-xs leading-relaxed">{benefit.description}</div>
        </div>
      </div>
    </motion.div>
  );
}
