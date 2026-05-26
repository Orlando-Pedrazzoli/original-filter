/* ══════════════════════════════════════════
   AdminLaunchesClient — Original Filter Admin
   ──────────────────────────────────────────
   Client component que mostra a lista de produtos com:
   - Tabs (Todos / Sensores / Filtros / Acessórios)
   - Filtro "só lançamentos"
   - Busca por SKU, título ou categoria
   - Toggle inline em cada produto (chama ProductFlagsToggle compact)
   - Linha por produto, otimizado para escanear visualmente
   ══════════════════════════════════════════ */

'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  Award,
  Star,
  ExternalLink,
  ImageOff,
  Activity,
  Filter as FilterIcon,
  Wrench,
  Package,
  X,
} from 'lucide-react';
import { ProductFlagsToggle } from '@/components/admin/product-flags-toggle';
import type { AdminProductRow } from './page';

type TabKey = 'all' | 'sensor' | 'filter' | 'accessory';
type ViewMode = 'all' | 'launches-only';

const TABS: { key: TabKey; label: string; icon: typeof Activity }[] = [
  { key: 'all', label: 'Todos', icon: Package },
  { key: 'sensor', label: 'Sensores', icon: Activity },
  { key: 'filter', label: 'Filtros', icon: FilterIcon },
  { key: 'accessory', label: 'Acessórios', icon: Wrench },
];

interface AdminLaunchesClientProps {
  rows: AdminProductRow[];
}

