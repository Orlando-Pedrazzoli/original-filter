/* ══════════════════════════════════════════
   /cross-reference — Conversor de Filtros
   ──────────────────────────────────────────
   Client Component com 3 estados:
   - SEM query: hero amarelo + input grande + fabricantes + "como funciona"
   - COM query (?code=X): hero compacto + resultados com badges de match
   - SEM resultados: EmptyState elegante com CTAs
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Hash,
  ArrowRight,
  Zap,
  CheckCircle2,
  Search,
  Lightbulb,
  Headphones,
  MessageSquare,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { PageHero } from '@/components/shared/page-hero';
import { EmptyState } from '@/components/shared/empty-state';
import { CrossRefResults } from '@/components/cross-reference/cross-ref-results';
import type { CrossRefResponse } from '@/lib/search-types';

const SUPPORTED_BRANDS = [
  'Mann',
  'Donaldson',
  'Tecfil',
  'Wega',
  'Mahle',
  'Fleetguard',
  'Baldwin',
  'Volvo',
  'Scania',
  'Mercedes-Benz',
  'DAF',
  'Caterpillar',
];

const EXAMPLE_CODES = [
  { code: 'OFA2023C', label: 'Original Filter', kind: 'sku' },
  { code: 'W1170', label: 'Mann', kind: 'oem' },
  { code: 'P181054', label: 'Donaldson', kind: 'oem' },
  { code: '21380475', label: 'Volvo', kind: 'oem' },
];

export default function CrossReferencePage() {
  const sp = useSearchParams();
  const code = sp.get('code')?.trim() ?? '';

  if (!code) {
    return <EntryState />;
  }

  return <ResultsState code={code} />;
}

// ══════════════════════════════════════════
//   ESTADO A — entrada limpa
// ══════════════════════════════════════════
function EntryState() {
  const router = useRouter();
  const [input, setInput] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim();
    if (v.length < 3) return;
    router.push(`/cross-reference?code=${encodeURIComponent(v)}`);
  }

  return (
    <>
      {/* Hero amarelo impactante */}
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
            <span className="text-brand-black/40">/</span>
            <span className="text-brand-black">Cross-Reference</span>
          </nav>

          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="mb-5 flex items-center gap-3">
                <Zap className="text-brand-black size-5" strokeWidth={2.5} fill="currentColor" />
                <span className="text-brand-black/70 font-mono text-[11px] tracking-[0.25em] uppercase">
                  Cross-Reference · Conversor de Filtros
                </span>
              </div>

              <h1
                className="font-display text-brand-black leading-[0.9] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
                  letterSpacing: '-0.04em',
                }}
              >
                Já compra
                <br />
                outra marca?
              </h1>

              <p className="text-brand-black/80 mt-6 max-w-xl text-base leading-relaxed md:text-xl">
                Digite o código original (Mann, Donaldson, Tecfil, Wega, Mahle ou da montadora) e
                descubra na hora qual <span className="font-bold">Original Filter</span> equivale.
              </p>
            </div>

            {/* Formulário */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <form onSubmit={submit} className="bg-brand-black p-6 md:p-7">
                <label
                  htmlFor="cross-ref-input"
                  className="text-brand-yellow mb-3 block font-mono text-[10px] tracking-[0.22em] uppercase"
                >
                  Código do filtro
                </label>
                <div className="relative">
                  <Hash
                    className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40"
                    strokeWidth={2}
                  />
                  <input
                    id="cross-ref-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value.toUpperCase())}
                    placeholder="Ex: W1170, OFA2023C..."
                    autoComplete="off"
                    autoFocus
                    spellCheck={false}
                    className="bg-brand-graphite focus:border-brand-yellow w-full border border-white/10 py-4 pr-4 pl-12 font-mono text-base font-medium tracking-wider text-white uppercase transition outline-none placeholder:text-white/30"
                    style={{ borderRadius: 'var(--radius-edge)' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={input.trim().length < 3}
                  className="btn-primary mt-4 w-full disabled:opacity-40"
                >
                  Encontrar equivalência
                  <ArrowRight className="size-4" />
                </button>

                {/* Exemplos clicáveis */}
                <div className="mt-5 border-t border-white/10 pt-4">
                  <div className="mb-2 font-mono text-[9px] tracking-widest text-white/40 uppercase">
                    Experimente:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {EXAMPLE_CODES.map((ex) => (
                      <button
                        key={ex.code}
                        type="button"
                        onClick={() => {
                          setInput(ex.code);
                          router.push(`/cross-reference?code=${encodeURIComponent(ex.code)}`);
                        }}
                        className="group hover:bg-brand-yellow hover:text-brand-black hover:border-brand-yellow inline-flex items-center gap-1.5 border border-white/5 bg-white/5 px-2 py-1 text-white/70 transition"
                        style={{ borderRadius: 'var(--radius-edge)' }}
                      >
                        <span className="font-mono text-[10px] font-bold tracking-wider">
                          {ex.code}
                        </span>
                        <span className="font-mono text-[9px] tracking-widest uppercase opacity-60 group-hover:opacity-100">
                          {ex.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fabricantes aceitos */}
      <section className="bg-brand-snow border-brand-mist border-y py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
              Fabricantes aceitos
            </span>
          </div>
          <h2
            className="font-display text-brand-black mb-8 font-black"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              letterSpacing: '-0.025em',
            }}
          >
            Códigos de todos os grandes fabricantes do mercado.
          </h2>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_BRANDS.map((b) => (
              <span
                key={b}
                className="bg-brand-white border-brand-mist font-display text-brand-iron inline-flex items-center border px-3 py-1.5 text-sm font-semibold"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                {b}
              </span>
            ))}
            <span className="bg-brand-black text-brand-yellow font-display inline-flex items-center px-3 py-1.5 text-sm font-semibold">
              + outros
            </span>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-brand-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="mb-12">
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-brand-yellow h-px w-8" />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Como funciona
              </span>
            </div>
            <h2
              className="font-display text-brand-black font-black"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Três passos. Resultado imediato.
            </h2>
          </div>

          <div className="bg-brand-mist grid grid-cols-1 gap-px md:grid-cols-3">
            {STEPS.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA ajuda técnica */}
      <HelpCTA />
    </>
  );
}

const STEPS = [
  {
    icon: Hash,
    title: 'Digite o código',
    description:
      'Copie do filtro que você já usa: número da montadora, Mann, Donaldson, Tecfil ou outro fabricante.',
  },
  {
    icon: Search,
    title: 'Buscamos a equivalência',
    description:
      'Nosso sistema confere o código contra a base completa de cross-reference do catálogo Original Filter.',
  },
  {
    icon: CheckCircle2,
    title: 'Veja o produto equivalente',
    description:
      'Lista de produtos Original Filter compatíveis, com badge indicando a confiança do match.',
  },
];

function StepCard({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-brand-white relative p-8"
    >
      <div className="bg-brand-yellow absolute top-8 bottom-8 left-0 w-1" />
      <div className="pl-5">
        <div className="text-brand-iron mb-3 font-mono text-[10px] tracking-[0.22em] uppercase">
          Passo {String(index + 1).padStart(2, '0')}
        </div>
        <Icon className="text-brand-black mb-4 size-9" strokeWidth={1.5} />
        <h3
          className="font-display text-brand-black leading-tight font-black"
          style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)', letterSpacing: '-0.02em' }}
        >
          {step.title}
        </h3>
        <p className="text-brand-steel mt-3 text-sm leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}

function HelpCTA() {
  return (
    <section className="bg-brand-black relative overflow-hidden py-16 text-white md:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-12">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Lightbulb className="text-brand-yellow size-5" strokeWidth={2} />
              <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
                Não tem certeza do código?
              </span>
            </div>
            <h2
              className="font-display leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Nossa equipe pode
              <br />
              <span className="text-brand-yellow">conferir para você.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
              Envie a referência da peça antiga ou foto do filtro atual. Nossa equipe técnica
              retorna com o equivalente Original Filter certo para sua aplicação.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <Link href="/contato" className="btn-primary w-full lg:w-auto">
              <MessageSquare className="size-4" />
              Falar com a equipe técnica
            </Link>
            <a
              href="tel:+551146133454"
              className="font-display inline-flex w-full items-center justify-center gap-2 border border-white/25 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition hover:bg-white/10 lg:w-auto"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <Headphones className="size-4" />
              +55 11 4613-3454
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════
//   ESTADO B — com resultados
// ══════════════════════════════════════════
function ResultsState({ code }: { code: string }) {
  const router = useRouter();
  const [data, setData] = useState<CrossRefResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refineInput, setRefineInput] = useState(code);

  const apiUrl = useMemo(
    () => `/api/products/cross-reference?code=${encodeURIComponent(code)}`,
    [code],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setRefineInput(code);

    fetch(apiUrl)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json())?.error ?? 'Erro');
        return r.json() as Promise<CrossRefResponse>;
      })
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError((err as Error).message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiUrl, code]);

  function refineSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = refineInput.trim();
    if (v.length < 3) return;
    router.push(`/cross-reference?code=${encodeURIComponent(v)}`);
  }

  // Loading
  if (loading) {
    return (
      <>
        <PageHero
          eyebrow="Buscando equivalência"
          title={`Procurando "${code}"...`}
          breadcrumbs={[
            { label: 'Início', href: '/' },
            { label: 'Cross-Reference', href: '/cross-reference' },
          ]}
          variant="dark"
          size="sm"
        />
        <section className="bg-brand-snow py-16">
          <div className="mx-auto max-w-5xl px-4 md:px-12">
            <div className="text-brand-iron flex items-center justify-center gap-3">
              <Loader2 className="size-5 animate-spin" />
              <span className="font-mono text-sm tracking-widest uppercase">
                Consultando base de cross-reference...
              </span>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Erro
  if (error || !data) {
    return (
      <>
        <PageHero
          eyebrow="Cross-Reference"
          title="Algo deu errado."
          breadcrumbs={[
            { label: 'Início', href: '/' },
            { label: 'Cross-Reference', href: '/cross-reference' },
          ]}
          variant="dark"
          size="sm"
        />
        <section className="bg-brand-snow py-16">
          <div className="mx-auto max-w-3xl px-4 md:px-12">
            <EmptyState
              title="Não foi possível buscar"
              description={error ?? 'Erro desconhecido na busca.'}
              actions={[
                { label: 'Tentar novamente', href: '/cross-reference' },
                {
                  label: 'Falar com a equipe',
                  href: '/contato',
                  variant: 'secondary',
                },
              ]}
            />
          </div>
        </section>
      </>
    );
  }

  // Sem resultados
  if (data.total === 0) {
    return (
      <>
        <PageHero
          eyebrow={`Código pesquisado: ${code}`}
          title="Não encontramos equivalência."
          breadcrumbs={[
            { label: 'Início', href: '/' },
            { label: 'Cross-Reference', href: '/cross-reference' },
          ]}
          variant="dark"
          size="sm"
        />
        <section className="bg-brand-snow py-16">
          <div className="mx-auto max-w-3xl space-y-8 px-4 md:px-12">
            {data.pendingOemData && <PendingOemNotice />}

            <EmptyState
              eyebrow="Nenhum match"
              title={`"${code}" não foi encontrado na nossa base.`}
              description="Pode ser que nossa equipe técnica tenha o equivalente. Envie o código e confirmamos a compatibilidade em poucas horas."
              actions={[
                {
                  label: 'Enviar para análise técnica',
                  href: `/contato?codigo=${encodeURIComponent(code)}`,
                },
                {
                  label: 'Tentar outro código',
                  href: '/cross-reference',
                  variant: 'secondary',
                },
              ]}
            />
          </div>
        </section>
      </>
    );
  }

  // Resultados encontrados
  return (
    <>
      <PageHero
        eyebrow={`${data.total} ${data.total === 1 ? 'equivalência encontrada' : 'equivalências encontradas'}`}
        title={`Resultados para "${code}"`}
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Cross-Reference', href: '/cross-reference' },
        ]}
        variant="dark"
        size="sm"
        right={
          <Link
            href="/cross-reference"
            className="hover:border-brand-yellow hover:text-brand-yellow font-display inline-flex items-center gap-2 border border-white/25 px-4 py-2 text-xs font-semibold tracking-wide text-white uppercase transition"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            Nova busca
          </Link>
        }
      />

      <section className="bg-brand-snow py-12 md:py-16">
        <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">
          {/* Aviso de OEM em construção */}
          {data.pendingOemData && <PendingOemNotice />}

          {/* Resultados */}
          <CrossRefResults matches={data.matches} queriedCode={code} />
        </div>
      </section>

      {/* Refinar busca */}
      <section className="bg-brand-white border-brand-mist border-t py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-12">
          <div className="mb-8 text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <div className="bg-brand-yellow h-px w-8" />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Buscar outro código
              </span>
              <div className="bg-brand-yellow h-px w-8" />
            </div>
            <h2
              className="font-display text-brand-black font-black"
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                letterSpacing: '-0.025em',
              }}
            >
              Tem mais um filtro?
            </h2>
            <p className="text-brand-iron mx-auto mt-3 max-w-md">
              Pesquise outro código abaixo ou fale com nossa equipe técnica.
            </p>
          </div>

          <form onSubmit={refineSubmit} className="relative">
            <Hash
              className="text-brand-steel pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
              strokeWidth={2}
            />
            <input
              type="text"
              value={refineInput}
              onChange={(e) => setRefineInput(e.target.value.toUpperCase())}
              placeholder="Digite o código..."
              autoComplete="off"
              spellCheck={false}
              className="border-brand-mist focus:border-brand-yellow w-full border-2 bg-white py-4 pr-32 pl-12 font-mono text-base font-medium tracking-wider uppercase transition outline-none"
              style={{ borderRadius: 'var(--radius-edge)' }}
            />
            <button
              type="submit"
              disabled={refineInput.trim().length < 3}
              className="btn-primary absolute top-1/2 right-2 -translate-y-1/2 px-4 py-2 text-xs disabled:opacity-40"
            >
              Buscar
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/contato"
              className="font-display text-brand-iron hover:text-brand-yellow-deep inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase transition"
            >
              Falar com a equipe técnica
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// ══════════════════════════════════════════
//   Aviso de OEM pendente
// ══════════════════════════════════════════
function PendingOemNotice() {
  return (
    <div
      className="bg-brand-yellow/10 border-brand-yellow-deep/30 flex items-start gap-4 border p-5 md:p-6"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <div className="bg-brand-yellow text-brand-black flex size-10 shrink-0 items-center justify-center">
        <AlertCircle className="size-4" strokeWidth={2.5} />
      </div>
      <div>
        <div className="text-brand-yellow-deep mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
          Tabela em construção
        </div>
        <div className="font-display text-brand-black text-lg leading-tight font-bold">
          Estamos populando os códigos OEM.
        </div>
        <div className="text-brand-iron mt-2 max-w-2xl text-sm leading-relaxed">
          A base de cross-reference está em atualização constante. Para confirmar a equivalência
          específica do seu código,{' '}
          <Link
            href="/contato"
            className="hover:text-brand-yellow-deep underline underline-offset-2"
          >
            fale com nossa equipe técnica
          </Link>{' '}
          — retornamos em poucas horas.
        </div>
      </div>
    </div>
  );
}
