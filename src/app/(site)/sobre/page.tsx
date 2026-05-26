/* ══════════════════════════════════════════
   /sobre — Quem Somos Original Filter
   ──────────────────────────────────────────
   Server Component (SEO importante).
   Conteúdo modernizado preservando os fatos do site original.

   Estrutura:
   1. PageHero dark com slogan oficial
   2. "Quem Somos" — texto institucional modernizado
   3. Stats institucionais (catálogo, marcas, normas)
   4. AboutPillars — Missão / Visão / Valores
   5. AboutCertifications — IATF / QS / ISO
   6. AboutLocation — Cotia-SP + contatos diretos
   7. CTAs finais
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FlaskConical, Globe, Wrench } from 'lucide-react';
import { PageHero } from '@/components/shared/page-hero';
import { AboutPillars } from '@/components/about/about-pillars';
import { AboutCertifications } from '@/components/about/about-certifications';
import { AboutLocation } from '@/components/about/about-location';

export const metadata: Metadata = {
  title: 'Quem Somos — Original Filter',
  description:
    'A Original Filter é especialista em filtros automotivos, agrícolas, ' +
    'industriais e fora-de-estrada. Centro de Pesquisa & Desenvolvimento ' +
    'próprio em Cotia-SP. Normas IATF 16949:2016, QS 9000 e ISO 9001.',
};

export default function SobrePage() {
  return (
    <>
      {/* ─── 1. Hero ─── */}
      <PageHero
        eyebrow="Quem somos"
        title="Qualidade Superior em Filtros Automotivos e Sensores."
        description="Há anos a Original Filter se consolida como referência nacional na fabricação de filtros para frotas pesadas, máquinas agrícolas, equipamentos industriais e veículos fora-de-estrada."
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Quem somos' }]}
        variant="dark"
        size="lg"
      />

      {/* ─── 2. Quem Somos ─── */}
      <section className="bg-brand-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Eyebrow + título à esquerda */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-brand-yellow h-px w-8" />
                  <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                    Nossa história
                  </span>
                </div>
                <h2
                  className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
                  style={{
                    fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                    letterSpacing: '-0.035em',
                  }}
                >
                  Especialistas em
                  <br />
                  <span className="text-brand-yellow-deep">filtragem.</span>
                </h2>
              </div>
            </div>

            {/* Texto à direita */}
            <div className="text-brand-iron space-y-6 text-base leading-relaxed md:text-lg lg:col-span-8">
              <p>
                A <strong className="text-brand-black">Original Filter</strong> destaca-se no
                mercado brasileiro de autopeças como especialista em filtros automotivos, agrícolas,
                industriais e fora-de-estrada. Nossa linha completa de reposição é projetada para
                atender e superar as expectativas dos mais exigentes fabricantes mundiais de
                veículos.
              </p>

              <p>
                Nosso{' '}
                <strong className="text-brand-black">Centro de Pesquisa e Desenvolvimento</strong>{' '}
                está sempre alinhado com as inovações do mercado. Cada filtro passa por testes
                rigorosos em laboratórios avançados, conduzidos por uma equipe técnica altamente
                qualificada, garantindo excelência tanto no mercado nacional quanto internacional.
              </p>

              <p>
                Localizadas em <strong className="text-brand-black">Cotia, São Paulo</strong>,
                nossas instalações estratégicas, próximas às principais vias de acesso, viabilizam
                uma distribuição eficiente em todo o território nacional. Um estoque robusto garante
                atendimento ágil, qualidade competitiva e prazos seguros — atributos essenciais para
                distribuidores, oficinas e frotistas.
              </p>

              <p className="font-display text-brand-black text-lg font-semibold md:text-xl">
                Escolha a Original Filter para negócios de sucesso e a certeza de adquirir produtos
                que elevam a performance da sua frota.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Stats institucionais ─── */}
      <section className="bg-brand-snow border-brand-mist border-y py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="bg-brand-mist grid grid-cols-2 gap-px md:grid-cols-4">
            <StatBlock
              icon={<FlaskConical className="size-6" strokeWidth={1.5} />}
              eyebrow="P&D próprio"
              value="100%"
              label="Centro de Pesquisa e Desenvolvimento interno"
            />
            <StatBlock
              icon={<Wrench className="size-6" strokeWidth={1.5} />}
              eyebrow="Linha completa"
              value="370+"
              label="Filtros e sensores no catálogo ativo"
            />
            <StatBlock
              icon={<Globe className="size-6" strokeWidth={1.5} />}
              eyebrow="Cobertura"
              value="22"
              label="Montadoras atendidas no Brasil e exterior"
            />
            <StatBlock
              icon={<FlaskConical className="size-6" strokeWidth={1.5} />}
              eyebrow="Auditoria"
              value="3"
              label="Normas internacionais seguidas"
            />
          </div>
        </div>
      </section>

      {/* ─── 4. Pilares ─── */}
      <AboutPillars />

      {/* ─── 5. Certificações ─── */}
      <AboutCertifications />

      {/* ─── 6. Localização ─── */}
      <AboutLocation />

      {/* ─── 7. CTAs finais ─── */}
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
                <div className="bg-brand-black h-px w-8" />
                <span className="text-brand-black/70 font-mono text-[11px] tracking-[0.25em] uppercase">
                  Aprofunde-se
                </span>
              </div>
              <h2
                className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.875rem, 4.5vw, 3rem)',
                  letterSpacing: '-0.035em',
                }}
              >
                Conheça nossa
                <br />
                política completa.
              </h2>
              <p className="text-brand-black/80 mt-5 max-w-xl text-base md:text-lg">
                Detalhamos os processos de qualidade, compromissos ambientais e as condições de
                garantia que regem cada filtro Original Filter produzido.
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
                href="/sustentabilidade"
                className="border-brand-black hover:bg-brand-black font-display inline-flex w-full items-center justify-center gap-2 border-2 px-6 py-3.5 text-sm font-semibold tracking-wide uppercase transition hover:text-white lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Sustentabilidade
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

// ─── Stat block reusável ───
function StatBlock({
  icon,
  eyebrow,
  value,
  label,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-brand-snow relative p-6 md:p-8">
      <div className="bg-brand-yellow absolute top-6 bottom-6 left-0 w-0.5 md:top-8 md:bottom-8" />
      <div className="pl-4">
        <div className="text-brand-iron mb-3">{icon}</div>
        <div className="text-brand-iron mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
          {eyebrow}
        </div>
        <div
          className="font-display text-brand-black mb-3 leading-none font-black"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            letterSpacing: '-0.04em',
          }}
        >
          {value}
        </div>
        <div className="text-brand-steel text-xs leading-relaxed md:text-sm">{label}</div>
      </div>
    </div>
  );
}
