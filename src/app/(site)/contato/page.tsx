/* ══════════════════════════════════════════
   /contato — Página de Contato
   ──────────────────────────────────────────
   Estrutura (5 seções):
   1. PageHero compacto
   2. Statement curto + atalhos âncora
   3. Layout principal: Formulário (8 cols) + Canais (4 cols)
   4. FAQ — perguntas rápidas
   5. CTA institucional
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, ShieldCheck, MessageCircle } from 'lucide-react';
import { PageHero } from '@/components/shared/page-hero';
import { ContactForm } from '@/components/contact/contact-form';
import { ContactChannels } from '@/components/contact/contact-channels';
import { CONTACT } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contato — Original Filter',
  description:
    'Fale com a Original Filter. Atendimento comercial, suporte técnico, ' +
    'cross-reference, garantia e logística reversa. Cotia-SP, Brasil.',
};

const FAQ_ITEMS = [
  {
    question: 'Em quanto tempo recebo uma resposta?',
    answer:
      'Nossa equipe responde solicitações em até 1 dia útil. Casos urgentes podem ser tratados pelo telefone +55 11 4613-3454 ou pelo SAC 0800 778 2000.',
  },
  {
    question: 'Como solicito o cross-reference de um filtro?',
    answer:
      'Use nossa ferramenta de cross-reference em /cross-reference. Digite o código do filtro de outra marca (Mann, Donaldson, Tecfil, etc.) e veremos a equivalência Original Filter. Se não encontrar, envie pelo formulário ao lado.',
  },
  {
    question: 'Quero me tornar revendedor. Como faço?',
    answer:
      'Selecione "Programa de Revendedor" no assunto do formulário e descreva sua empresa. Nossa equipe comercial entrará em contato em até 2 dias úteis com as condições do programa.',
  },
  {
    question: 'Como acionar a garantia de um filtro?',
    answer:
      'Selecione "Solicitação de Garantia" no assunto e informe o SKU do produto, data de aquisição e descrição da falha. Veja a política completa em /garantia.',
  },
  {
    question: 'Vocês atendem todo o Brasil?',
    answer:
      'Sim. Operamos a partir de Cotia-SP com distribuição nacional via rede de revendedores e distribuidores autorizados. Para grandes volumes, atendimento direto da fábrica.',
  },
];

export default function ContatoPage() {
  return (
    <>
      {/* ─── 1. Hero ─── */}
      <PageHero
        eyebrow="Fale conosco"
        title="Equipe técnica à disposição."
        description="Atendimento comercial, suporte técnico, cross-reference, garantia ou parcerias. Escolha o canal mais conveniente — respondemos rapidamente."
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Contato' }]}
        variant="dark"
        size="md"
      />

      {/* ─── 2. Big statement preto (telefone gigante) ─── */}
      <section className="bg-brand-black relative overflow-hidden text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-12 md:py-14">
          <div className="grid grid-cols-1 gap-px bg-white/5 md:grid-cols-3">
            {/* Telefone */}
            <a
              href={`tel:${CONTACT.phoneRaw}`}
              className="bg-brand-black hover:bg-brand-graphite group p-6 transition md:p-8"
            >
              <div className="text-brand-yellow mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
                Atendimento comercial
              </div>
              <div
                className="group-hover:text-brand-yellow font-mono font-bold tracking-tight text-white transition"
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                {CONTACT.phone}
              </div>
              <div className="mt-2 font-mono text-xs tracking-widest text-white/40 uppercase">
                Seg–sex · 08h às 18h
              </div>
            </a>

            {/* SAC */}
            <a
              href={`tel:${CONTACT.sacRaw}`}
              className="bg-brand-black hover:bg-brand-graphite group p-6 transition md:p-8"
            >
              <div className="text-brand-yellow mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
                SAC · gratuito
              </div>
              <div
                className="group-hover:text-brand-yellow font-mono font-bold tracking-tight text-white transition"
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                {CONTACT.sac}
              </div>
              <div className="mt-2 font-mono text-xs tracking-widest text-white/40 uppercase">
                Suporte ao consumidor
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${CONTACT.email}`}
              className="bg-brand-black hover:bg-brand-graphite group p-6 transition md:p-8"
            >
              <div className="text-brand-yellow mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
                Email institucional
              </div>
              <div
                className="group-hover:text-brand-yellow font-mono font-bold tracking-tight break-all text-white transition"
                style={{
                  fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                  letterSpacing: '-0.01em',
                }}
              >
                {CONTACT.email}
              </div>
              <div className="mt-2 font-mono text-xs tracking-widest text-white/40 uppercase">
                Resposta em até 1 dia útil
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 3. Layout principal: Formulário + Canais ─── */}
      <section id="formulario" className="bg-brand-snow py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          {/* Header */}
          <div className="mb-10 max-w-3xl md:mb-12">
            <div className="mb-4 flex items-center gap-3">
              <MessageCircle className="text-brand-iron size-4" strokeWidth={2} />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Envie sua mensagem
              </span>
            </div>
            <h2
              className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '-0.035em',
              }}
            >
              Como podemos
              <br />
              <span className="text-brand-yellow-deep">ajudar você?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Formulário (8 colunas) */}
            <div className="lg:col-span-8">
              <div
                className="bg-brand-white border-brand-mist border p-6 md:p-10"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <Suspense
                  fallback={
                    <div className="space-y-4">
                      <div className="bg-brand-mist h-3 w-32 animate-pulse" />
                      <div className="bg-brand-mist h-12 w-full animate-pulse" />
                      <div className="bg-brand-mist h-3 w-32 animate-pulse" />
                      <div className="bg-brand-mist h-12 w-full animate-pulse" />
                      <div className="bg-brand-mist h-3 w-32 animate-pulse" />
                      <div className="bg-brand-mist h-32 w-full animate-pulse" />
                    </div>
                  }
                >
                  <ContactForm />
                </Suspense>
              </div>
            </div>

            {/* Canais diretos (4 colunas) */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <div className="text-brand-iron mb-4 font-mono text-[10px] tracking-[0.22em] uppercase">
                  Ou fale direto
                </div>
                <ContactChannels />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. FAQ ─── */}
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
                  Antes de enviar uma mensagem, talvez a resposta esteja abaixo.
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

      {/* ─── 5. CTA institucional ─── */}
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
                  Conheça mais
                </span>
              </div>
              <h2
                className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.875rem, 4.5vw, 3rem)',
                  letterSpacing: '-0.035em',
                }}
              >
                Mais sobre
                <br />a Original Filter.
              </h2>
              <p className="text-brand-black/80 mt-5 max-w-xl text-base md:text-lg">
                Centro de Pesquisa e Desenvolvimento próprio em Cotia-SP, normas IATF 16949:2016, QS
                9000, ISO 9001 e linha completa de 370+ produtos. Conheça nossos diferenciais.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <Link
                href="/sobre"
                className="bg-brand-black hover:bg-brand-graphite font-display inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Quem somos
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
              <Link
                href="/produtos"
                className="border-brand-black hover:bg-brand-black font-display inline-flex w-full items-center justify-center gap-2 border-2 px-6 py-3.5 text-sm font-semibold tracking-wide uppercase transition hover:text-white lg:w-auto"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Catálogo completo
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
