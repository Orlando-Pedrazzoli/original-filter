import type { Metadata } from 'next';
import { Leaf, Recycle, Package, TreePine, Droplets, Factory, Users, Trophy } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Sustentabilidade | Original Filter',
  description:
    'Conheça as práticas de sustentabilidade da Original Filter: logística reversa, embalagens sustentáveis, campanha Descarte Consciente e conformidade com a PNRS.',
  openGraph: {
    title: 'Sustentabilidade | Original Filter',
    description:
      'Logística reversa, embalagens sustentáveis e responsabilidade ambiental em cada filtro.',
  },
};

const PILLARS = [
  {
    icon: Leaf,
    title: 'Ambiental',
    items: [
      'Logística reversa para coleta e reciclagem de filtros usados',
      'Embalagens projetadas com materiais recicláveis e resistentes',
      'Conformidade com a PNRS (Política Nacional de Resíduos Sólidos)',
      'Campanha "Descarte Consciente" impressa em todas as embalagens',
    ],
  },
  {
    icon: Users,
    title: 'Social',
    items: [
      'Geração de empregos diretos na região de Cotia/SP',
      'Apoio a programas sociais e esportivos locais',
      'Treinamento contínuo para colaboradores',
      'Relacionamento ético com toda a cadeia produtiva',
    ],
  },
  {
    icon: Trophy,
    title: 'Qualidade',
    items: [
      'Certificações IATF 16949, QS 9000 e ISO 9001',
      'Processos de fabricação auditados regularmente',
      'Testes laboratoriais em cada lote produzido',
      'Melhoria contínua de produtos e processos',
    ],
  },
];

const REVERSE_LOGISTICS_STEPS = [
  {
    icon: Package,
    step: '01',
    title: 'Coleta',
    text: 'Os filtros usados são coletados em pontos de descarte parceiros ou devolvidos por distribuidores e oficinas mecânicas.',
  },
  {
    icon: Factory,
    step: '02',
    title: 'Triagem',
    text: 'Os materiais são separados por tipo — metal, papel, borracha e elementos filtrantes — para destinação adequada.',
  },
  {
    icon: Recycle,
    step: '03',
    title: 'Reciclagem',
    text: 'Cada material segue para reciclagem especializada, reduzindo a extração de novos recursos naturais.',
  },
  {
    icon: Droplets,
    step: '04',
    title: 'Resultado',
    text: 'Menos resíduos em aterros, economia de recursos naturais e contribuição para um meio ambiente mais saudável.',
  },
];

export default function SustentabilidadePage() {
  return (
    <>
      <PageHeader
        title="Sustentabilidade"
        subtitle="Sustentabilidade é uma responsabilidade compartilhada. Conheça nossas práticas ambientais, sociais e de qualidade."
        breadcrumbs={[{ label: 'A Empresa', href: '/sobre' }, { label: 'Sustentabilidade' }]}
      />

      {/* ── 3 Pilares ── */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <span className="text-brand-dark text-sm font-semibold tracking-widest uppercase">
            Nossos Pilares
          </span>
          <h2 className="font-heading text-dark mt-2 text-2xl font-bold md:text-3xl">
            Sustentabilidade em três dimensões
          </h2>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="border-surface-alt hover:border-brand/30 hover:shadow-brand/5 rounded-2xl border p-8 transition-all hover:shadow-lg"
              >
                <div className="bg-brand/10 text-brand flex h-12 w-12 items-center justify-center rounded-xl">
                  <pillar.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-dark mt-4 text-xl font-bold">{pillar.title}</h3>
                <ul className="mt-4 space-y-3">
                  {pillar.items.map((item, i) => (
                    <li key={i} className="text-muted-dark flex gap-3 text-sm leading-relaxed">
                      <span className="bg-brand mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Logística Reversa ── */}
      <section className="bg-dark py-16 md:py-24">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-brand text-sm font-semibold tracking-widest uppercase">
              Logística Reversa
            </span>
            <h2 className="font-heading mt-2 text-2xl font-bold text-white md:text-3xl">
              Do uso ao reaproveitamento
            </h2>
            <p className="text-muted mt-4">
              Nosso programa de logística reversa dá o destino correto a cada filtro usado, evitando
              danos à natureza e promovendo a economia circular.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {REVERSE_LOGISTICS_STEPS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="bg-brand text-dark mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <item.icon className="h-7 w-7" />
                </div>
                <p className="font-heading text-brand mt-4 text-xs font-bold tracking-widest uppercase">
                  Passo {item.step}
                </p>
                <h3 className="font-heading mt-1 text-lg font-bold text-white">{item.title}</h3>
                <p className="text-muted mt-2 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Descarte Consciente Banner ── */}
      <section className="bg-brand relative overflow-hidden py-12 md:py-16">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="container-custom relative z-10 text-center">
          <TreePine className="text-dark mx-auto h-10 w-10" />
          <h2 className="font-heading text-dark mt-4 text-2xl font-bold md:text-3xl">
            Campanha Descarte Consciente
          </h2>
          <p className="text-dark/80 mx-auto mt-3 max-w-xl">
            Todas as embalagens Original Filter trazem orientações sobre o descarte correto de
            filtros usados. Juntos, protegemos o meio ambiente e promovemos a sustentabilidade.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-surface py-12">
        <div className="container-custom text-center">
          <p className="text-muted-dark">Quer saber mais sobre nossas práticas sustentáveis?</p>
          <a
            href="/contato"
            className="bg-dark hover:bg-dark-soft mt-3 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            Fale Conosco
          </a>
        </div>
      </section>
    </>
  );
}
