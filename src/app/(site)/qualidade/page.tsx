/* ══════════════════════════════════════════
   /qualidade — Política de Qualidade
   ──────────────────────────────────────────
   Server Component (SEO crítico).
   Conteúdo modernizado preservando os fatos do site original.

   Estrutura (7 seções):
   1. PageHero dark
   2. Statement institucional sobre qualidade
   3. Certifications (reuso de AboutCertifications)
   4. QualityPillars — 4 pilares
   5. QualityLabTests — testes laboratoriais (diferencial técnico)
   6. QualityCommitment — compromisso com clientes
   7. CTA final → /garantia
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileText, Shield } from 'lucide-react';
import { PageHero } from '@/components/shared/page-hero';
import { AboutCertifications } from '@/components/about/about-certifications';
import { QualityPillars } from '@/components/quality/quality-pillars';
import { QualityLabTests } from '@/components/quality/quality-lab-tests';
import { QualityCommitment } from '@/components/quality/quality-commitment';

export const metadata: Metadata = {
  title: 'Política de Qualidade — Original Filter',
  description:
    'Política de qualidade Original Filter: normas IATF 16949:2016, QS 9000 ' +
    'e ISO 9001, laboratórios próprios, processos auditados e controle ' +
    'rigoroso em cada lote. Conheça nosso compromisso com a excelência.',
};

export default function QualidadePage() {
  return (
    <>
      {/* ─── 1. Hero ─── */}
      <PageHero
        eyebrow="Política de Qualidade"
        title="Qualidade e compromisso com a filtragem."
        description="Auditados pelas normas IATF 16949:2016, QS 9000 e ISO 9001. Laboratórios próprios e processos padronizados garantem que cada filtro Original Filter mantenha o mesmo padrão de excelência."
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Quem somos', href: '/sobre' },
          { label: 'Política de Qualidade' },
        ]}
        variant="dark"
        size="lg"
      />

      {/* ─── 2. Statement institucional ─── */}
      <section className="bg-brand-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Eyebrow + título à esquerda */}
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
                  Excelência na
                  <br />
                  <span className="text-brand-yellow-deep">filtragem de fluidos.</span>
                </h2>
              </div>
            </div>

            {/* Texto à direita */}
            <div className="text-brand-iron space-y-6 text-base leading-relaxed md:text-lg lg:col-span-8">
              <p>
                A <strong className="text-brand-black">Original Filter</strong> destaca-se pela
                excelência na filtragem de fluidos. Nossa política de qualidade reflete o
                compromisso em oferecer produtos confiáveis e eficientes para os mercados
                automotivo, agrícola, industrial e fora-de-estrada.
              </p>

              <p>
                Trabalhamos em estreita colaboração com os fabricantes globais de equipamentos,
                máquinas, caminhões e veículos. Cada filtro é projetado para atender às
                especificações mais rigorosas, garantindo filtragem eficaz e proteção dos
                componentes.
              </p>

              <p>
                Utilizamos componentes premium em todos os nossos produtos —{' '}
                <strong className="text-brand-black">vedações</strong>,{' '}
                <strong className="text-brand-black">elementos filtrantes</strong> e{' '}
                <strong className="text-brand-black">estruturas</strong> são escolhidos com cuidado
                para garantir a máxima eficiência e durabilidade.
              </p>

              <p className="font-display text-brand-black text-lg font-semibold md:text-xl">
                Na Original Filter, qualidade é mais do que um padrão — é a base da nossa reputação.
              </p>

              {/* Atalhos rápidos */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Link
                  href="#certificacoes"
                  className="text-brand-iron border-brand-mist hover:border-brand-black hover:text-brand-black inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs tracking-widest uppercase transition"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  ↓ Normas internacionais
                </Link>
                <Link
                  href="#pilares"
                  className="text-brand-iron border-brand-mist hover:border-brand-black hover:text-brand-black inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs tracking-widest uppercase transition"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  ↓ 4 pilares
                </Link>
                <Link
                  href="#testes"
                  className="text-brand-iron border-brand-mist hover:border-brand-black hover:text-brand-black inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs tracking-widest uppercase transition"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  ↓ Testes laboratoriais
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Certificações (reuso) ─── */}
      <div id="certificacoes">
        <AboutCertifications />
      </div>

      {/* ─── 4. 4 Pilares ─── */}
      <div id="pilares">
        <QualityPillars />
      </div>

      {/* ─── 5. Testes laboratoriais (diferencial técnico) ─── */}
      <div id="testes">
        <QualityLabTests />
      </div>

      {/* ─── 6. Compromisso com clientes ─── */}
      <QualityCommitment />

      {/* ─── 7. CTA final ─── */}
      <section className="bg-brand-yellow relative overflow-hidden py-16 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, transparent, transparent 16px, #000 16px, #000 17px)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 md:px-12">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <Shield className="text-brand-black size-5" strokeWidth={2} />
                <span className="text-brand-black/70 font-mono text-[11px] tracking-[0.25em] uppercase">
                  Vai além da qualidade
                </span>
              </div>
              <h2
                className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.875rem, 4.5vw, 3rem)',
                  letterSpacing: '-0.035em',
                }}
              >
                Conheça também
                <br />
                nossa política de garantia.
              </h2>
              <p className="text-brand-black/80 mt-5 max-w-xl text-base md:text-lg">
                A garantia Original Filter cobre todos os defeitos de fabricação quando observadas
                as condições corretas de armazenamento e instalação. Saiba o que está coberto e
                nossos compromissos.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <Link
                href="/garantia"
                className="bg-brand-black hover:bg-brand-graphite font-display inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <FileText className="size-4" />
                Política de garantia
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/sustentabilidade"
                className="border-brand-black hover:bg-brand-black font-display inline-flex w-full items-center justify-center gap-2 border-2 px-6 py-3.5 text-sm font-semibold tracking-wide uppercase transition hover:text-white lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Sustentabilidade
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
