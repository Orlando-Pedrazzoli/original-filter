/* ══════════════════════════════════════════
   /garantia — Política de Garantia
   ──────────────────────────────────────────
   Server Component (SEO importante para garantia).
   Conteúdo modernizado preservando os fatos do site original.

   Estrutura (6 seções):
   1. PageHero dark
   2. Statement institucional + atalhos
   3. WarrantyCoverage — pré-requisitos + responsabilidade total
   4. WarrantyExclusions — exclusões + como acionar
   5. CTA final
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileText, Phone, ShieldCheck } from 'lucide-react';
import { PageHero } from '@/components/shared/page-hero';
import { WarrantyCoverage } from '@/components/warranty/warranty-coverage';
import { WarrantyExclusions } from '@/components/warranty/warranty-exclusions';
import { CONTACT } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Política de Garantia — Original Filter',
  description:
    'Política de Garantia Original Filter: cobertura para defeitos de ' +
    'fabricação, pré-requisitos de armazenamento e instalação, exclusões ' +
    'e processo completo de acionamento da garantia.',
};

export default function GarantiaPage() {
  return (
    <>
      {/* ─── 1. Hero ─── */}
      <PageHero
        eyebrow="Política de Garantia"
        title="Qualidade e confiança na filtragem."
        description="Nossa garantia cobre defeitos de fabricação quando observadas as condições corretas de armazenamento e instalação. Conheça o que está coberto, as exclusões e como acionar nossa equipe técnica."
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Quem somos', href: '/sobre' },
          { label: 'Política de Garantia' },
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
                    Compromisso por escrito
                  </span>
                </div>
                <h2
                  className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
                  style={{
                    fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                    letterSpacing: '-0.035em',
                  }}
                >
                  Garantia
                  <br />
                  <span className="text-brand-yellow-deep">Original Filter.</span>
                </h2>

                {/* Mini-info cards no sidebar */}
                <div className="border-brand-mist mt-8 hidden flex-col gap-3 border-t pt-8 lg:flex">
                  <SidebarInfo
                    icon={<ShieldCheck />}
                    label="Cobertura"
                    value="Defeitos de fabricação"
                  />
                  <SidebarInfo
                    icon={<FileText />}
                    label="Documentação"
                    value="Embalagem + nota fiscal"
                  />
                  <SidebarInfo icon={<Phone />} label="Acionamento" value={CONTACT.phone} />
                </div>
              </div>
            </div>

            {/* Texto principal */}
            <div className="text-brand-iron space-y-6 text-base leading-relaxed md:text-lg lg:col-span-8">
              <p>
                A <strong className="text-brand-black">Original Filter</strong> é uma empresa que
                preza pela qualidade dos seus filtros e pelo compromisso com seus clientes. Nossa
                garantia abrange possíveis defeitos de fabricação, desde que sejam seguidas as
                orientações de armazenamento e instalação descritas nesta política.
              </p>

              <p>
                Comprovado o defeito de fabricação,{' '}
                <strong className="text-brand-black">assumimos todos os custos</strong> de reparo
                necessários para devolver seu equipamento à condição anterior ao momento da falha.
                Nossa equipe técnica está pronta para avaliar e solucionar qualquer ocorrência
                relacionada aos nossos produtos.
              </p>

              <p>
                Além desta garantia por escrito, reforçamos nosso compromisso com a qualidade em
                cada filtro produzido. Nossa equipe de engenheiros e técnicos trabalha continuamente
                para oferecer produtos confiáveis e eficientes — auditados pelas normas IATF
                16949:2016, QS 9000 e ISO 9001.
              </p>

              <p className="font-display text-brand-black text-lg font-semibold md:text-xl">
                Escolha a Original Filter e tenha a tranquilidade de contar com filtros de alta
                performance e uma garantia que valoriza a sua satisfação.
              </p>

              {/* Atalhos âncora */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Link
                  href="#pre-requisitos"
                  className="text-brand-iron border-brand-mist hover:border-brand-black hover:text-brand-black inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs tracking-widest uppercase transition"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  ↓ Pré-requisitos
                </Link>
                <Link
                  href="#exclusoes"
                  className="text-brand-iron border-brand-mist hover:border-brand-black hover:text-brand-black inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs tracking-widest uppercase transition"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  ↓ Exclusões
                </Link>
                <Link
                  href="#acionar"
                  className="text-brand-iron border-brand-mist hover:border-brand-black hover:text-brand-black inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs tracking-widest uppercase transition"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  ↓ Como acionar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Pré-requisitos + Responsabilidade Total ─── */}
      <div id="pre-requisitos">
        <WarrantyCoverage />
      </div>

      {/* ─── 4. Exclusões + Como Acionar ─── */}
      <div id="exclusoes">
        <WarrantyExclusions />
      </div>

      {/* O id "acionar" precisa ficar no início da seção "Como acionar"
          que faz parte do WarrantyExclusions. Para isso, marcamos o pai
          como id alternativo. Em produção, se quiser id exato no "Como
          acionar", basta extrair a seção em componente próprio. */}
      <div id="acionar" />

      {/* ─── 5. CTA final ─── */}
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
                <ShieldCheck className="text-brand-black size-5" strokeWidth={2} />
                <span className="text-brand-black/70 font-mono text-[11px] tracking-[0.25em] uppercase">
                  Estamos à disposição
                </span>
              </div>
              <h2
                className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.875rem, 4.5vw, 3rem)',
                  letterSpacing: '-0.035em',
                }}
              >
                Dúvidas sobre garantia
                <br />
                ou já precisa acionar?
              </h2>
              <p className="text-brand-black/80 mt-5 max-w-xl text-base md:text-lg">
                Nossa equipe técnica está pronta para analisar seu caso. Ligue ou envie sua
                solicitação pelo formulário com os dados do produto.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <a
                href={`tel:${CONTACT.phoneRaw}`}
                className="bg-brand-black hover:bg-brand-graphite font-display inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <Phone className="size-4" />
                {CONTACT.phone}
              </a>
              <Link
                href="/contato?assunto=garantia"
                className="border-brand-black hover:bg-brand-black font-display inline-flex w-full items-center justify-center gap-2 border-2 px-6 py-3.5 text-sm font-semibold tracking-wide uppercase transition hover:text-white lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Formulário de garantia
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/qualidade"
                className="border-brand-black hover:bg-brand-black font-display inline-flex w-full items-center justify-center gap-2 border-2 px-6 py-3.5 text-sm font-semibold tracking-wide uppercase transition hover:text-white lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Política de qualidade
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Sidebar info card ───
function SidebarInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-brand-snow text-brand-yellow-deep flex size-8 shrink-0 items-center justify-center [&>svg]:size-4">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-brand-iron font-mono text-[10px] tracking-[0.22em] uppercase">
          {label}
        </div>
        <div className="font-display text-brand-black truncate text-sm font-bold">{value}</div>
      </div>
    </div>
  );
}
