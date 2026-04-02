import Link from 'next/link';
import { Search, ArrowRight, Shield, Award, Truck } from 'lucide-react';
import { MAIN_BRANDS, FILTER_CATEGORIES, CERTIFICATIONS } from '@/lib/constants';

export default function HomePage() {
  return (
    <>
      {/* ══════ HERO ══════ */}
      <section className="bg-dark relative text-white">
        <div className="container-custom flex flex-col items-center py-20 text-center lg:py-32">
          <h1 className="mb-6 max-w-4xl text-4xl leading-tight font-black lg:text-6xl">
            Encontre o filtro <span className="text-brand">perfeito</span> para o seu veículo
          </h1>
          <p className="mb-10 max-w-2xl text-lg text-gray-400">
            Mais de 481 filtros automotivos, agrícolas e industriais. Qualidade certificada IATF
            16949, QS 9000 e ISO 9001.
          </p>

          {/* Barra de busca */}
          <div className="flex w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex flex-1 items-center gap-3 px-5">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Busque por código, conversão ou veículo..."
                className="text-dark w-full py-4 text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <Link
              href="/produtos"
              className="bg-brand text-dark hover:bg-brand-hover flex items-center px-6 font-bold transition-colors"
            >
              Buscar
            </Link>
          </div>

          {/* Certificações */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {CERTIFICATIONS.map((cert) => (
              <span
                key={cert}
                className="rounded-full border border-gray-700 px-4 py-1.5 text-xs text-gray-400"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ MONTADORAS ══════ */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <h2 className="text-dark mb-10 text-center text-2xl font-bold">Montadoras atendidas</h2>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
            {MAIN_BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/produtos/marca/${brand.slug}`}
                className="border-surface-alt bg-surface text-dark hover:border-brand flex h-20 items-center justify-center rounded-xl border text-center text-sm font-semibold transition-all hover:shadow-md"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CATEGORIAS DE FILTRO ══════ */}
      <section className="bg-surface py-16">
        <div className="container-custom">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-dark text-2xl font-bold">Nossos produtos</h2>
              <p className="text-muted-dark mt-2">Linha completa de filtros de reposição</p>
            </div>
            <Link
              href="/produtos"
              className="text-dark hover:text-brand hidden items-center gap-2 text-sm font-semibold transition-colors sm:flex"
            >
              Ver catálogo completo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FILTER_CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat.slug}
                href={`/produtos/categoria/${cat.slug}`}
                className="group border-surface-alt hover:border-brand flex items-center gap-4 rounded-xl border bg-white p-5 transition-all hover:shadow-md"
              >
                <div className="bg-brand/10 text-brand group-hover:bg-brand group-hover:text-dark flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-colors">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-dark font-semibold">{cat.name}</h3>
                  <p className="text-muted-dark text-sm">Ver produtos</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/produtos"
              className="text-dark inline-flex items-center gap-2 text-sm font-semibold"
            >
              Ver catálogo completo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ DIFERENCIAIS ══════ */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <h2 className="text-dark mb-10 text-center text-2xl font-bold">
            Por que escolher a Original Filter?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: 'Qualidade Certificada',
                description:
                  'Certificações IATF 16949, QS 9000 e ISO 9001. Cada filtro passa por rigorosos testes em laboratórios avançados.',
              },
              {
                icon: Award,
                title: 'Linha Completa',
                description:
                  'Mais de 481 produtos para transporte, agrícola, industrial e fora-de-estrada. Atendemos as principais montadoras mundiais.',
              },
              {
                icon: Truck,
                title: 'Distribuição Eficiente',
                description:
                  'Sede em Cotia/SP, junto às principais rodovias. Estoque robusto para atendimento ágil em todo o Brasil.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border-surface-alt rounded-xl border p-8 text-center"
              >
                <div className="bg-brand/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                  <item.icon className="text-brand h-7 w-7" />
                </div>
                <h3 className="text-dark mb-3 text-lg font-bold">{item.title}</h3>
                <p className="text-muted-dark text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section className="bg-dark py-16 text-white">
        <div className="container-custom text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Precisa de ajuda para encontrar o filtro certo?
          </h2>
          <p className="mb-8 text-gray-400">
            Nossa equipe de especialistas está pronta para ajudar.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contato"
              className="bg-brand text-dark hover:bg-brand-hover rounded-xl px-8 py-3.5 font-bold transition-colors"
            >
              Solicitar Orçamento
            </Link>
            <Link
              href="/produtos"
              className="hover:border-brand hover:text-brand rounded-xl border border-gray-700 px-8 py-3.5 font-bold transition-colors"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