export function AdminLaunchesClient({ rows: initialRows }: AdminLaunchesClientProps) {
  const [rows, setRows] = useState(initialRows);
  const [tab, setTab] = useState<TabKey>('all');
  const [view, setView] = useState<ViewMode>('all');
  const [search, setSearch] = useState('');

  // ─── Filtragem ───
  const filtered = useMemo(() => {
    let result = rows;

    // Tab
    if (tab !== 'all') {
      result = result.filter((r) => r.productType === tab);
    }

    // View
    if (view === 'launches-only') {
      result = result.filter((r) => r.isNewRelease);
    }

    // Busca
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.sku.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q),
      );
    }

    return result;
  }, [rows, tab, view, search]);

  // ─── Contadores por tab ───
  const tabCounts = useMemo(() => {
    return {
      all: rows.length,
      sensor: rows.filter((r) => r.productType === 'sensor').length,
      filter: rows.filter((r) => r.productType === 'filter').length,
      accessory: rows.filter((r) => r.productType === 'accessory').length,
    };
  }, [rows]);

  // ─── Atualização local após toggle ───
  function handleUpdate(
    slug: string,
    flags: { isNewRelease: boolean; isPatented: boolean; isFeatured: boolean },
  ) {
    setRows((prev) =>
      prev.map((r) =>
        r.slug === slug
          ? {
              ...r,
              isNewRelease: flags.isNewRelease,
              isPatented: flags.isPatented,
              isFeatured: flags.isFeatured,
            }
          : r,
      ),
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Tabs ─── */}
      <div className="-mx-4 flex items-center gap-1 overflow-x-auto px-4 pb-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const count = tabCounts[t.key];
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`font-display inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition ${
                isActive
                  ? 'bg-brand-black text-brand-yellow'
                  : 'bg-brand-white text-brand-iron border-brand-mist hover:border-brand-iron border'
              }`}
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <Icon className="size-3.5" strokeWidth={2} />
              {t.label}
              <span
                className={`ml-1 font-mono text-[10px] ${
                  isActive ? 'text-brand-yellow/70' : 'text-brand-steel'
                }`}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Filtros de busca + view ─── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="relative md:col-span-8">
          <Search className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por SKU, título ou categoria..."
            className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-3 pr-10 pl-10 text-[15px] leading-normal transition-colors outline-none"
            style={{ borderRadius: 'var(--radius-edge)' }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-brand-steel hover:text-brand-black absolute top-3 right-3 transition"
              aria-label="Limpar busca"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-stretch gap-2 md:col-span-4">
          <button
            type="button"
            onClick={() => setView('all')}
            className={`font-display inline-flex flex-1 items-center justify-center gap-2 px-3 py-3 text-xs font-semibold tracking-wide uppercase transition ${
              view === 'all'
                ? 'bg-brand-black text-white'
                : 'bg-brand-white text-brand-iron border-brand-mist hover:border-brand-iron border'
            }`}
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setView('launches-only')}
            className={`font-display inline-flex flex-1 items-center justify-center gap-2 px-3 py-3 text-xs font-semibold tracking-wide uppercase transition ${
              view === 'launches-only'
                ? 'bg-brand-yellow text-brand-black'
                : 'bg-brand-white text-brand-iron border-brand-mist hover:border-brand-iron border'
            }`}
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <Sparkles className="size-3.5" strokeWidth={2} />
            Só lançamentos
          </button>
        </div>
      </div>

      {/* ─── Contador de resultados ─── */}
      <div className="text-brand-iron flex items-center justify-between font-mono text-xs tracking-widest uppercase">
        <span>
          Mostrando <strong className="text-brand-black font-bold">{filtered.length}</strong>{' '}
          {filtered.length === 1 ? 'produto' : 'produtos'}
        </span>
        {filtered.length !== rows.length && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setTab('all');
              setView('all');
            }}
            className="text-brand-iron hover:text-brand-yellow-deep transition"
          >
            Limpar filtros ×
          </button>
        )}
      </div>

      {/* ─── Lista ─── */}
      {filtered.length === 0 ? (
        <div
          className="bg-brand-white border-brand-mist border p-10 text-center"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <Search className="text-brand-iron mx-auto mb-3 size-10" strokeWidth={1.5} />
          <div className="font-display text-brand-black mb-1 font-bold">
            Nenhum produto encontrado
          </div>
          <p className="text-brand-steel text-sm">
            Ajuste os filtros ou a busca para ver resultados.
          </p>
        </div>
      ) : (
        <div className="bg-brand-mist space-y-px">
          {filtered.map((row) => (
            <ProductRow key={row.slug} row={row} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Linha individual do produto ───
function ProductRow({
  row,
  onUpdate,
}: {
  row: AdminProductRow;
  onUpdate: (
    slug: string,
    flags: { isNewRelease: boolean; isPatented: boolean; isFeatured: boolean },
  ) => void;
}) {
  return (
    <div className="bg-brand-white hover:bg-brand-snow flex flex-col gap-4 p-4 transition-colors md:flex-row md:items-center md:p-5">
      {/* Imagem */}
      <div className="bg-brand-snow border-brand-mist relative flex size-16 shrink-0 items-center justify-center overflow-hidden border md:size-20">
        {row.primaryImage ? (
          <Image
            src={row.primaryImage}
            alt={row.title}
            fill
            sizes="80px"
            className="object-contain p-2"
          />
        ) : (
          <ImageOff className="text-brand-mist size-6" strokeWidth={1.5} />
        )}
      </div>

      {/* Dados */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-brand-yellow-deep font-mono text-xs font-bold tracking-wider">
            {row.sku}
          </span>
          <TypeBadge type={row.productType} />
          {row.status === 'inactive' && (
            <span className="bg-brand-mist text-brand-iron inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
              Inativo
            </span>
          )}
          {/* Flags atuais como badges */}
          {row.isNewRelease && (
            <span className="bg-brand-yellow text-brand-black inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
              <Sparkles className="size-2.5" strokeWidth={2.5} />
              Lançamento
            </span>
          )}
          {row.isPatented && (
            <span className="bg-brand-black text-brand-yellow inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
              <Award className="size-2.5" strokeWidth={2.5} />
              Patenteado
            </span>
          )}
          {row.isFeatured && (
            <span className="bg-brand-iron text-brand-yellow inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
              <Star className="size-2.5" strokeWidth={2.5} />
              Destaque
            </span>
          )}
        </div>
        <div className="text-brand-black mb-1 line-clamp-2 text-sm leading-tight">{row.title}</div>
        {row.category && (
          <div className="text-brand-iron font-mono text-[10px] tracking-widest uppercase">
            {row.category}
          </div>
        )}
      </div>

      {/* Link para o produto público */}
      <Link
        href={`/produtos/${row.slug}`}
        target="_blank"
        className="text-brand-iron hover:text-brand-yellow-deep hover:bg-brand-snow hidden size-9 items-center justify-center transition md:inline-flex"
        title="Ver no site"
      >
        <ExternalLink className="size-4" />
      </Link>

      {/* Toggles */}
      <div className="shrink-0 md:w-72">
        <ProductFlagsToggle
          slug={row.slug}
          sku={row.sku}
          initialFlags={{
            isNewRelease: row.isNewRelease,
            isPatented: row.isPatented,
            isFeatured: row.isFeatured,
          }}
          onUpdate={(flags) => onUpdate(row.slug, flags)}
        />
      </div>
    </div>
  );
}

// ─── Badge de tipo ───
function TypeBadge({ type }: { type: string }) {
  const config = {
    sensor: { label: 'Sensor', class: 'bg-brand-black text-brand-yellow' },
    filter: { label: 'Filtro', class: 'bg-brand-mist text-brand-iron' },
    accessory: {
      label: 'Acessório',
      class: 'bg-brand-snow text-brand-iron border border-brand-mist',
    },
  };
  const cfg = config[type as keyof typeof config] ?? config.filter;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase ${cfg.class}`}
    >
      {cfg.label}
    </span>
  );
}
