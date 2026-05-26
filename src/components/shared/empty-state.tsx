/* ══════════════════════════════════════════
   EmptyState — Original Filter
   ──────────────────────────────────────────
   Estado vazio elegante para 0 resultados, erros, etc.
   ══════════════════════════════════════════ */

'use client';

import Link from 'next/link';
import { SearchX, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  /** Ícone customizado (default: SearchX) */
  icon?: React.ReactNode;
  /** Pequeno texto em mono */
  eyebrow?: string;
  /** Título principal */
  title: string;
  /** Descrição */
  description?: string;
  /** Ações sugeridas */
  actions?: Array<{
    label: string;
    href: string;
    variant?: 'primary' | 'secondary';
  }>;
}

export function EmptyState({
  icon,
  eyebrow = 'Sem resultados',
  title,
  description,
  actions = [],
}: EmptyStateProps) {
  return (
    <div className="bg-brand-white border-brand-mist border px-6 py-16 md:py-24">
      <div className="mx-auto max-w-md space-y-5 text-center">
        <div className="bg-brand-snow text-brand-iron mx-auto inline-flex h-14 w-14 items-center justify-center">
          {icon ?? <SearchX className="size-6" strokeWidth={1.5} />}
        </div>

        <div>
          <div className="text-brand-yellow-deep mb-2 font-mono text-[11px] tracking-[0.25em] uppercase">
            {eyebrow}
          </div>
          <h3
            className="font-display text-brand-black leading-tight font-black"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              letterSpacing: '-0.025em',
            }}
          >
            {title}
          </h3>
          {description && <p className="text-brand-steel mt-3 leading-relaxed">{description}</p>}
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}
              >
                {action.label}
                <ArrowRight className="size-3.5" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
