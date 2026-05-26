/* ══════════════════════════════════════════
   Pagination — Original Filter
   ──────────────────────────────────────────
   Paginação sincronizada com URL (?page=N).
   Estilo industrial: números monoespaçados, faixa amarela na página ativa.
   ══════════════════════════════════════════ */

'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Total de itens (para mostrar "Página 2 de 5 · 47 produtos") */
  totalItems?: number;
}

export function Pagination({ currentPage, totalPages, totalItems }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    const params = new URLSearchParams(sp.toString());
    if (page === 1) params.delete('page');
    else params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Gera lista compacta de páginas: 1 ... 4 5 [6] 7 8 ... 20
  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginação"
      className="border-brand-mist mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row"
    >
      {totalItems != null && (
        <div className="text-brand-iron order-2 font-mono text-xs tracking-widest uppercase md:order-1">
          Página{' '}
          <span className="text-brand-black font-bold">{String(currentPage).padStart(2, '0')}</span>{' '}
          de{' '}
          <span className="text-brand-black font-bold">{String(totalPages).padStart(2, '0')}</span>
          {' · '}
          <span className="text-brand-yellow-deep font-bold">{totalItems}</span>{' '}
          {totalItems === 1 ? 'produto' : 'produtos'}
        </div>
      )}

      <div className="order-1 flex items-center gap-1 md:order-2">
        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className="text-brand-iron hover:text-brand-black hover:bg-brand-snow p-2 transition disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e-${i}`} className="text-brand-steel px-2 font-mono">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              aria-label={`Página ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`relative h-9 min-w-[2.25rem] font-mono text-sm font-medium transition ${
                p === currentPage ? 'text-brand-black' : 'text-brand-iron hover:text-brand-black'
              }`}
            >
              {p === currentPage && (
                <span className="bg-brand-yellow absolute inset-x-1 -bottom-px h-0.5" />
              )}
              {String(p).padStart(2, '0')}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Próxima página"
          className="text-brand-iron hover:text-brand-black hover:bg-brand-snow p-2 transition disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}

/**
 * Gera array de páginas a exibir com ellipsis quando necessário.
 * Sempre mostra: primeira, última, currentPage ± 2, e ellipsis no meio.
 */
function getPaginationPages(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: Array<number | 'ellipsis'> = [];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  pages.push(1);
  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);

  return pages;
}
