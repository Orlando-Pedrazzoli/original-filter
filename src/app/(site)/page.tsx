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
import BrandsCarousel from '@/components/home/brands-carousel';
import { FILTER_CATEGORIES, CERTIFICATIONS } from '@/lib/constants';

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
  ['filtro-de-ar', 'filtro-de-oleo', 'filtro-de-combustivel', 'filtro-hidraulico', 'filtro-secador-de-ar', 'filtro-de-arrefecimento'].includes(c.slug)
);

export default function HomePage() {
  return (
    <>
      {/* ── Hero with Geometric Sphere ── */}
      <HeroSphere />

      {/* ── Brands Infinite Carousel ── */}
      <BrandsCarousel />

      {/* ── Categorias de Filtro ── */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-brand-dark">
              Nossos Produtos
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-dark md:text-3xl">
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
                  className="group flex items-center gap-4 rounded-2xl border border-surface-alt bg-white p-5 transition-all hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-dark">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-base font-semibold text-dark">
                      {cat.name}
                    </h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted transition-all group-hover:translate-x-1 group-hover:text-brand" />
                </Link>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-dark transition-colors hover:text-brand-dark"
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
            <span className="text-sm font-semibold uppercase tracking-widest text-brand">
              Por que escolher a Original Filter
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-white md:text-3xl">
              Excelência em cada detalhe
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DIFERENCIAIS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-brand/20"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-dark">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="relative overflow-hidden bg-brand py-16 md:py-20">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="container-custom relative z-10 text-center">
          <h2 className="font-heading text-2xl font-bold text-dark md:text-4xl">
            Precisa de filtros para a sua frota?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-dark/70">
            Solicite um orçamento personalizado. Nossa equipe técnica está pronta para
            encontrar a solução ideal para o seu negócio.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contato"
              className="inline-flex items-center gap-2 rounded-xl bg-dark px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-dark-soft hover:shadow-lg"
            >
              Solicitar Orçamento
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="tel:08007782000"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-dark/20 px-8 py-3.5 text-sm font-bold text-dark transition-colors hover:border-dark hover:bg-dark/5"
            >
              SAC 0800 778 2000
            </a>
          </div>
        </div>
      </section>
    </>
  );
}