/* ══════════════════════════════════════════
   CrossRefResults — Original Filter
   ──────────────────────────────────────────
   Cards de produtos Original Filter equivalentes ao código pesquisado.
   Cada card mostra um badge indicando a confiança do match:
   - 'oem'         → "Match exato (OEM)" (verde)
   - 'competitor'  → "Match exato (concorrente)" (verde)
   - 'original'    → "Código Original Filter" (amarelo) - SKU exato ou prefix
   - 'unknown'     → "Match aproximado" (azul) - texto
   ══════════════════════════════════════════ */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Check,
  CircleCheck,
  CircleDot,
  CircleHelp,
  ArrowRight,
  ImageOff,
  Hash,
} from 'lucide-react';
import type { CrossRefMatch } from '@/lib/search-types';
import { cleanProductTitle, productTypeLabel } from '@/utils/format';

interface CrossRefResultsProps {
  matches: CrossRefMatch[];
  queriedCode: string;
}

const SOURCE_META: Record<
  CrossRefMatch['source'],
  {
    label: string;
    badgeColor: string;
    icon: React.ElementType;
    description: string;
  }
> = {
  oem: {
    label: 'Match exato · OEM',
    badgeColor: 'bg-success text-white',
    icon: CircleCheck,
    description: 'Código original da montadora encontrado em nossa base.',
  },
  competitor: {
    label: 'Match exato · Concorrente',
    badgeColor: 'bg-success text-white',
    icon: CircleCheck,
    description: 'Equivalente direto de fabricante concorrente.',
  },
  original: {
    label: 'Original Filter',
    badgeColor: 'bg-brand-yellow text-brand-black',
    icon: Hash,
    description: 'Este é um código Original Filter ou prefixo correspondente.',
  },
  unknown: {
    label: 'Match aproximado',
    badgeColor: 'bg-info text-white',
    icon: CircleHelp,
    description: 'Resultado por similaridade textual. Confirme com nossa equipe técnica.',
  },
};

export function CrossRefResults({ matches, queriedCode }: CrossRefResultsProps) {
  // Agrupa por nível de confiança para destacar matches exatos no topo
  const exact = matches.filter((m) => m.confidence >= 0.9);
  const partial = matches.filter((m) => m.confidence >= 0.5 && m.confidence < 0.9);
  const approximate = matches.filter((m) => m.confidence < 0.5);

  return (
    <div className="space-y-12">
      {exact.length > 0 && (
        <ResultGroup
          title="Equivalências encontradas"
          eyebrow={`${exact.length} ${exact.length === 1 ? 'resultado exato' : 'resultados exatos'}`}
          matches={exact}
          queriedCode={queriedCode}
        />
      )}

      {partial.length > 0 && (
        <ResultGroup
          title="Outros prováveis"
          eyebrow={`${partial.length} ${partial.length === 1 ? 'resultado parcial' : 'resultados parciais'}`}
          matches={partial}
          queriedCode={queriedCode}
        />
      )}

      {approximate.length > 0 && (
        <ResultGroup
          title="Resultados aproximados"
          eyebrow="Por similaridade textual"
          matches={approximate}
          queriedCode={queriedCode}
        />
      )}
    </div>
  );
}

// ─── Grupo de resultados ───
function ResultGroup({
  title,
  eyebrow,
  matches,
  queriedCode,
}: {
  title: string;
  eyebrow: string;
  matches: CrossRefMatch[];
  queriedCode: string;
}) {
  return (
    <section>
      <div className="border-brand-mist mb-6 border-b pb-4">
        <div className="mb-2 flex items-center gap-3">
          <div className="bg-brand-yellow h-px w-8" />
          <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
            {eyebrow}
          </span>
        </div>
        <h2
          className="font-display text-brand-black leading-tight font-black"
          style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            letterSpacing: '-0.025em',
          }}
        >
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {matches.map((m, i) => (
          <MatchCard key={m.product.sku} match={m} queriedCode={queriedCode} index={i} />
        ))}
      </div>
    </section>
  );
}

// ─── Card individual de match ───
function MatchCard({
  match,
  queriedCode,
  index,
}: {
  match: CrossRefMatch;
  queriedCode: string;
  index: number;
}) {
  const meta = SOURCE_META[match.source];
  const Icon = meta.icon;
  const cleanTitle = cleanProductTitle(match.product.title, match.product.sku);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/produtos/${match.product.slug}`}
        className="group bg-brand-white border-brand-mist hover:border-brand-iron relative block h-full overflow-hidden border transition-all"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        {/* Faixa amarela no hover */}
        <div className="bg-brand-yellow absolute top-0 bottom-0 left-0 z-10 w-1 origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />

        {/* Header com badge de match */}
        <div className={`flex items-center gap-2 px-4 py-2.5 ${meta.badgeColor}`}>
          <Icon className="size-3.5 shrink-0" strokeWidth={2.5} />
          <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
            {meta.label}
          </span>
        </div>

        <div className="flex gap-4 p-4 md:p-5">
          {/* Imagem */}
          <div className="bg-brand-snow border-brand-mist relative flex size-20 shrink-0 items-center justify-center overflow-hidden border md:size-24">
            {match.product.image ? (
              <Image
                src={match.product.image}
                alt={cleanTitle || match.product.sku}
                fill
                sizes="96px"
                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <ImageOff className="text-brand-mist size-6" strokeWidth={1.25} />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            {/* Equivalência */}
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-brand-steel font-mono text-xs">{queriedCode}</span>
              <ArrowRight className="text-brand-steel size-3 shrink-0" />
            </div>

            {/* SKU Original Filter */}
            <div className="text-brand-yellow-deep truncate font-mono text-base font-bold tracking-wider">
              {match.product.sku}
            </div>

            {/* Título */}
            <div className="text-brand-iron group-hover:text-brand-black mt-1 line-clamp-2 text-sm leading-snug transition">
              {cleanTitle || match.product.title}
            </div>

            {/* Footer técnico */}
            <div className="text-brand-steel mt-2 font-mono text-[10px] tracking-widest uppercase">
              {productTypeLabel(match.product.productType)} ·{' '}
              {match.product.category.replace(/-/g, ' ')}
            </div>
          </div>
        </div>

        {/* Hover indicator */}
        <div className="font-display text-brand-iron group-hover:text-brand-yellow-deep flex items-center gap-1.5 px-4 pb-4 text-xs font-semibold tracking-wide uppercase transition md:px-5">
          Ver detalhes
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}
