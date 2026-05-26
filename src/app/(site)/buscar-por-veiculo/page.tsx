/* ══════════════════════════════════════════
   /buscar-por-veiculo — Landing de busca por veículo
   ──────────────────────────────────────────
   Client Component com 2 estados:
   - SEM query: hero + SearchHub grande + "como funciona" + atalhos
   - COM query (?brand=...): hero com resumo + KPIs + resultados agrupados
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Truck,
  Sprout,
  Mountain,
  Car,
  Factory,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Headphones,
  MessageSquare,
} from 'lucide-react';
import { PageHero } from '@/components/shared/page-hero';
import { EmptyState } from '@/components/shared/empty-state';
import { SearchHub } from '@/components/search/search-hub';
import { VehicleSummary } from '@/components/vehicle-search/vehicle-summary';
import { ResultsByCategory } from '@/components/vehicle-search/results-by-category';
import type { VehicleLine } from '@/lib/search-types';
import type { ProductCardData } from '@/components/products/product-card';

interface ApiResponse {
  query: {
    brand: string;
    model: string | null;
    engine: string | null;
    year: number | null;
  };
  total: number;
  items: ProductCardData[];
  byCategory: Record<string, ProductCardData[]>;
  byType: Record<string, number>;
}

const LINE_ICONS: Record<string, React.ElementType> = {
  rodoviario: Truck,
  agricola: Sprout,
  'maquinas-pesadas': Mountain,
  automotivo: Car,
  industrial: Factory,
};

export default function BuscarPorVeiculoPage() {
  const sp = useSearchParams();
  const brand = sp.get('brand');
  const model = sp.get('model');
  const engine = sp.get('engine');
  const year = sp.get('year');

  const hasQuery = !!brand;

  // ─── Estado A: sem query (entrada limpa) ───
  if (!hasQuery) {
    return <EntryState />;
  }

  // ─── Estado B: com query (resultados) ───
  return <ResultsState brand={brand} model={model} engine={engine} year={year} />;
}

// ══════════════════════════════════════════
//   ESTADO A — entrada limpa
// ══════════════════════════════════════════
function EntryState() {
  const [lines, setLines] = useState<VehicleLine[]>([]);

  useEffect(() => {
    fetch('/api/vehicle-selector/lines')
      .then((r) => r.json())
      .then((d: { lines: VehicleLine[] }) => setLines(d.lines ?? []))
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Busca por veículo"
        title="Encontre o filtro certo para sua frota."
        description="Selecione a linha, montadora e modelo do seu veículo. Em segundos você vê todos os filtros e sensores compatíveis."
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Por veículo' }]}
        variant="dark"
        size="md"
      />

      {/* SearchHub grande, sobreposto ao hero */}
      <section className="bg-brand-black relative pb-16 md:pb-20">
        <div className="mx-auto -mt-12 max-w-3xl px-4 md:px-12">
          <SearchHub variant="hero" defaultTab="vehicle" />
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-brand-snow py-16 md:py-20">
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
              Três passos. Resultado certo.
            </h2>
          </div>

          <div className="bg-brand-mist grid grid-cols-1 gap-px md:grid-cols-3">
            {STEPS.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Atalhos por linha */}
      {lines.length > 0 && (
        <section className="bg-brand-white border-brand-mist border-t py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-12">
            <div className="mb-10">
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-brand-yellow h-px w-8" />
                <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                  Atalhos
                </span>
              </div>
              <h2
                className="font-display text-brand-black font-black"
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  letterSpacing: '-0.025em',
                }}
              >
                Ou explore por linha de aplicação.
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {lines.map((line) => {
                const Icon = LINE_ICONS[line.slug] ?? Truck;
                return (
                  <Link
                    key={line.slug}
                    href={`/produtos?linha=${line.slug}`}
                    className="group bg-brand-snow border-brand-mist hover:border-brand-black hover:bg-brand-white border p-5 transition"
                    style={{ borderRadius: 'var(--radius-edge)' }}
                  >
                    <Icon
                      className="text-brand-iron group-hover:text-brand-black mb-3 size-8 transition"
                      strokeWidth={1.5}
                    />
                    <div className="font-display text-brand-black text-sm font-bold tracking-tight uppercase">
                      {line.label}
                    </div>
                    <div className="text-brand-iron mt-1 font-mono text-[10px] tracking-widest uppercase">
                      {line.brandCount ?? 0} marcas
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA ajuda técnica */}
      <HelpCTA />
    </>
  );
}

const STEPS = [
  {
    icon: Filter,
    title: 'Escolha a linha',
    description:
      'Selecione entre rodoviária, agrícola, máquinas pesadas, automotiva ou industrial.',
  },
  {
    icon: Search,
    title: 'Identifique o veículo',
    description:
      'Cascata de montadora → modelo → motor → ano. Quanto mais detalhes, mais preciso o resultado.',
  },
  {
    icon: CheckCircle2,
    title: 'Veja os compatíveis',
    description:
      'Lista completa de filtros e sensores agrupados por categoria, prontos para você ver detalhes.',
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
    <section className="bg-brand-yellow relative overflow-hidden py-16 md:py-20">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent, transparent 16px, #000 16px, #000 17px)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-12">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Headphones className="text-brand-black size-5" strokeWidth={2} />
              <span className="text-brand-black/70 font-mono text-[11px] tracking-[0.25em] uppercase">
                Não encontrou seu veículo?
              </span>
            </div>
            <h2
              className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Equipe técnica especializada
              <br />
              para tirar suas dúvidas.
            </h2>
            <p className="text-brand-black/80 mt-5 max-w-xl text-base leading-relaxed md:text-lg">
              Trabalhamos com aplicações fora-de-estrada, industriais e especiais. Nossa equipe pode
              confirmar a compatibilidade do filtro certo para sua aplicação específica.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <Link
              href="/contato"
              className="bg-brand-black hover:bg-brand-graphite font-display inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition lg:w-auto"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <MessageSquare className="size-4" />
              Falar com a equipe técnica
            </Link>
            <a
              href="tel:+551146133454"
              className="border-brand-black hover:bg-brand-black font-display inline-flex w-full items-center justify-center gap-2 border-2 px-6 py-3.5 text-sm font-semibold tracking-wide uppercase transition hover:text-white lg:w-auto"
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
function ResultsState({
  brand,
  model,
  engine,
  year,
}: {
  brand: string;
  model: string | null;
  engine: string | null;
  year: string | null;
}) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('brand', brand);
    if (model) params.set('model', model);
    if (engine) params.set('engine', engine);
    if (year) params.set('year', year);
    return `/api/products/by-vehicle?${params.toString()}`;
  }, [brand, model, engine, year]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(apiUrl)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json())?.error ?? 'Erro');
        return r.json() as Promise<ApiResponse>;
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
  }, [apiUrl]);

  // Resumo do veículo selecionado (para o hero)
  const vehicleLabel = [brand, model, engine, year].filter(Boolean).join(' · ');

  if (loading) {
    return <LoadingState vehicleLabel={vehicleLabel} />;
  }

  if (error || !data) {
    return (
      <>
        <PageHero
          eyebrow="Busca por veículo"
          title="Algo deu errado."
          description="Não conseguimos completar a busca. Tente novamente em instantes."
          breadcrumbs={[
            { label: 'Início', href: '/' },
            { label: 'Por veículo', href: '/buscar-por-veiculo' },
          ]}
          variant="dark"
        />
        <section className="bg-brand-snow py-16">
          <div className="mx-auto max-w-3xl px-4 md:px-12">
            <EmptyState
              title="Não foi possível carregar"
              description={error ?? 'Erro desconhecido na busca.'}
              actions={[
                { label: 'Refazer busca', href: '/buscar-por-veiculo' },
                { label: 'Falar com a equipe', href: '/contato', variant: 'secondary' },
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
          eyebrow="Busca por veículo"
          title="Nenhum filtro compatível encontrado."
          breadcrumbs={[
            { label: 'Início', href: '/' },
            { label: 'Por veículo', href: '/buscar-por-veiculo' },
          ]}
          variant="dark"
          size="sm"
        />
        <section className="bg-brand-snow py-16">
          <div className="mx-auto max-w-3xl px-4 md:px-12">
            <EmptyState
              eyebrow={`Veículo: ${vehicleLabel}`}
              title="Ainda não temos esta aplicação cadastrada."
              description="Pode ser que tenhamos o produto certo. Nossa equipe técnica pode confirmar a compatibilidade para sua aplicação específica."
              actions={[
                { label: 'Falar com a equipe', href: '/contato' },
                {
                  label: 'Refazer busca',
                  href: '/buscar-por-veiculo',
                  variant: 'secondary',
                },
              ]}
            />
          </div>
        </section>
      </>
    );
  }

  // Constrói KPIs por categoria
  const byCategoryCount = Object.fromEntries(
    Object.entries(data.byCategory).map(([k, v]) => [k, v.length]),
  );

  return (
    <>
      <PageHero
        eyebrow={`${data.total} ${data.total === 1 ? 'produto compatível' : 'produtos compatíveis'}`}
        title={`Filtros para ${data.query.brand}${data.query.model ? ` ${data.query.model}` : ''}.`}
        description={
          data.query.engine || data.query.year
            ? `Motor ${data.query.engine ?? '—'}${data.query.year ? ` · Ano ${data.query.year}` : ''}`
            : undefined
        }
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Por veículo', href: '/buscar-por-veiculo' },
          { label: data.query.brand },
        ]}
        variant="dark"
        size="sm"
      />

      <VehicleSummary query={data.query} total={data.total} byCategory={byCategoryCount} />

      <section className="bg-brand-snow py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <ResultsByCategory byCategory={data.byCategory} />
        </div>
      </section>

      {/* Refinar busca */}
      <section className="bg-brand-white border-brand-mist border-t py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-12">
          <div className="mb-8 text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <div className="bg-brand-yellow h-px w-8" />
              <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
                Refinar busca
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
              Não é o que procurava?
            </h2>
            <p className="text-brand-iron mx-auto mt-3 max-w-md">
              Refaça a busca selecionando outro veículo, ou consulte pelo código do filtro.
            </p>
          </div>
          <SearchHub variant="page" defaultTab="vehicle" />
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
//   Loading state
// ══════════════════════════════════════════
function LoadingState({ vehicleLabel }: { vehicleLabel: string }) {
  return (
    <>
      <PageHero
        eyebrow={`Buscando: ${vehicleLabel}`}
        title="Procurando filtros compatíveis..."
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Por veículo', href: '/buscar-por-veiculo' },
        ]}
        variant="dark"
        size="sm"
      />
      <section className="bg-brand-snow py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="space-y-12">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="border-brand-mist mb-6 flex items-center gap-4 border-b pb-4">
                  <div className="bg-brand-mist size-11 animate-pulse" />
                  <div>
                    <div className="bg-brand-mist mb-2 h-3 w-24 animate-pulse" />
                    <div className="bg-brand-mist h-6 w-48 animate-pulse" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="bg-brand-mist/40 aspect-[4/5] animate-pulse"
                      style={{ borderRadius: 'var(--radius-edge)' }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
