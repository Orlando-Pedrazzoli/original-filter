import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Wind,
  Droplets,
  Fuel,
  Gauge,
  Snowflake,
  Thermometer,
  ShieldCheck,
  Truck,
  Award,
  Headphones,
  ArrowRight,
} from 'lucide-react';
import HeroSphere from '@/components/home/hero-sphere';
import { MAIN_BRANDS, FILTER_CATEGORIES, CERTIFICATIONS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Original Filter | Especialista em Filtros Automotivos — Filtrando o futuro.',
  description:
    'Fabricante brasileira de filtros automotivos, agrícolas e industriais. Catálogo com 770+ produtos. Certificações IATF 16949, QS 9000, ISO 9001. Filtrando o futuro.',
};

const CATEGORY_ICONS: Record<string, typeof Wind> = {
  wind: Wind,
  droplets: Droplets,
  fuel: Fuel,
  gauge: Gauge,
  snowflake: Snowflake,
  fan: Thermometer,
};

const DIFERENCIAIS = [
  {
    icon: ShieldCheck,
    title: 'Qualidade Certificada',
    text: 'IATF 16949, QS 9000 e ISO 9001 — padrões internacionais de excelência em cada filtro.',
  },
  {
    icon: Truck,
    title: 'Distribuição Nacional',
    text: 'Estoque robusto em Cotia/SP com distribuição via Del Rey para todo o Brasil.',
  },
  {
    icon: Award,
    title: '770+ Produtos',
    text: 'Linha completa para transporte, agrícola, máquinas e equipamentos. Todas as montadoras.',
  },
  {
    icon: Headphones,
    title: 'Suporte Técnico',
    text: 'Equipe especializada disponível pelo SAC 0800 778 2000 para dúvidas e assistência.',
  },
];

const TOP_CATEGORIES = FILTER_CATEGORIES.filter((c) =>
  [
    'filtro-de-ar',
    'filtro-de-oleo',
    'filtro-de-combustivel',
    'filtro-hidraulico',
    'filtro-secador-de-ar',
    'filtro-de-arrefecimento',
  ].includes(c.slug),
);

export default function HomePage() {
  return (
    <>
      {/* ── Hero with Geometric Sphere ── */}
      <HeroSphere />

      {/* ── Montadoras ── */}
      <section className="border-surface-alt border-b bg-white py-12">
        <div className="container-custom">
          <p className="text-muted mb-8 text-center text-xs font-semibold tracking-[0.2em] uppercase">
            Filtros para as principais montadoras
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {MAIN_BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/produtos/marca/${brand.slug}`}
                className="text-muted-dark hover:text-brand-dark text-sm font-bold tracking-wider uppercase transition-colors"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categorias de Filtro ── */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center">
            <span className="text-brand-dark text-sm font-semibold tracking-widest uppercase">
              Nossos Produtos
            </span>
            <h2 className="font-heading text-dark mt-2 text-2xl font-bold md:text-3xl">
              Encontre o filtro ideal
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOP_CATEGORIES.map((cat) => {
              const IconComponent = CATEGORY_ICONS[cat.icon] || Wind;
              return (
                <Link
                  key={cat.slug}
                  href={`/produtos/categoria/${cat.slug}`}
                  className="group border-surface-alt hover:border-brand/30 hover:shadow-brand/5 flex items-center gap-4 rounded-2xl border bg-white p-5 transition-all hover:shadow-lg"
                >
                  <div className="bg-brand/10 text-brand group-hover:bg-brand group-hover:text-dark flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-dark text-base font-semibold">{cat.name}</h3>
                  </div>
                  <ArrowRight className="text-muted group-hover:text-brand h-4 w-4 transition-all group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/produtos"
              className="text-dark hover:text-brand-dark inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            >
              Ver todas as categorias
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Diferenciais ── */}
      <section className="bg-dark py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center">
            <span className="text-brand text-sm font-semibold tracking-widest uppercase">
              Por que escolher a Original Filter
            </span>
            <h2 className="font-heading mt-2 text-2xl font-bold text-white md:text-3xl">
              Excelência em cada detalhe
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DIFERENCIAIS.map((item) => (
              <div
                key={item.title}
                className="hover:border-brand/20 rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors"
              >
                <div className="bg-brand text-dark flex h-11 w-11 items-center justify-center rounded-lg">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="bg-brand relative overflow-hidden py-16 md:py-20">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="container-custom relative z-10 text-center">
          <h2 className="font-heading text-dark text-2xl font-bold md:text-4xl">
            Precisa de filtros para a sua frota?
          </h2>
          <p className="text-dark/70 mx-auto mt-4 max-w-xl">
            Solicite um orçamento personalizado. Nossa equipe técnica está pronta para encontrar a
            solução ideal para o seu negócio.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contato"
              className="bg-dark hover:bg-dark-soft inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white transition-all hover:shadow-lg"
            >
              Solicitar Orçamento
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="tel:08007782000"
              className="border-dark/20 text-dark hover:border-dark hover:bg-dark/5 inline-flex items-center gap-2 rounded-xl border-2 px-8 py-3.5 text-sm font-bold transition-colors"
            >
              SAC 0800 778 2000
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
