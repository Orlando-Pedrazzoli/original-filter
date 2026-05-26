/* ══════════════════════════════════════════
   AdminPagination — Original Filter Admin
   ──────────────────────────────────────────
   Paginação numérica simples e densa.
   Mostra: "X-Y de Z" + botões prev/next + páginas próximas.
   ══════════════════════════════════════════ */

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
  loading?: boolean;
}

export function AdminPagination({
  page,
  pages,
  total,
  limit,
  onChange,
  loading,
}: AdminPaginationProps) {
  if (pages <= 1) {
    return (
      <div className="text-brand-iron font-mono text-xs tracking-widest uppercase">
        {total} {total === 1 ? 'registro' : 'registros'}
      </div>
    );
  }

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Calcular páginas próximas (max 5 ao redor da atual)
  const pageNumbers = computePageNumbers(page, pages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="text-brand-iron font-mono text-xs tracking-widest uppercase">
        {from}–{to} de <strong className="text-brand-black">{total}</strong>
      </div>

      <div className="flex items-center gap-1">
        <PaginationButton
          disabled={loading || page === 1}
          onClick={() => onChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-3.5" />
        </PaginationButton>

        {pageNumbers.map((n, i) =>
          n === '...' ? (
            <span
              key={`gap-${i}`}
              className="text-brand-mist px-2 font-mono text-xs"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <PaginationButton
              key={n}
              active={n === page}
              disabled={loading}
              onClick={() => onChange(n)}
              aria-label={`Página ${n}`}
              aria-current={n === page ? 'page' : undefined}
            >
              {n}
            </PaginationButton>
          ),
        )}

        <PaginationButton
          disabled={loading || page === pages}
          onClick={() => onChange(page + 1)}
          aria-label="Próxima página"
        >
          <ChevronRight className="size-3.5" />
        </PaginationButton>
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
  active,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  'aria-label'?: string;
  'aria-current'?: 'page' | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      className={`h-8 min-w-[2rem] border px-2 font-mono text-xs font-bold transition ${
        active
          ? 'bg-brand-black border-brand-black text-brand-yellow'
          : 'bg-brand-white border-brand-mist text-brand-iron hover:border-brand-iron hover:text-brand-black'
      } inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-40`}
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {children}
    </button>
  );
}

function computePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const result: (number | '...')[] = [];
  result.push(1);

  if (current > 3) result.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) result.push(i);

  if (current < total - 2) result.push('...');

  result.push(total);

  return result;
}
