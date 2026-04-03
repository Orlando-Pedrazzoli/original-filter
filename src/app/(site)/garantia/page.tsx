import type { Metadata } from 'next';
import {
  ShieldCheck,
  Package,
  Wrench,
  HandCoins,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Phone,
} from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { CONTACT } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Política de Garantia | Original Filter',
  description:
    'Conheça a política de garantia da Original Filter. Cobertura contra defeitos de fabricação, orientações de armazenamento e instalação, e suporte técnico dedicado.',
  openGraph: {
    title: 'Política de Garantia | Original Filter',
    description: 'Garantia contra defeitos de fabricação com suporte técnico especializado.',
  },
};

const COVERAGE = [
  {
    icon: Package,
    title: 'Armazenamento Adequado',
    text: 'Mantenha os filtros em locais isentos de umidade e poeira, na embalagem original. A integridade da embalagem é fundamental para proteger os filtros até a instalação.',
  },
  {
    icon: Wrench,
    title: 'Instalação Profissional',
    text: 'Conte com um profissional treinado para realizar a instalação. Siga as especificações presentes nos catálogos ou manuais do fabricante do veículo, máquina ou equipamento.',
  },
  {
    icon: HandCoins,
    title: 'Responsabilidade Total',
    text: 'Se houver avaria comprovada por defeito de fabricação, assumimos todos os custos de reparo necessários para devolver a máquina à condição anterior à falha.',
  },
];

const EXCLUSIONS = [
  {
    icon: AlertTriangle,
    title: 'Modificações e Alterações',
    text: 'A garantia não cobre filtros que tenham sido modificados ou alterados. Qualquer intervenção não autorizada pode invalidar a cobertura.',
  },
  {
    icon: XCircle,
    title: 'Aplicação Divergente',
    text: 'Se o filtro for aplicado de maneira divergente ao catálogo ou manual do fabricante, a garantia não será válida.',
  },
  {
    icon: AlertTriangle,
    title: 'Danos Externos',
    text: 'Não cobrimos danos causados por agentes externos, como acidentes, falhas de energia elétrica, uso inadequado ou negligência.',
  },
  {
    icon: XCircle,
    title: 'Desmontagem e Substituição',
    text: 'Custos relacionados à desmontagem ou substituição de produtos soldados ou afixados não estão incluídos na garantia.',
  },
];

export default function GarantiaPage() {
  return (
    <>
      <PageHeader
        title="Política de Garantia"
        subtitle="Qualidade e confiança em cada filtro. Nossa garantia abrange defeitos de fabricação quando seguidas as orientações de uso."
        breadcrumbs={[{ label: 'A Empresa', href: '/sobre' }, { label: 'Política de Garantia' }]}
      />

      {/* ── O que a Garantia Cobre ── */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <span className="text-brand-dark text-sm font-semibold tracking-widest uppercase">
            Cobertura
          </span>
          <h2 className="font-heading text-dark mt-2 text-2xl font-bold md:text-3xl">
            O que nossa garantia cobre
          </h2>
          <p className="text-muted-dark mt-4 max-w-2xl">
            A Original Filter garante seus produtos contra defeitos de fabricação, desde que as
            seguintes orientações sejam observadas:
          </p>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {COVERAGE.map((item) => (
              <div
                key={item.title}
                className="border-surface-alt hover:border-brand/30 hover:shadow-brand/5 rounded-2xl border p-8 transition-all hover:shadow-lg"
              >
                <div className="bg-brand/10 text-brand flex h-12 w-12 items-center justify-center rounded-xl">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-dark mt-4 text-lg font-bold">{item.title}</h3>
                <p className="text-muted-dark mt-3 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Exclusões ── */}
      <section className="bg-surface py-16 md:py-24">
        <div className="container-custom">
          <span className="text-danger text-sm font-semibold tracking-widest uppercase">
            Atenção
          </span>
          <h2 className="font-heading text-dark mt-2 text-2xl font-bold md:text-3xl">
            Exclusões e limitações
          </h2>
          <p className="text-muted-dark mt-4 max-w-2xl">
            É importante conhecer as situações em que a garantia não se aplica:
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {EXCLUSIONS.map((item, i) => (
              <div key={i} className="flex gap-4 rounded-xl bg-white p-6 shadow-sm">
                <div className="bg-danger/10 text-danger flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-dark text-base font-semibold">{item.title}</h3>
                  <p className="text-muted-dark mt-1 text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compromisso + Suporte ── */}
      <section className="bg-dark py-16 md:py-24">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <div className="bg-brand mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
              <ShieldCheck className="text-dark h-8 w-8" />
            </div>
            <h2 className="font-heading mt-6 text-2xl font-bold text-white md:text-3xl">
              Compromisso com a qualidade
            </h2>
            <p className="text-muted mt-4 leading-relaxed">
              Além da garantia por escrito, reforçamos nosso compromisso com a qualidade em cada
              filtro produzido. Nossa equipe de engenheiros e técnicos trabalha constantemente para
              oferecer produtos confiáveis e eficientes.
            </p>
          </div>

          {/* SAC */}
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="bg-brand text-dark mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
              <Phone className="h-6 w-6" />
            </div>
            <p className="text-brand mt-4 text-sm font-semibold tracking-widest uppercase">
              Suporte Técnico
            </p>
            <p className="font-heading mt-2 text-2xl font-bold text-white">{CONTACT.sac}</p>
            <p className="text-muted mt-1 text-sm">Ligação gratuita — SAC Original Filter</p>
            <a
              href="/contato"
              className="bg-brand text-dark hover:bg-brand-hover mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Enviar Solicitação
            </a>
          </div>
        </div>
      </section>

      {/* ── Nota Importante ── */}
      <section className="bg-brand/10 py-8">
        <div className="container-custom">
          <p className="text-muted-dark mx-auto max-w-3xl text-center text-sm leading-relaxed">
            <strong className="text-dark">Nota:</strong> Para melhor desempenho dos motores e
            equipamentos, todos os filtros devem ser trocados regularmente antes da total saturação.
            As trocas devem seguir o prazo recomendado pelo fabricante — essa é a única forma de
            reduzir o desgaste e prolongar a vida útil do motor.
          </p>
        </div>
      </section>
    </>
  );
}
