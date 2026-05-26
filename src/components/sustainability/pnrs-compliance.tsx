/* ══════════════════════════════════════════
   PnrsCompliance — Original Filter
   ──────────────────────────────────────────
   Bloco de conformidade com a Política Nacional de Resíduos Sólidos
   (Lei 12.305/2010) + cards "Como participar" para clientes,
   parceiros e consumidores.
   ══════════════════════════════════════════ */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale, Building2, Wrench, User, ArrowRight, ScrollText } from 'lucide-react';

const PARTICIPATION_CARDS = [
  {
    icon: Building2,
    eyebrow: 'Distribuidor / lojista',
    title: 'Pontos de coleta autorizados.',
    description:
      'Cadastre-se como ponto de coleta oficial Original Filter. Apoiamos com material informativo, embalagens apropriadas e logística de retirada periódica.',
    cta: { label: 'Cadastrar ponto de coleta', href: '/contato?assunto=logistica-reversa' },
  },
  {
    icon: Wrench,
    eyebrow: 'Oficina / frotista',
    title: 'Programa de devolução.',
    description:
      'Empresas que realizam manutenção em grande escala podem aderir ao programa estruturado de devolução. Retiramos os filtros usados diretamente em sua operação.',
    cta: { label: 'Aderir ao programa', href: '/contato?assunto=programa-devolucao' },
  },
  {
    icon: User,
    eyebrow: 'Consumidor final',
    title: 'Onde descartar.',
    description:
      'Nunca jogue um filtro usado no lixo comum. Procure o ponto de coleta autorizado mais próximo ou consulte com nossa equipe a localização das unidades parceiras.',
    cta: { label: 'Falar com a equipe', href: '/contato' },
  },
];

export function PnrsCompliance() {
  return (
    <section className="bg-brand-white border-brand-mist border-t py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        {/* Bloco de conformidade legal */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="bg-brand-yellow relative mb-16 overflow-hidden md:mb-20"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, transparent, transparent 16px, #000 16px, #000 17px)',
            }}
          />

          <div className="relative grid grid-cols-1 items-center gap-6 p-8 md:p-10 lg:grid-cols-12 lg:gap-8 lg:p-12">
            <div className="flex justify-center lg:col-span-2 lg:justify-start">
              <div className="bg-brand-black text-brand-yellow flex size-20 shrink-0 items-center justify-center md:size-24">
                <Scale className="size-9 md:size-10" strokeWidth={1.5} />
              </div>
            </div>

            <div className="text-center lg:col-span-7 lg:text-left">
              <div className="mb-3 flex items-center justify-center gap-3 lg:justify-start">
                <div className="bg-brand-black/30 h-px w-8" />
                <span className="text-brand-black/70 font-mono text-[11px] tracking-[0.25em] uppercase">
                  Conformidade legal
                </span>
              </div>
              <h3
                className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.03em',
                }}
              >
                Aderentes à Política Nacional de Resíduos Sólidos.
              </h3>
              <p className="text-brand-black/80 mt-3 text-sm leading-relaxed md:text-base">
                Operamos em conformidade com a <strong>Lei 12.305/2010</strong> (PNRS), que
                estabelece a responsabilidade compartilhada pelo ciclo de vida dos produtos entre
                fabricantes, distribuidores, comerciantes e consumidores.
              </p>
            </div>

            <div className="flex justify-center lg:col-span-3 lg:justify-end">
              <div className="bg-brand-black inline-block p-5 text-white">
                <div className="text-brand-yellow mb-1 font-mono text-[9px] tracking-widest uppercase">
                  Diploma legal
                </div>
                <div className="font-mono text-lg leading-tight font-bold">Lei 12.305</div>
                <div className="mt-0.5 font-mono text-xs text-white/60">2 de agosto de 2010</div>
                <div className="text-brand-yellow mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 font-mono text-[9px] tracking-widest uppercase">
                  <ScrollText className="size-3" />
                  PNRS · Brasil
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Como participar */}
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
              Como participar
            </span>
          </div>
          <h2
            className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
            style={{
              fontSize: 'clamp(1.875rem, 4.5vw, 3rem)',
              letterSpacing: '-0.035em',
            }}
          >
            Responsabilidade compartilhada.
            <br />
            <span className="text-brand-yellow-deep">Caminho para cada perfil.</span>
          </h2>
          <p className="text-brand-iron mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
            A logística reversa só funciona quando todos os elos da cadeia participam. Saiba como
            você pode contribuir com o ciclo.
          </p>
        </div>

        <div className="bg-brand-mist grid grid-cols-1 gap-px md:grid-cols-3">
          {PARTICIPATION_CARDS.map((card, i) => (
            <ParticipationCard key={card.eyebrow} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ParticipationCard({
  card,
  index,
}: {
  card: (typeof PARTICIPATION_CARDS)[number];
  index: number;
}) {
  const Icon = card.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-brand-white group hover:bg-brand-paper relative flex flex-col p-8 transition-colors md:p-10"
    >
      <div className="bg-brand-yellow absolute top-8 bottom-8 left-0 w-1 md:top-10 md:bottom-10" />

      <div className="flex flex-1 flex-col pl-5">
        <Icon
          className="text-brand-iron group-hover:text-brand-black mb-5 size-10 transition"
          strokeWidth={1.5}
        />

        <div className="text-brand-yellow-deep mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
          {card.eyebrow}
        </div>

        <h3
          className="font-display text-brand-black mb-3 leading-tight font-black"
          style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
            letterSpacing: '-0.02em',
          }}
        >
          {card.title}
        </h3>

        <p className="text-brand-steel flex-1 text-sm leading-relaxed">{card.description}</p>

        <Link
          href={card.cta.href}
          className="font-display text-brand-black hover:text-brand-yellow-deep group/cta mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase transition"
        >
          {card.cta.label}
          <ArrowRight
            className="size-3.5 transition-transform group-hover/cta:translate-x-0.5"
            strokeWidth={2.5}
          />
        </Link>
      </div>
    </motion.div>
  );
}
