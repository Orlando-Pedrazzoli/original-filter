/* ══════════════════════════════════════════
   StatsBand — Original Filter
   ──────────────────────────────────────────
   Faixa preta com 4 KPIs do catálogo.
   Consome /api/stats e exibe os números reais do banco.
   Estilo: tipografia gigante, mono para labels (estilo painel técnico).

   Best practices aplicadas ao count-up:
   - Dispara SOMENTE quando entra no viewport (useInView, once).
   - tabular-nums: dígitos de largura fixa → sem tremor horizontal na subida.
   - prefers-reduced-motion: mostra o valor final direto, sem animar.
   - a11y: a versão animada é aria-hidden (não polui o leitor de tela a cada
     frame); o valor final + contexto vão num texto sr-only lido uma única vez.
   - stagger sutil entre os KPIs (delay por índice).
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { CatalogStats } from '@/lib/search-types';

const COUNT_DURATION_MS = 1400;
const STAGGER_MS = 120; // atraso entre o início de cada KPI

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  caption: string;
}

export function StatsBand() {
  const [stats, setStats] = useState<CatalogStats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d: CatalogStats) => setStats(d))
      .catch(() => {});
  }, []);

  if (!stats) {
    return (
      <section className="bg-brand-black py-12 text-white md:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4 md:gap-12 md:px-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-2 w-16 animate-pulse bg-white/10" />
              <div className="h-12 w-24 animate-pulse bg-white/10" />
              <div className="h-3 w-20 animate-pulse bg-white/10" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const items: StatItem[] = [
    {
      label: 'Produtos',
      value: stats.activeProducts,
      caption: 'no catálogo ativo',
    },
    {
      label: 'Aplicações',
      value: stats.totalApplications,
      caption: 'marca · modelo · motor · ano',
    },
    {
      label: 'Montadoras',
      value: stats.totalBrands,
      caption: 'rodoviárias, agrícolas, máquinas',
    },
    {
      label: 'Patenteados',
      value: stats.patentedProducts,
      caption: 'tecnologia exclusiva',
    },
  ];

  return (
    <section className="bg-brand-black relative overflow-hidden py-14 text-white md:py-20">
      {/* Grid blueprint sutil */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-center gap-3 md:mb-14"
        >
          <div className="bg-brand-yellow h-px w-8" />
          <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
            Catálogo completo · em números
          </span>
        </motion.div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:gap-x-12 lg:grid-cols-4">
          {items.map((it, i) => (
            <Stat key={it.label} item={it} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ item, index }: { item: StatItem; index: number }) {
  const formatted = item.value.toLocaleString('pt-BR');
  // Texto único e completo p/ o leitor de tela (valor final + contexto).
  const accessibleText = `${item.label}: ${formatted}${item.suffix ?? ''}. ${item.caption}.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="relative"
    >
      {/* Lido pelo leitor de tela uma única vez — sem o spam da contagem */}
      <span className="sr-only">{accessibleText}</span>

      {/* Camada visual — invisível ao SR para não anunciar cada frame da subida */}
      <div aria-hidden="true">
        {/* Faixa amarela vertical à esquerda */}
        <div className="bg-brand-yellow absolute top-2 bottom-2 left-0 w-0.5 opacity-80" />

        <div className="pl-4 md:pl-5">
          <div className="mb-2 font-mono text-[10px] tracking-[0.22em] text-white/50 uppercase md:text-[11px]">
            {item.label}
          </div>
          <div
            className="font-display leading-none font-black text-white"
            style={{
              fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
              letterSpacing: '-0.04em',
            }}
          >
            <CountUp to={item.value} delay={index * STAGGER_MS} />
            {item.suffix && <span className="text-brand-yellow ml-0.5">{item.suffix}</span>}
          </div>
          <div className="mt-2 max-w-[14rem] text-xs text-white/60 md:text-sm">{item.caption}</div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Animação de contagem (0 → valor real).
 * - Só inicia quando o número entra no viewport (once: true).
 * - tabular-nums: largura de dígito fixa, sem tremor horizontal na subida.
 * - Respeita prefers-reduced-motion: pula direto p/ o valor final.
 * - delay opcional p/ efeito escalonado entre KPIs.
 */
function CountUp({ to, delay = 0 }: { to: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  // amount: 0.5 → começa quando metade do número está visível.
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return; // segura a animação até o usuário rolar até aqui

    // Movimento reduzido: entrega o número final sem animar.
    if (prefersReducedMotion) {
      setValue(to);
      return;
    }

    let raf: number;
    let startTime: number | null = null;

    const timeout = setTimeout(() => {
      function tick(now: number) {
        if (startTime === null) startTime = now;
        const elapsed = now - startTime;
        const t = Math.min(elapsed / COUNT_DURATION_MS, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        setValue(Math.round(eased * to));
        if (t < 1) raf = requestAnimationFrame(tick);
        else setValue(to); // trava no valor exato no fim
      }
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [inView, to, delay, prefersReducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString('pt-BR')}
    </span>
  );
}
