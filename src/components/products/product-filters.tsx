/* ══════════════════════════════════════════
   ProductFilters — Original Filter
   ──────────────────────────────────────────
   Sidebar de filtros para a página /produtos.
   - Desktop: sticky lateral
   - Mobile: drawer (componente pai controla abertura)
   - Filtros: Tipo, Linha, Categoria, Marca (autocomplete), Patenteado, Lançamento
   - Estado sincronizado com URL via useSearchParams
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Filter, X, Sparkles, Zap } from 'lucide-react';
import type { VehicleLine } from '@/lib/search-types';

interface FilterCount {
  slug: string;
  label: string;
  count?: number;
}

interface ProductFiltersProps {
  /** Total de resultados (mostra "X produtos encontrados") */
  totalResults: number;
  /** Callback ao limpar todos os filtros */
  onClear?: () => void;
  /** Categorias disponíveis (vem da página) */
  availableCategories?: FilterCount[];
  /** Open/close em mobile (controle externo) */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const TIPOS = [
  { slug: 'filter', label: 'Filtros' },
  { slug: 'sensor', label: 'Sensores' },
  { slug: 'accessory', label: 'Acessórios' },
];

export function ProductFilters({
  totalResults,
  onClear,
  availableCategories = [],
  mobileOpen = false,
  onMobileClose,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [lines, setLines] = useState<VehicleLine[]>([]);

  useEffect(() => {
    fetch('/api/vehicle-selector/lines')
      .then((r) => r.json())
      .then((d: { lines: VehicleLine[] }) => setLines(d.lines ?? []))
      .catch(() => {});
  }, []);

  // Lê valores atuais da URL
  const currentTipo = sp.get('tipo') ?? '';
  const currentLinha = sp.get('linha') ?? '';
  const currentCategoria = sp.get('categoria') ?? '';
  const currentPatenteado = sp.get('patenteado') === 'true';
  const currentLancamento = sp.get('lancamento') === 'true';

  /** Atualiza um parâmetro na URL preservando os outros e resetando page */
  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(sp.toString());
    if (value && value !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function clearAll() {
    const params = new URLSearchParams(sp.toString());
    // Preserva apenas 'q' (busca textual)
    const q = params.get('q');
    const newParams = new URLSearchParams();
    if (q) newParams.set('q', q);
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    onClear?.();
    onMobileClose?.();
  }

  const hasActiveFilter =
    !!currentTipo || !!currentLinha || !!currentCategoria || currentPatenteado || currentLancamento;

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-brand-mist flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <Filter className="text-brand-iron size-4" strokeWidth={2} />
          <span className="font-display text-brand-black text-sm font-bold tracking-widest uppercase">
            Filtros
          </span>
        </div>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="text-brand-yellow-deep hover:text-brand-black font-mono text-[11px] tracking-widest uppercase transition"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Total de resultados */}
      <div className="text-brand-steel text-xs">
        <span className="text-brand-black font-mono text-sm font-bold">{totalResults}</span>{' '}
        {totalResults === 1 ? 'produto encontrado' : 'produtos encontrados'}
      </div>

      {/* Tipo */}
      <FilterGroup label="Tipo de produto">
        {TIPOS.map((t) => (
          <RadioPill
            key={t.slug}
            label={t.label}
            checked={currentTipo === t.slug}
            onClick={() => setParam('tipo', currentTipo === t.slug ? null : t.slug)}
          />
        ))}
      </FilterGroup>

      {/* Linha */}
      {lines.length > 0 && (
        <FilterGroup label="Linha de aplicação">
          {lines.map((l) => (
            <RadioPill
              key={l.slug}
              label={l.label}
              hint={l.brandCount ? `${l.brandCount} marcas` : undefined}
              checked={currentLinha === l.slug}
              onClick={() => setParam('linha', currentLinha === l.slug ? null : l.slug)}
            />
          ))}
        </FilterGroup>
      )}

      {/* Categorias */}
      {availableCategories.length > 0 && (
        <FilterGroup label="Categoria">
          {availableCategories.slice(0, 12).map((c) => (
            <RadioPill
              key={c.slug}
              label={c.label}
              hint={c.count ? String(c.count) : undefined}
              checked={currentCategoria === c.slug}
              onClick={() => setParam('categoria', currentCategoria === c.slug ? null : c.slug)}
            />
          ))}
        </FilterGroup>
      )}

      {/* Flags */}
      <FilterGroup label="Destaques">
        <CheckboxRow
          icon={<Sparkles className="size-3" strokeWidth={2.5} />}
          label="Apenas patenteados"
          checked={currentPatenteado}
          onChange={(v) => setParam('patenteado', v ? 'true' : null)}
        />
        <CheckboxRow
          icon={<Zap className="size-3" strokeWidth={2.5} />}
          label="Apenas lançamentos"
          checked={currentLancamento}
          onChange={(v) => setParam('lancamento', v ? 'true' : null)}
        />
      </FilterGroup>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="of-scroll sticky top-32 hidden max-h-[calc(100vh-9rem)] w-64 shrink-0 self-start overflow-y-auto pr-4 lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onMobileClose}
            role="presentation"
          />
          <div className="of-scroll absolute top-0 right-0 bottom-0 w-[88vw] max-w-sm overflow-y-auto bg-white shadow-2xl">
            <div className="border-brand-mist sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4">
              <span className="font-display text-sm font-bold tracking-widest uppercase">
                Filtros
              </span>
              <button
                type="button"
                onClick={onMobileClose}
                className="-mr-1.5 p-1.5"
                aria-label="Fechar filtros"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-5">{content}</div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Componentes internos ───
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-brand-iron font-mono text-[10px] tracking-[0.22em] uppercase">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function RadioPill({
  label,
  hint,
  checked,
  onClick,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium transition ${
        checked
          ? 'bg-brand-black border-brand-black text-white'
          : 'bg-brand-white text-brand-iron border-brand-mist hover:border-brand-iron hover:text-brand-black'
      }`}
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {label}
      {hint && (
        <span className={`font-mono text-[10px] ${checked ? 'text-white/60' : 'text-brand-steel'}`}>
          {hint}
        </span>
      )}
    </button>
  );
}

function CheckboxRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="group flex w-full cursor-pointer items-center gap-2.5">
      <span
        className={`relative flex h-4 w-4 items-center justify-center border transition ${
          checked
            ? 'bg-brand-yellow border-brand-yellow'
            : 'border-brand-mist group-hover:border-brand-iron bg-white'
        }`}
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        {checked && <span className="text-brand-black">{icon}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-brand-iron group-hover:text-brand-black text-xs transition">
        {label}
      </span>
    </label>
  );
}
