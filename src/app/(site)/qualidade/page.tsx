import type { Metadata } from 'next';
import {
  ShieldCheck,
  FlaskConical,
  Gauge,
  ClipboardCheck,
  BadgeCheck,
  Microscope,
  Settings,
  FileCheck2,
} from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { CERTIFICATIONS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Política de Qualidade | Original Filter',
  description:
    'A Original Filter mantém certificações IATF 16949, QS 9000 e ISO 9001. Conheça nossos padrões de fabricação, laboratórios de teste e compromisso com a excelência.',
  openGraph: {
    title: 'Política de Qualidade | Original Filter',
    description:
      'Certificações internacionais e laboratórios avançados garantem a qualidade dos nossos filtros.',
  },
};

const QUALITY_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Padrões Elevados',
    text: 'Todos os filtros são produzidos sob rigorosos padrões de qualidade, garantindo desempenho e segurança para cada aplicação.',
  },
  {
    icon: FlaskConical,
    title: 'Laboratórios Avançados',
    text: 'Testes de vazão, eficiência de filtragem, resistência à pressão e durabilidade são realizados em laboratórios de última geração.',
  },
  {
    icon: ClipboardCheck,
    title: 'Processos Auditados',
    text: 'Processos de fabricação padronizados e auditados regularmente para manter a qualidade consistente em toda a linha.',
  },
  {
    icon: Gauge,
    title: 'Controle Rigoroso',
    text: 'Cada lote passa por inspeção de qualidade antes de sair da fábrica, assegurando conformidade com as especificações técnicas.',
  },
];

const TEST_TYPES = [
  {
    icon: Microscope,
    label: 'Eficiência de Filtragem',
    desc: 'Medição da capacidade de retenção de partículas em diferentes granulometrias.',
  },
  {
    icon: Gauge,
    label: 'Resistência à Pressão',
    desc: 'Testes de pressão para garantir a integridade estrutural em condições extremas.',
  },
  {
    icon: Settings,
    label: 'Vazão e Performance',
    desc: 'Análise do fluxo para assegurar mínima restrição ao funcionamento do motor.',
  },
  {
    icon: FileCheck2,
    label: 'Durabilidade',
    desc: 'Simulações de uso prolongado para validar a vida útil recomendada do produto.',
  },
];

export default function QualidadePage() {
  return (
    <>
      <PageHeader
        title="Política de Qualidade"
        subtitle="Certificações internacionais e processos auditados garantem a excelência de cada filtro que produzimos."
        breadcrumbs={[{ label: 'A Empresa', href: '/sobre' }, { label: 'Política de Qualidade' }]}
      />

      {/* ── Certificações ── */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-brand-dark text-sm font-semibold tracking-widest uppercase">
              Certificações
            </span>
            <h2 className="font-heading text-dark mt-2 text-2xl font-bold md:text-3xl">
              Reconhecimento internacional de qualidade
            </h2>
            <p className="text-muted-dark mt-4">
              Nossas certificações atestam o compromisso com os mais altos padrões de qualidade na
              fabricação de filtros automotivos e industriais.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert}
                className="group border-surface-alt hover:border-brand/30 hover:shadow-brand/5 flex flex-col items-center rounded-2xl border bg-white p-8 text-center transition-all hover:shadow-lg"
              >
                <div className="bg-brand/10 group-hover:bg-brand flex h-16 w-16 items-center justify-center rounded-2xl transition-colors">
                  <BadgeCheck className="text-brand group-hover:text-dark h-8 w-8 transition-colors" />
                </div>
                <h3 className="font-heading text-dark mt-4 text-lg font-bold">{cert}</h3>
                <p className="text-muted-dark mt-2 text-sm">
                  {cert.includes('IATF')
                    ? 'Gestão da qualidade automotiva — padrão global da indústria.'
                    : cert.includes('QS')
                      ? 'Sistema de qualidade para fornecedores automotivos.'
                      : 'Sistema de gestão da qualidade — norma internacional.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pilares da Qualidade ── */}
      <section className="bg-dark py-16 md:py-24">
        <div className="container-custom">
          <span className="text-brand text-sm font-semibold tracking-widest uppercase">
            Nosso Compromisso
          </span>
          <h2 className="font-heading mt-2 text-2xl font-bold text-white md:text-3xl">
            Pilares da nossa qualidade
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {QUALITY_PILLARS.map((pillar, i) => (
              <div
                key={pillar.title}
                className="hover:border-brand/20 rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors"
              >
                <div className="bg-brand text-dark flex h-10 w-10 items-center justify-center rounded-lg">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading mt-4 text-lg font-semibold text-white">
                  {pillar.title}
                </h3>
                <p className="text-muted mt-2 text-sm leading-relaxed">{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testes Realizados ── */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <span className="text-brand-dark text-sm font-semibold tracking-widest uppercase">
            Laboratório
          </span>
          <h2 className="font-heading text-dark mt-2 text-2xl font-bold md:text-3xl">
            Testes que garantem a performance
          </h2>
          <p className="text-muted-dark mt-4 max-w-2xl">
            Cada filtro é submetido a uma bateria de testes em nossos laboratórios antes de ser
            aprovado para comercialização.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {TEST_TYPES.map((test, i) => (
              <div key={test.label} className="flex gap-4">
                <div className="bg-surface text-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                  <test.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading text-dark text-base font-semibold">{test.label}</h3>
                  <p className="text-muted-dark mt-1 text-sm leading-relaxed">{test.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-surface py-12">
        <div className="container-custom text-center">
          <p className="text-muted-dark">Tem dúvidas sobre nossos padrões de qualidade?</p>
          <a
            href="/contato"
            className="bg-brand text-dark hover:bg-brand-hover mt-3 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors"
          >
            Entre em Contato
          </a>
        </div>
      </section>
    </>
  );
}
