import type { Metadata } from 'next';
import Image from 'next/image';
import { Factory, Target, Eye, Heart, Award, Users, Globe, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { CERTIFICATIONS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Sobre Nós | Original Filter',
  description:
    'Conheça a Original Filter — fabricante brasileira de filtros automotivos, agrícolas e industriais localizada em Cotia/SP. Certificações IATF 16949, QS 9000 e ISO 9001.',
  openGraph: {
    title: 'Sobre Nós | Original Filter',
    description: 'Fabricante brasileira de filtros com certificações internacionais de qualidade.',
  },
};

const VALUES = [
  {
    icon: Award,
    title: 'Excelência',
    text: 'Cada filtro produzido passa por rigorosos testes de vazão, eficiência de filtragem, resistência à pressão e durabilidade.',
  },
  {
    icon: Users,
    title: 'Compromisso',
    text: 'Construímos relacionamentos sólidos e duradouros com clientes, distribuidores e parceiros em todo o Brasil.',
  },
  {
    icon: Globe,
    title: 'Sustentabilidade',
    text: 'Adotamos logística reversa e embalagens sustentáveis para minimizar o impacto ambiental da nossa operação.',
  },
  {
    icon: TrendingUp,
    title: 'Inovação',
    text: 'Investimento contínuo em tecnologia de fabricação e laboratórios avançados para desenvolver produtos de alta performance.',
  },
];

const MILESTONES = [
  {
    year: 'Fundação',
    text: 'Início das operações em Cotia/SP, com foco em filtros para a linha de transporte pesado.',
  },
  {
    year: '2014',
    text: 'Lançamento do catálogo completo para utilitários, vans, ônibus e caminhões com mais de 480 produtos.',
  },
  {
    year: '2017',
    text: 'Investimento de R$ 1,5 milhão na expansão da fábrica, gerando 50 novos postos de trabalho.',
  },
  {
    year: 'Hoje',
    text: 'Linha completa para transporte, agrícola, máquinas e equipamentos com certificações internacionais.',
  },
];

export default function SobrePage() {
  return (
    <>
      <PageHeader
        title="Sobre a Original Filter"
        subtitle="Fabricante brasileira de filtros automotivos, agrícolas e industriais com certificações internacionais de qualidade."
        breadcrumbs={[{ label: 'A Empresa', href: '/sobre' }, { label: 'Sobre Nós' }]}
      />

      {/* ── Quem Somos ── */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-brand-dark text-sm font-semibold tracking-widest uppercase">
                Quem Somos
              </span>
              <h2 className="font-heading text-dark mt-2 text-2xl font-bold md:text-3xl">
                Qualidade que protege o seu motor
              </h2>
              <div className="text-muted-dark mt-6 space-y-4 leading-relaxed">
                <p>
                  A Original Filter é uma empresa brasileira especializada na fabricação de filtros
                  para os segmentos de transporte pesado, agrícola, máquinas, equipamentos e
                  fora-de-estrada. Com sede em Cotia, São Paulo, a empresa se consolidou como
                  referência no mercado de reposição.
                </p>
                <p>
                  Em 2017, a empresa investiu R$ 1,5 milhão para expandir e nacionalizar a produção,
                  gerando 50 postos de trabalho com o apoio da Investe SP. Esse compromisso com o
                  crescimento sustentável se reflete na qualidade de cada filtro produzido.
                </p>
                <p>
                  Os produtos são distribuídos comercialmente pela Del Rey Filtros, garantindo
                  cobertura nacional e agilidade na entrega para distribuidores e mecânicas em todo
                  o Brasil.
                </p>
              </div>
            </div>

            {/* Image placeholder / Certifications block */}
            <div className="relative">
              <div className="bg-surface overflow-hidden rounded-2xl p-8 md:p-12">
                <div className="text-dark flex items-center gap-3">
                  <Factory className="text-brand h-8 w-8" />
                  <span className="font-heading text-xl font-bold">Cotia, São Paulo</span>
                </div>
                <p className="text-muted-dark mt-3 text-sm">
                  Unidade fabril com processos padronizados e auditados regularmente
                </p>

                {/* Certifications */}
                <div className="border-surface-alt mt-8 border-t pt-8">
                  <p className="text-muted text-xs font-semibold tracking-widest uppercase">
                    Certificações
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {CERTIFICATIONS.map((cert) => (
                      <span
                        key={cert}
                        className="border-brand/30 bg-brand/10 text-dark rounded-full border px-4 py-2 text-sm font-semibold"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="border-surface-alt mt-8 grid grid-cols-3 gap-4 border-t pt-8">
                  <div>
                    <p className="font-heading text-brand text-2xl font-bold">770+</p>
                    <p className="text-muted-dark text-xs">Produtos</p>
                  </div>
                  <div>
                    <p className="font-heading text-brand text-2xl font-bold">9</p>
                    <p className="text-muted-dark text-xs">Montadoras</p>
                  </div>
                  <div>
                    <p className="font-heading text-brand text-2xl font-bold">20+</p>
                    <p className="text-muted-dark text-xs">Tipos de filtro</p>
                  </div>
                </div>
              </div>

              {/* Decorative accent */}
              <div className="bg-brand/20 absolute -right-4 -bottom-4 -z-10 h-full w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Missão / Visão / Valores ── */}
      <section className="bg-dark py-16 md:py-24">
        <div className="container-custom">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Missão */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <div className="bg-brand flex h-12 w-12 items-center justify-center rounded-xl">
                <Target className="text-dark h-6 w-6" />
              </div>
              <h3 className="font-heading mt-4 text-xl font-bold text-white">Missão</h3>
              <p className="text-muted mt-3 leading-relaxed">
                Produzir filtros automotivos, agrícolas e industriais de alta qualidade, garantindo
                proteção eficiente para motores e equipamentos de nossos clientes.
              </p>
            </div>

            {/* Visão */}
            <div className="border-brand/20 bg-brand/5 rounded-2xl border p-8">
              <div className="bg-brand flex h-12 w-12 items-center justify-center rounded-xl">
                <Eye className="text-dark h-6 w-6" />
              </div>
              <h3 className="font-heading mt-4 text-xl font-bold text-white">Visão</h3>
              <p className="text-muted mt-3 leading-relaxed">
                Ser reconhecida como referência nacional em filtros de reposição, expandindo para
                novos segmentos e mercados internacionais com excelência e inovação.
              </p>
            </div>

            {/* Valores */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <div className="bg-brand flex h-12 w-12 items-center justify-center rounded-xl">
                <Heart className="text-dark h-6 w-6" />
              </div>
              <h3 className="font-heading mt-4 text-xl font-bold text-white">Valores</h3>
              <p className="text-muted mt-3 leading-relaxed">
                Integridade, qualidade sem compromisso, respeito ao meio ambiente, valorização das
                pessoas e compromisso com a satisfação do cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Nossos Valores em Detalhe ── */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <span className="text-brand-dark text-sm font-semibold tracking-widest uppercase">
            O que nos move
          </span>
          <h2 className="font-heading text-dark mt-2 text-2xl font-bold md:text-3xl">
            Pilares que sustentam a nossa marca
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="group border-surface-alt hover:border-brand/30 hover:shadow-brand/5 rounded-2xl border p-6 transition-all hover:shadow-lg"
              >
                <div className="bg-brand/10 text-brand group-hover:bg-brand group-hover:text-dark flex h-11 w-11 items-center justify-center rounded-lg transition-colors">
                  <value.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading text-dark mt-4 text-lg font-semibold">{value.title}</h3>
                <p className="text-muted-dark mt-2 text-sm leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trajetória ── */}
      <section className="bg-surface py-16 md:py-24">
        <div className="container-custom">
          <span className="text-brand-dark text-sm font-semibold tracking-widest uppercase">
            Nossa Trajetória
          </span>
          <h2 className="font-heading text-dark mt-2 text-2xl font-bold md:text-3xl">
            Marcos importantes
          </h2>

          <div className="mt-12 space-y-0">
            {MILESTONES.map((item, i) => (
              <div key={i} className="flex gap-6 pb-10 last:pb-0">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="bg-brand text-dark flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    {i + 1}
                  </div>
                  {i < MILESTONES.length - 1 && <div className="bg-brand/30 mt-2 w-px flex-1" />}
                </div>

                {/* Content */}
                <div className="pb-2">
                  <p className="font-heading text-brand-dark text-sm font-bold tracking-wider uppercase">
                    {item.year}
                  </p>
                  <p className="text-muted-dark mt-1 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
