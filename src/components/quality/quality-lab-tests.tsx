/* ══════════════════════════════════════════
   QualityLabTests — Original Filter
   ──────────────────────────────────────────
   Testes realizados nos laboratórios. É o diferencial técnico
   da página /qualidade vs /sobre.

   Fonte: Política de Qualidade do site original menciona
   vazão, eficiência, pressão e durabilidade.
   ══════════════════════════════════════════ */

'use client';

import { motion } from 'framer-motion';
import { Microscope, Gauge, Wind, Clock, CheckCircle2 } from 'lucide-react';

const TESTS = [
  {
    code: 'TEST 01',
    icon: Microscope,
    title: 'Eficiência de filtragem',
    metric: 'até 99,9%',
    unit: 'retenção',
    description:
      'Análise microscópica da capacidade de retenção de partículas em diferentes granulometrias. Garantia de proteção mesmo nas condições mais severas de contaminação.',
    parameters: [
      'Granulometria de 2 a 200 mícrons',
      'Beta ratio conforme ISO 19438',
      'Capacidade nominal de retenção',
    ],
  },
  {
    code: 'TEST 02',
    icon: Gauge,
    title: 'Resistência à pressão',
    metric: 'até 15 bar',
    unit: 'estrutural',
    description:
      'Testes de pressão estática e cíclica para validar a integridade estrutural do filtro em condições extremas de operação. Sem deformação ou ruptura.',
    parameters: [
      'Pressão de colapso ISO 2941',
      'Pulsos cíclicos de fadiga',
      'Vedação sob pressão diferencial',
    ],
  },
  {
    code: 'TEST 03',
    icon: Wind,
    title: 'Vazão e performance',
    metric: 'baixa Δp',
    unit: 'restrição',
    description:
      'Análise do fluxo passante para assegurar mínima restrição ao funcionamento do motor. Equilíbrio perfeito entre filtragem fina e perda de carga aceitável.',
    parameters: [
      'Curva ΔP × Vazão completa',
      'Performance em temperatura operacional',
      'Estabilidade hidráulica',
    ],
  },
  {
    code: 'TEST 04',
    icon: Clock,
    title: 'Durabilidade',
    metric: '500h+',
    unit: 'vida útil',
    description:
      'Simulações de uso prolongado em bancadas dedicadas. Validamos a vida útil recomendada do produto antes que ele chegue ao mercado.',
    parameters: [
      'Endurance test conforme padrão OEM',
      'Resistência a contaminantes diversos',
      'Validação de troca recomendada',
    ],
  },
];

export function QualityLabTests() {
  return (
    <section className="bg-brand-white border-brand-mist border-t py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        {/* Header */}
        <div className="mb-12 max-w-3xl md:mb-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
              Laboratório · testes técnicos
            </span>
          </div>
          <h2
            className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.035em',
            }}
          >
            Quatro testes.
            <br />
            <span className="text-brand-yellow-deep">Antes de chegar ao cliente.</span>
          </h2>
          <p className="text-brand-iron mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
            Nenhum lote sai da fábrica sem passar pela bateria completa de ensaios. Cada parâmetro
            abaixo é monitorado e documentado em nosso laboratório interno.
          </p>
        </div>

        {/* Grid de testes */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {TESTS.map((test, i) => (
            <TestCard key={test.code} test={test} index={i} />
          ))}
        </div>

        {/* Footer técnico */}
        <div className="text-brand-steel mt-10 flex items-start gap-3 text-xs">
          <CheckCircle2
            className="text-brand-yellow-deep mt-0.5 size-4 shrink-0"
            strokeWidth={2.5}
          />
          <span className="leading-relaxed">
            Valores referenciais; especificações exatas variam por categoria de filtro (ar,
            combustível, óleo, hidráulico, separador). Todos os testes seguem normas internacionais
            como ISO 19438, ISO 2941, SAE J905, J1858 e padrões específicos dos fabricantes (Volvo
            STD, Scania STD, MB DBL).
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── Card individual de teste ───
function TestCard({ test, index }: { test: (typeof TESTS)[number]; index: number }) {
  const Icon = test.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="bg-brand-snow border-brand-mist group hover:border-brand-iron border p-6 transition-colors md:p-8"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {/* Header do card */}
      <div className="mb-5 flex items-start justify-between">
        <div className="bg-brand-black text-brand-yellow group-hover:bg-brand-graphite flex size-11 items-center justify-center transition">
          <Icon className="size-5" strokeWidth={2} />
        </div>
        <div className="text-brand-yellow-deep font-mono text-[10px] tracking-[0.22em] uppercase">
          {test.code}
        </div>
      </div>

      {/* Título + métrica grande */}
      <div className="mb-4">
        <div className="font-display text-brand-black mb-3 text-lg leading-tight font-black">
          {test.title}
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="font-display text-brand-yellow-deep leading-none font-black tracking-tight"
            style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              letterSpacing: '-0.03em',
            }}
          >
            {test.metric}
          </span>
          <span className="text-brand-iron font-mono text-[10px] tracking-widest uppercase">
            {test.unit}
          </span>
        </div>
      </div>

      {/* Descrição */}
      <p className="text-brand-steel mb-5 text-sm leading-relaxed">{test.description}</p>

      {/* Parâmetros técnicos */}
      <div className="border-brand-mist space-y-1.5 border-t pt-4">
        <div className="text-brand-iron mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
          Parâmetros medidos
        </div>
        {test.parameters.map((p) => (
          <div key={p} className="text-brand-iron flex items-start gap-2 text-xs">
            <span className="bg-brand-yellow-deep mt-1.5 size-1 shrink-0 rounded-full" />
            <span className="font-mono">{p}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
