/* ══════════════════════════════════════════
   AboutLocation — Original Filter
   ──────────────────────────────────────────
   Destaque da localização estratégica em Cotia-SP.
   Pontos: proximidade vias principais + estoque robusto + atendimento ágil.
   ══════════════════════════════════════════ */

'use client';

import { motion } from 'framer-motion';
import { MapPin, Truck, Warehouse } from 'lucide-react';
import { CONTACT } from '@/lib/constants';

const HIGHLIGHTS = [
  {
    icon: MapPin,
    label: 'Cotia · São Paulo',
    description:
      'Instalações estratégicas próximas às principais vias de acesso da região metropolitana.',
  },
  {
    icon: Warehouse,
    label: 'Estoque robusto',
    description:
      'Linha completa pronta para entrega, garantindo disponibilidade dos produtos mais demandados.',
  },
  {
    icon: Truck,
    label: 'Distribuição eficiente',
    description:
      'Logística otimizada para atender frotistas, oficinas e revendedores em todo o território nacional.',
  },
];

export function AboutLocation() {
  return (
    <section className="bg-brand-white border-brand-mist border-t py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Texto principal */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-brand-yellow h-px w-8" />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Onde estamos
              </span>
            </div>
            <h2
              className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '-0.035em',
              }}
            >
              Fabricação
              <br />
              <span className="text-brand-yellow-deep">
                em {CONTACT.city}, {CONTACT.state}.
              </span>
            </h2>
            <p className="text-brand-iron mt-6 max-w-xl text-base leading-relaxed md:text-lg">
              Nossa unidade fabril está localizada em Cotia, na região metropolitana de São Paulo,
              próxima às principais vias de escoamento e ao porto de Santos. A localização garante
              distribuição eficiente para todo o Brasil e exportação para mercados estratégicos.
            </p>

            {/* Bloco com dados de contato direto */}
            <div
              className="bg-brand-snow border-brand-mist mt-8 space-y-3 border p-5 md:p-6"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <div className="text-brand-iron font-mono text-[10px] tracking-[0.22em] uppercase">
                Atendimento comercial
              </div>
              <a
                href={`tel:${CONTACT.phoneRaw}`}
                className="text-brand-black hover:text-brand-yellow-deep block font-mono text-2xl font-bold tracking-tight transition md:text-3xl"
              >
                {CONTACT.phone}
              </a>
              <div className="text-brand-iron flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <a
                  href={`tel:${CONTACT.sacRaw}`}
                  className="hover:text-brand-yellow-deep transition"
                >
                  <span className="text-brand-steel mr-1.5 text-[10px] tracking-wider uppercase">
                    SAC
                  </span>
                  <span className="font-mono font-bold">{CONTACT.sac}</span>
                </a>
                <div className="bg-brand-mist h-3 w-px" />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="hover:text-brand-yellow-deep font-mono transition"
                >
                  {CONTACT.email}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-brand-mist space-y-px"
          >
            {HIGHLIGHTS.map((h, i) => (
              <HighlightRow key={h.label} highlight={h} index={i} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HighlightRow({
  highlight,
  index,
}: {
  highlight: (typeof HIGHLIGHTS)[number];
  index: number;
}) {
  const Icon = highlight.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.08 }}
      className="bg-brand-white hover:bg-brand-snow flex items-start gap-5 p-6 transition md:p-7"
    >
      <div className="bg-brand-yellow/10 text-brand-yellow-deep flex size-12 shrink-0 items-center justify-center">
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <div>
        <div className="text-brand-iron mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="font-display text-brand-black text-lg leading-tight font-bold">
          {highlight.label}
        </div>
        <div className="text-brand-steel mt-2 text-sm leading-relaxed">{highlight.description}</div>
      </div>
    </motion.div>
  );
}
