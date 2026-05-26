/* ══════════════════════════════════════════
   /sustentabilidade — Política de Sustentabilidade
   ──────────────────────────────────────────
   Server Component (SEO crítico).
   Consolida /politica-de-sustentabilidade + /logistica-reversa do site original.

   Estrutura (6 seções):
   1. PageHero dark
   2. Statement institucional + atalhos
   3. SustainabilityPillars — 3 pilares
   4. ReverseLogistics — processo + KPIs ambientais
   5. PnrsCompliance — Lei 12.305 + Como participar
   6. CTA final
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Leaf, ShieldCheck, Heart } from 'lucide-react';
import { PageHero } from '@/components/shared/page-hero';
import { SustainabilityPillars } from '@/components/sustainability/sustainability-pillars';
import { ReverseLogistics } from '@/components/sustainability/reverse-logistics';
import { PnrsCompliance } from '@/components/sustainability/pnrs-compliance';

export const metadata: Metadata = {
  title: 'Sustentabilidade & Logística Reversa — Original Filter',
  description:
    'Compromisso da Original Filter com o futuro: três pilares de sustentabilidade ' +
    '(ambiental, social e qualidade), sistema completo de logística reversa de ' +
    'filtros usados e conformidade com a Política Nacional de Resíduos Sólidos ' +
    '(Lei 12.305/2010).',
};

export default function SustentabilidadePage() {
  return (
    <>
      {/* ─── 1. Hero ─── */}
      <PageHero
        eyebrow="Sustentabilidade & Meio Ambiente"
        title="Compromisso com o futuro da filtragem."
        description="Operações alinhadas com responsabilidade ambiental, social e legal. Da matéria-prima ao descarte: cada etapa do ciclo é pensada para minimizar impactos e gerar valor compartilhado."
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Quem somos', href: '/sobre' },
          { label: 'Sustentabilidade' },
        ]}
        variant="dark"
        size="lg"
      />

      {/* ─── 2. Statement institucional ─── */}
      <section className="bg-brand-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Lateral fixa */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-brand-yellow h-px w-8" />
                  <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                    Nossa posição
                  </span>
                </div>
                <h2
                  className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
                  style={{
                    fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                    letterSpacing: '-0.035em',
                  }}
                >
                  Sustentabilidade
                  <br />
                  <span className="text-brand-yellow-deep">como prática diária.</span>
                </h2>

                {/* Mini-stats institucionais */}
                <div className="border-brand-mist mt-8 hidden flex-col gap-4 border-t pt-8 lg:flex">
                  <MiniStat icon={<Leaf />} label="Pilares" value="03" />
                  <MiniStat icon={<ShieldCheck />} label="Lei aplicada" value="12.305/2010" />
                  <MiniStat icon={<Heart />} label="Responsabilidade" value="Compartilhada" />
                </div>
              </div>
            </div>

            {/* Texto principal */}
            <div className="text-brand-iron space-y-6 text-base leading-relaxed md:text-lg lg:col-span-8">
              <p>
                Na <strong className="text-brand-black">Original Filter</strong>, a sustentabilidade
                não é uma palavra de marketing — é um princípio operacional. Cada etapa da nossa
                cadeia produtiva, do projeto à pós-venda, é avaliada sob a ótica do impacto
                ambiental, social e da durabilidade dos componentes.
              </p>

              <p>
                Nossa atuação se sustenta em{' '}
                <strong className="text-brand-black">três pilares integrados</strong>:
                sustentabilidade ambiental nos processos produtivos, responsabilidade social com
                colaboradores e comunidade, e qualidade consciente que prolonga a vida útil dos
                equipamentos dos nossos clientes.
              </p>

              <p>
                Além disso, operamos um{' '}
                <strong className="text-brand-black">sistema completo de logística reversa</strong>{' '}
                que devolve filtros usados ao ciclo produtivo. Não é apenas cumprimento legal — é a
                forma como entendemos nosso papel na indústria automotiva e industrial.
              </p>

              <p className="font-display text-brand-black text-lg font-semibold md:text-xl">
                Fazer bem-feito, com responsabilidade. É assim que entregamos qualidade superior em
                filtros e sensores há anos.
              </p>

              {/* Atalhos âncora */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Link
                  href="#pilares"
                  className="text-brand-iron border-brand-mist hover:border-brand-black hover:text-brand-black inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs tracking-widest uppercase transition"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  ↓ 3 pilares
                </Link>
                <Link
                  href="#logistica"
                  className="text-brand-iron border-brand-mist hover:border-brand-black hover:text-brand-black inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs tracking-widest uppercase transition"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  ↓ Logística reversa
                </Link>
                <Link
                  href="#pnrs"
                  className="text-brand-iron border-brand-mist hover:border-brand-black hover:text-brand-black inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs tracking-widest uppercase transition"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  ↓ Conformidade PNRS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Pilares ─── */}
      <div id="pilares">
        <SustainabilityPillars />
      </div>

      {/* ─── 4. Logística Reversa ─── */}
      <div id="logistica">
        <ReverseLogistics />
      </div>

      {/* ─── 5. PNRS + Como Participar ─── */}
      <div id="pnrs">
        <PnrsCompliance />
      </div>

      {/* ─── 6. CTA final ─── */}
      <section className="bg-brand-snow border-brand-mist border-t py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-brand-yellow h-px w-8" />
                <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                  Continue conhecendo
                </span>
              </div>
              <h2
                className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.875rem, 4.5vw, 3rem)',
                  letterSpacing: '-0.035em',
                }}
              >
                Aprofunde-se em
                <br />
                <span className="text-brand-yellow-deep">qualidade e garantia.</span>
              </h2>
              <p className="text-brand-iron mt-5 max-w-xl text-base md:text-lg">
                Sustentabilidade caminha junto com qualidade. Conheça os processos auditados da
                Original Filter e nossa política de garantia.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <Link
                href="/qualidade"
                className="bg-brand-black hover:bg-brand-graphite font-display inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Política de qualidade
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/garantia"
                className="border-brand-black hover:bg-brand-black font-display inline-flex w-full items-center justify-center gap-2 border-2 px-6 py-3.5 text-sm font-semibold tracking-wide uppercase transition hover:text-white lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Política de garantia
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contato"
                className="border-brand-black hover:bg-brand-black font-display inline-flex w-full items-center justify-center gap-2 border-2 px-6 py-3.5 text-sm font-semibold tracking-wide uppercase transition hover:text-white lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Falar com a equipe
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── MiniStat (sidebar) ───
function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-brand-snow text-brand-yellow-deep flex size-8 shrink-0 items-center justify-center [&>svg]:size-4">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-brand-iron font-mono text-[10px] tracking-[0.22em] uppercase">
          {label}
        </div>
        <div className="font-display text-brand-black text-sm font-bold">{value}</div>
      </div>
    </div>
  );
}
