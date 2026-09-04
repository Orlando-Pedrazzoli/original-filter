// src/app/(site)/seja-revendedor/page.tsx
/* ══════════════════════════════════════════
   /seja-revendedor — Programa de Revendedores
   ──────────────────────────────────────────
   Página de captura B2B. Hero amarelo impactante (não dark).
   Formulário completo conectado à API /api/reseller-application.

   Estrutura (6 seções):
   1. Hero amarelo customizado (não usa PageHero)
   2. 4 KPIs do programa (faixa preta)
   3. Como funciona (3 passos)
   4. Para quem é (3 perfis)
   5. Formulário B2B (layout 8+4)
   6. FAQ + CTAs institucionais
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  Send,
  CheckCircle2,
  Truck,
  Store,
  Wrench,
  Award,
  Percent,
  Headphones,
  Globe,
  ChevronRight,
} from 'lucide-react';
import { ResellerForm } from '@/components/reseller/reseller-form';
import { ResellerBenefits } from '@/components/reseller/reseller-benefits';
import { CONTACT } from '@/lib/constants';
import { O_PATTERN_DARK } from '@/lib/brand-pattern';

export const metadata: Metadata = {
  title: 'Seja Revendedor — Original Filter',
  description:
    'Programa de revendedores Original Filter: descontos progressivos B2B, ' +
    'suporte comercial dedicado, linha completa de filtros e sensores. ' +
    'Cadastre-se e tenha condições especiais para sua empresa.',
};

const KPIS = [
  {
    icon: Percent,
    value: 'até 20%',
    label: 'Desconto B2B progressivo',
  },
  {
    icon: Headphones,
    value: 'Direto',
    label: 'Atendimento da equipe comercial',
  },
  {
    icon: Truck,
    value: '370+',
    label: 'Produtos no catálogo ativo',
  },
  {
    icon: Globe,
    value: '22',
    label: 'Montadoras atendidas',
  },
];

const HOW_IT_WORKS = [
  {
    icon: Send,
    title: 'Envio do cadastro',
    description:
      'Preencha o formulário com os dados da sua empresa, contato responsável e perfil comercial. Levará menos de 5 minutos.',
  },
  {
    icon: ClipboardCheck,
    title: 'Análise comercial',
    description:
      'Nossa equipe valida o CNPJ, avalia o perfil do negócio e prepara as condições adequadas para sua operação.',
  },
  {
    icon: CheckCircle2,
    title: 'Aprovação + condições',
    description:
      'Em até 2 dias úteis, você recebe email com as condições do programa, tabela de preços B2B e acesso à área do revendedor.',
  },
];

const PROFILES = [
  {
    icon: Store,
    title: 'Loja de autopeças',
    description:
      'Distribuidores varejistas que atendem o consumidor final ou pequenas frotas. Linha completa para giro de estoque.',
    requirements: [
      'CNPJ ativo no setor automotivo',
      'Histórico mínimo de 6 meses',
      'Volume de pelo menos 50 unidades/mês',
    ],
  },
  {
    icon: Wrench,
    title: 'Oficina mecânica',
    description:
      'Oficinas e centros de manutenção que aplicam filtros diretamente nos veículos dos clientes. Atendimento técnico priorizado.',
    requirements: [
      'CNPJ no segmento de manutenção',
      'Linha leve, pesada ou agrícola',
      'Consumo regular comprovável',
    ],
  },
  {
    icon: Building2,
    title: 'Frota / transportadora',
    description:
      'Empresas com frota própria que fazem manutenção interna. Atendimento direto da fábrica para grandes volumes.',
    requirements: [
      'Frota mínima de 10 veículos',
      'Manutenção própria ou contratada',
      'Volume consistente mensal',
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: 'Quanto tempo leva para receber retorno?',
    answer:
      'A análise da sua aplicação leva até 2 dias úteis. Você receberá um email com as condições do programa, tabela de preços B2B e instruções para acessar a área do revendedor.',
  },
  {
    question: 'Quais documentos preciso enviar?',
    answer:
      'No primeiro momento, apenas o formulário com CNPJ e dados da empresa. Após a aprovação inicial, podemos solicitar contrato social ou comprovante de inscrição estadual para finalizar o cadastro como revendedor oficial.',
  },
  {
    question: 'Existe pedido mínimo para revendedores?',
    answer:
      'Sim, há um pedido mínimo que varia conforme o segmento. As condições específicas serão apresentadas após a aprovação. A tabela de descontos progressiva cresce com o volume mensal.',
  },
  {
    question: 'Posso revender em todo o Brasil?',
    answer:
      'Sim. Operamos com distribuição nacional via transportadoras parceiras. Empresas em todo o território brasileiro podem se cadastrar — atendemos também regiões mais distantes com prazos competitivos.',
  },
  {
    question: 'O que diferencia o programa Original Filter?',
    answer:
      'Combinamos produtos auditados pelas normas IATF 16949:2016, QS 9000 e ISO 9001 com suporte técnico direto da fábrica, estoque robusto em Cotia-SP e equipe comercial dedicada ao revendedor — não terceirizada.',
  },
];

export default function SejaRevendedorPage() {
  return (
    <>
      {/* ═══ 1. HERO AMARELO ═══ */}
      <section className="bg-brand-yellow relative overflow-hidden">
        {/* Padrão diagonal sutil */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, transparent, transparent 16px, #000 16px, #000 17px)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-12 md:py-24">
          {/* Breadcrumb */}
          <nav className="mb-8 flex flex-wrap items-center gap-1 font-mono text-xs tracking-widest uppercase">
            <Link href="/" className="text-brand-black/60 hover:text-brand-black transition">
              Início
            </Link>
            <ChevronRight className="text-brand-black/40 size-3" />
            <span className="text-brand-black">Seja revendedor</span>
          </nav>

          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="mb-5 flex items-center gap-3">
                <Award className="text-brand-black size-5" strokeWidth={2} />
                <span className="text-brand-black/70 font-mono text-[11px] tracking-[0.25em] uppercase">
                  Programa de Revendedores
                </span>
              </div>

              <h1
                className="font-display text-brand-black leading-[0.9] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
                  letterSpacing: '-0.04em',
                }}
              >
                Seja parceiro
                <br />
                Original Filter.
              </h1>

              <p className="text-brand-black/80 mt-6 max-w-2xl text-base leading-relaxed md:text-xl">
                Distribuidores, oficinas, frotas e lojas de autopeças têm acesso a condições
                comerciais exclusivas, descontos progressivos e suporte técnico direto da fábrica.
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right">
              <Link
                href="#formulario-revendedor"
                className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex w-full items-center justify-center gap-2 px-6 py-4 text-sm font-bold tracking-wide uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Cadastrar minha empresa
                <ArrowRight className="size-4" />
              </Link>
              <div className="text-brand-black/60 mt-3 text-center font-mono text-xs tracking-widest uppercase lg:text-right">
                Análise em até 2 dias úteis
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2. KPIS ═══ */}
      <section className="bg-brand-black relative overflow-hidden text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={O_PATTERN_DARK} />

        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-12 md:py-12">
          <div className="grid grid-cols-2 gap-px bg-white/5 md:grid-cols-4">
            {KPIS.map((kpi) => (
              <div
                key={kpi.label}
                className="bg-brand-black hover:bg-brand-graphite p-5 transition md:p-7"
              >
                <kpi.icon className="text-brand-yellow mb-3 size-6" strokeWidth={1.75} />
                <div
                  className="font-display leading-none font-black tracking-tight text-white"
                  style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                    letterSpacing: '-0.035em',
                  }}
                >
                  {kpi.value}
                </div>
                <div className="mt-2 text-xs leading-relaxed text-white/60">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. COMO FUNCIONA ═══ */}
      <section className="bg-brand-snow py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="mb-12 max-w-3xl md:mb-16">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-brand-yellow h-px w-8" />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Como funciona
              </span>
            </div>
            <h2
              className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '-0.035em',
              }}
            >
              Processo simples.
              <br />
              <span className="text-brand-yellow-deep">Três passos do cadastro à aprovação.</span>
            </h2>
          </div>

          <div className="bg-brand-mist grid grid-cols-1 gap-px md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="bg-brand-white group hover:bg-brand-paper relative p-8 transition-colors md:p-10"
                >
                  <div className="font-display text-brand-mist/40 pointer-events-none absolute top-6 right-6 text-5xl leading-none font-black tracking-tighter md:text-6xl">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="bg-brand-yellow absolute top-8 bottom-8 left-0 w-1 md:top-10 md:bottom-10" />

                  <div className="relative pl-5">
                    <div className="bg-brand-black text-brand-yellow group-hover:bg-brand-graphite mb-5 flex size-12 items-center justify-center transition">
                      <Icon className="size-5" strokeWidth={2} />
                    </div>

                    <div className="text-brand-yellow-deep mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
                      Passo {String(i + 1).padStart(2, '0')}
                    </div>

                    <h3
                      className="font-display text-brand-black mb-3 leading-tight font-black"
                      style={{
                        fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {step.title}
                    </h3>

                    <p className="text-brand-steel text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 4. PARA QUEM É ═══ */}
      <section className="bg-brand-white border-brand-mist border-t py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="mb-12 max-w-3xl md:mb-16">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-brand-yellow h-px w-8" />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Para quem é
              </span>
            </div>
            <h2
              className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '-0.035em',
              }}
            >
              O programa atende
              <br />
              <span className="text-brand-yellow-deep">três perfis principais.</span>
            </h2>
            <p className="text-brand-iron mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
              Cada perfil tem condições próprias, mas todos compartilham os mesmos benefícios
              essenciais: produtos auditados, suporte técnico direto e descontos progressivos.
            </p>
          </div>

          <div className="bg-brand-mist grid grid-cols-1 gap-px md:grid-cols-3">
            {PROFILES.map((profile) => {
              const Icon = profile.icon;
              return (
                <div
                  key={profile.title}
                  className="bg-brand-white group hover:bg-brand-paper relative flex flex-col p-8 transition-colors md:p-10"
                >
                  <div className="bg-brand-yellow absolute top-8 bottom-8 left-0 w-1 md:top-10 md:bottom-10" />

                  <div className="flex h-full flex-col pl-5">
                    <Icon
                      className="text-brand-iron group-hover:text-brand-black mb-5 size-12 transition"
                      strokeWidth={1.5}
                    />

                    <h3
                      className="font-display text-brand-black mb-3 leading-tight font-black"
                      style={{
                        fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
                        letterSpacing: '-0.025em',
                      }}
                    >
                      {profile.title}
                    </h3>

                    <p className="text-brand-steel mb-5 text-sm leading-relaxed">
                      {profile.description}
                    </p>

                    <ul className="border-brand-mist mt-auto space-y-2 border-t pt-5">
                      {profile.requirements.map((req) => (
                        <li key={req} className="text-brand-iron flex items-start gap-2 text-xs">
                          <CheckCircle2
                            className="text-brand-yellow-deep mt-0.5 size-3.5 shrink-0"
                            strokeWidth={2}
                          />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 5. FORMULÁRIO ═══ */}
      <section id="formulario-revendedor" className="bg-brand-snow scroll-mt-24 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="mb-10 max-w-3xl md:mb-12">
            <div className="mb-4 flex items-center gap-3">
              <ClipboardCheck className="text-brand-iron size-4" strokeWidth={2} />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Cadastro de revendedor
              </span>
            </div>
            <h2
              className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '-0.035em',
              }}
            >
              Pronto para começar?
              <br />
              <span className="text-brand-yellow-deep">Preencha sua aplicação.</span>
            </h2>
            <p className="text-brand-iron mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
              Três etapas curtas: dados da empresa, contato responsável e perfil comercial. Levará
              menos de 5 minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Formulário (8 colunas) */}
            <div className="lg:col-span-8">
              <ResellerForm />
            </div>

            {/* Sidebar de benefícios (4 colunas) */}
            <div className="lg:col-span-4">
              <ResellerBenefits />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. FAQ ═══ */}
      <section className="bg-brand-white border-brand-mist border-t py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-brand-yellow h-px w-8" />
                  <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                    Perguntas frequentes
                  </span>
                </div>
                <h2
                  className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
                  style={{
                    fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                    letterSpacing: '-0.035em',
                  }}
                >
                  Dúvidas
                  <br />
                  <span className="text-brand-yellow-deep">comuns.</span>
                </h2>
                <p className="text-brand-iron mt-4 leading-relaxed">
                  Antes de se cadastrar, talvez a resposta esteja abaixo.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-brand-mist space-y-px">
                {FAQ_ITEMS.map((item, i) => (
                  <details
                    key={item.question}
                    className="group bg-brand-white hover:bg-brand-snow p-5 transition-colors md:p-6"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                      <div className="flex flex-1 items-start gap-3">
                        <span className="text-brand-yellow-deep mt-1 shrink-0 font-mono text-[10px] tracking-widest uppercase">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="font-display text-brand-black text-base leading-snug font-bold md:text-lg">
                          {item.question}
                        </h3>
                      </div>
                      <div className="text-brand-iron flex size-6 shrink-0 items-center justify-center transition-transform group-open:rotate-45">
                        <span className="text-xl leading-none font-light">+</span>
                      </div>
                    </summary>
                    <div className="text-brand-iron mt-4 pl-9 text-sm leading-relaxed md:text-base">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 7. CTA FINAL ═══ */}
      <section className="bg-brand-black relative overflow-hidden py-16 text-white md:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={O_PATTERN_DARK} />

        <div className="relative mx-auto max-w-7xl px-4 md:px-12">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <Headphones className="text-brand-yellow size-5" strokeWidth={2} />
                <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
                  Prefere conversar antes?
                </span>
              </div>
              <h2
                className="font-display leading-[0.95] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.875rem, 4.5vw, 3rem)',
                  letterSpacing: '-0.035em',
                }}
              >
                Equipe comercial
                <br />
                <span className="text-brand-yellow">à sua disposição.</span>
              </h2>
              <p className="mt-5 max-w-xl text-base text-white/70 md:text-lg">
                Tem dúvidas específicas sobre seu segmento ou volume? Fale direto com nossa equipe
                antes de enviar a aplicação.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <a
                href={`tel:${CONTACT.phoneRaw}`}
                className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright font-display inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold tracking-wide uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                {CONTACT.phone}
                <ArrowRight className="size-4" />
              </a>
              <Link
                href="/contato?assunto=revendedor"
                className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex w-full items-center justify-center gap-2 border-2 border-white/25 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Formulário de contato
              </Link>
              <Link
                href="/produtos"
                className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex w-full items-center justify-center gap-2 border-2 border-white/25 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Explorar catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
