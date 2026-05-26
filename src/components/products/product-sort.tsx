/* ══════════════════════════════════════════
   ProductSort — Original Filter
   ──────────────────────────────────────────
   Seletor de ordenação (sincronizado com URL).
   ══════════════════════════════════════════ */

'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'recente', label: 'Mais recentes' },
  { value: 'sku', label: 'Código (A-Z)' },
  { value: 'preco-asc', label: 'Menor preço' },
  { value: 'preco-desc', label: 'Maior preço' },
];

export function ProductSort() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get('sort') ?? 'recente';

  function handleChange(value: string) {
    const params = new URLSearchParams(sp.toString());
    params.set('sort', value);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <label className="relative inline-flex items-center gap-2">
      <ArrowUpDown className="text-brand-iron size-3.5" strokeWidth={2} />
      <span className="text-brand-iron hidden font-mono text-[11px] tracking-widest uppercase sm:inline">
        Ordenar
      </span>
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="border-brand-mist hover:border-brand-iron cursor-pointer appearance-none border bg-white py-2 pr-8 pl-3 text-sm font-medium transition"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="text-brand-steel pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </label>
  );
}
