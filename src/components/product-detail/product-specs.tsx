/* ══════════════════════════════════════════
   ProductSpecs — Original Filter
   ──────────────────────────────────────────
   Tabela de especificações técnicas:
   - Peso, dimensões (altura/largura/profundidade)
   - Outros dados do produto
   - Pula campos com valor placeholder (peso=0, dimensão=1×1×1)
   ══════════════════════════════════════════ */

import { Ruler, Weight, Tag, Layers } from 'lucide-react';

interface ProductSpecsProps {
  weight: number;
  dimensions: {
    height: number;
    width: number;
    depth: number;
  };
  productType: string;
  category: string;
  sku: string;
}

const PLACEHOLDER_DIMS = [1, 0.1, 0.01, 0.5];

function isPlaceholderDim(value: number): boolean {
  return PLACEHOLDER_DIMS.includes(value);
}

export function ProductSpecs({
  weight,
  dimensions,
  productType,
  category,
  sku,
}: ProductSpecsProps) {
  const hasWeight = weight > 0;
  const hasDimensions =
    dimensions &&
    !isPlaceholderDim(dimensions.height) &&
    !isPlaceholderDim(dimensions.width) &&
    !isPlaceholderDim(dimensions.depth);

  // Se não tem nenhum dado técnico real, não renderiza a seção
  if (!hasWeight && !hasDimensions) {
    return (
      <section className="py-12 md:py-16">
        <SectionHeader eyebrow="Especificações técnicas" title="Dados técnicos" />
        <div
          className="bg-brand-snow border-brand-mist border p-6 text-center"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <div className="text-brand-iron text-sm">
            Dados técnicos detalhados em breve. Para informações específicas, entre em contato com
            nossa equipe técnica.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <SectionHeader eyebrow="Especificações técnicas" title="Dados técnicos" />

      <div className="bg-brand-mist grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4">
        <SpecCell
          icon={<Tag className="size-4" strokeWidth={2} />}
          label="Código (SKU)"
          value={sku}
          mono
        />
        <SpecCell
          icon={<Layers className="size-4" strokeWidth={2} />}
          label="Categoria"
          value={category.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
        />
        {hasWeight && (
          <SpecCell
            icon={<Weight className="size-4" strokeWidth={2} />}
            label="Peso"
            value={`${weight.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg`}
            mono
          />
        )}
        {hasDimensions && (
          <SpecCell
            icon={<Ruler className="size-4" strokeWidth={2} />}
            label="Dimensões (A × L × P)"
            value={`${dimensions.height} × ${dimensions.width} × ${dimensions.depth} cm`}
            mono
          />
        )}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-brand-yellow h-px w-8" />
        <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
          {eyebrow}
        </span>
      </div>
      <h2
        className="font-display text-brand-black font-black"
        style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          letterSpacing: '-0.025em',
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function SpecCell({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-brand-white p-5 md:p-6">
      <div className="text-brand-iron mb-3 flex items-center gap-2">
        {icon}
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase">{label}</span>
      </div>
      <div
        className={`text-brand-black font-bold ${
          mono ? 'font-mono' : 'font-display'
        } text-base leading-tight md:text-lg`}
      >
        {value}
      </div>
    </div>
  );
}
