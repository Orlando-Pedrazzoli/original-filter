/* ══════════════════════════════════════════
   ProductsListClient — Original Filter Admin
   ──────────────────────────────────────────
   Client component que gerencia:
   - Estado de filtros (q, status, productType, hasImage)
   - Paginação (page, limit)
   - Sort (sortKey, sortOrder)
   - Loading
   - Fetch da API /api/admin/products
   - Renderização do AdminTable
   ══════════════════════════════════════════ */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  X,
  ImageOff,
  Edit3,
  ExternalLink,
  Sparkles,
  Award,
  Star,
  ImagePlus,
} from 'lucide-react';
import { adminApi, type ProductListItem, type ProductListQuery } from '@/lib/admin-api';
import { useAdminToast } from '@/components/admin/admin-toast';
import { AdminTable, type AdminTableColumn } from '@/components/admin/table/admin-table';
import { AdminPagination } from '@/components/admin/table/admin-pagination';

const LIMIT = 25;

export function ProductsListClient() {
  const { toast } = useAdminToast();

  // Filtros e paginação
  const [query, setQuery] = useState<ProductListQuery>({
    page: 1,
    limit: LIMIT,
    sort: 'updatedAt',
    order: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');

  // Estado da resposta
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: LIMIT,
  });
  const [loading, setLoading] = useState(true);

  // ─── Fetch ───
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.products.list(query);
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Debounce na busca ───
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery((q) => ({ ...q, q: searchInput.trim(), page: 1 }));
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ─── Handlers ───
  function setFilter<K extends keyof ProductListQuery>(key: K, value: ProductListQuery[K]) {
    setQuery((q) => ({ ...q, [key]: value, page: 1 }));
  }

  function handleSort(key: string) {
    setQuery((q) => {
      if (q.sort === key) {
        return { ...q, order: q.order === 'asc' ? 'desc' : 'asc', page: 1 };
      }
      return { ...q, sort: key, order: 'asc', page: 1 };
    });
  }

  function clearFilters() {
    setSearchInput('');
    setQuery({
      page: 1,
      limit: LIMIT,
      sort: 'updatedAt',
      order: 'desc',
    });
  }

  const hasActiveFilters = !!query.q || !!query.status || !!query.productType || !!query.hasImage;

  // ─── Colunas da tabela ───
  const columns: AdminTableColumn<ProductListItem>[] = [
    {
      key: 'image',
      label: '',
      width: '60px',
      render: (p) => (
        <div className="bg-brand-snow border-brand-mist relative flex size-12 items-center justify-center overflow-hidden border">
          {p.primaryImage ? (
            <Image
              src={p.primaryImage}
              alt={p.title}
              fill
              sizes="48px"
              className="object-contain p-1"
            />
          ) : (
            <ImageOff className="text-brand-mist size-4" strokeWidth={1.5} />
          )}
        </div>
      ),
    },
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
      render: (p) => (
        <Link
          href={`/admin/produtos/${p.slug}/editar`}
          className="text-brand-yellow-deep hover:text-brand-black font-mono text-xs font-bold tracking-wider transition"
        >
          {p.sku}
        </Link>
      ),
    },
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      render: (p) => (
        <div className="max-w-md">
          <Link
            href={`/admin/produtos/${p.slug}/editar`}
            className="text-brand-black hover:text-brand-yellow-deep line-clamp-2 text-sm leading-tight transition"
          >
            {p.title}
          </Link>
          {p.category && (
            <div className="text-brand-iron mt-1 font-mono text-[10px] tracking-widest uppercase">
              {p.category}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'productType',
      label: 'Tipo',
      hideOnMobile: true,
      render: (p) => <TypeBadge type={p.productType} />,
    },
    {
      key: 'flags',
      label: 'Flags',
      hideOnMobile: true,
      render: (p) => (
        <div className="flex items-center gap-1">
          {!p.hasImage && (
            <span title="Sem imagem">
              <ImagePlus className="size-3.5 text-red-500" strokeWidth={2} />
            </span>
          )}
          {p.isNewRelease && (
            <span title="Lançamento">
              <Sparkles className="text-brand-yellow-deep size-3.5" strokeWidth={2} />
            </span>
          )}
          {p.isPatented && (
            <span title="Patenteado">
              <Award className="text-brand-black size-3.5" strokeWidth={2} />
            </span>
          )}
          {p.isFeatured && (
            <span title="Em destaque">
              <Star className="text-brand-iron size-3.5" strokeWidth={2} />
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'retailPrice',
      label: 'Preço',
      sortable: true,
      align: 'right',
      hideOnMobile: true,
      render: (p) => (
        <span className="text-brand-black font-mono text-xs">
          {p.retailPrice > 0
            ? p.retailPrice.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      align: 'center',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '120px',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/produtos/${p.slug}`}
            target="_blank"
            className="text-brand-iron hover:text-brand-yellow-deep hover:bg-brand-snow inline-flex size-8 items-center justify-center transition"
            title="Ver no site"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="size-3.5" />
          </Link>
          <Link
            href={`/admin/produtos/${p.slug}/editar`}
            className="text-brand-iron hover:text-brand-yellow-deep hover:bg-brand-snow inline-flex size-8 items-center justify-center transition"
            title="Editar"
          >
            <Edit3 className="size-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* ─── Filtros ─── */}
      <div
        className="bg-brand-white border-brand-mist border p-4"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {/* Busca */}
          <div className="relative md:col-span-5">
            <Search className="text-brand-steel pointer-events-none absolute top-3 left-3.5 size-4" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por SKU, título ou código OEM..."
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-2.5 pr-10 pl-10 text-sm transition-colors outline-none"
              style={{ borderRadius: 'var(--radius-edge)' }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="text-brand-steel hover:text-brand-black absolute top-2.5 right-3"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Tipo */}
          <div className="md:col-span-2">
            <select
              value={query.productType || ''}
              onChange={(e) =>
                setFilter('productType', e.target.value as ProductListQuery['productType'])
              }
              className="border-brand-mist focus:border-brand-yellow text-brand-black w-full cursor-pointer appearance-none border bg-white px-3 py-2.5 text-sm transition-colors outline-none"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <option value="">Todos os tipos</option>
              <option value="filter">Filtros</option>
              <option value="sensor">Sensores</option>
              <option value="accessory">Acessórios</option>
            </select>
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <select
              value={query.status || ''}
              onChange={(e) => setFilter('status', e.target.value as ProductListQuery['status'])}
              className="border-brand-mist focus:border-brand-yellow text-brand-black w-full cursor-pointer appearance-none border bg-white px-3 py-2.5 text-sm transition-colors outline-none"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <option value="">Qualquer status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="discontinued">Descontinuados</option>
            </select>
          </div>

          {/* Imagem */}
          <div className="md:col-span-2">
            <select
              value={query.hasImage || ''}
              onChange={(e) =>
                setFilter('hasImage', e.target.value as ProductListQuery['hasImage'])
              }
              className="border-brand-mist focus:border-brand-yellow text-brand-black w-full cursor-pointer appearance-none border bg-white px-3 py-2.5 text-sm transition-colors outline-none"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <option value="">Qualquer foto</option>
              <option value="true">Com imagem</option>
              <option value="false">Sem imagem</option>
            </select>
          </div>

          {/* Limpar */}
          <div className="md:col-span-1">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="font-display text-brand-iron hover:text-brand-yellow-deep border-brand-mist hover:border-brand-iron w-full border px-3 py-2.5 text-xs font-semibold tracking-wide uppercase transition"
                style={{ borderRadius: 'var(--radius-edge)' }}
                title="Limpar filtros"
              >
                Limpar
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>

      {/* ─── Tabela ─── */}
      <AdminTable
        columns={columns}
        items={items}
        loading={loading}
        rowKey={(p) => p.slug}
        sortKey={query.sort}
        sortOrder={query.order}
        onSortChange={handleSort}
        emptyMessage="Nenhum produto encontrado"
        emptyHint={
          hasActiveFilters
            ? 'Ajuste os filtros ou limpe para ver todos os produtos.'
            : 'Comece criando seu primeiro produto.'
        }
      />

      {/* ─── Paginação ─── */}
      <AdminPagination
        page={pagination.page}
        pages={pagination.pages}
        total={pagination.total}
        limit={pagination.limit}
        loading={loading}
        onChange={(page) => setQuery((q) => ({ ...q, page }))}
      />
    </div>
  );
}

// ─── TypeBadge ───
function TypeBadge({ type }: { type: 'filter' | 'sensor' | 'accessory' }) {
  const config = {
    sensor: { label: 'Sensor', class: 'bg-brand-black text-brand-yellow' },
    filter: { label: 'Filtro', class: 'bg-brand-mist text-brand-iron' },
    accessory: {
      label: 'Acessório',
      class: 'bg-brand-snow text-brand-iron border border-brand-mist',
    },
  };
  const cfg = config[type] ?? config.filter;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase ${cfg.class}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── StatusBadge ───
function StatusBadge({ status }: { status: 'active' | 'inactive' | 'discontinued' }) {
  const config = {
    active: {
      label: 'Ativo',
      class: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    inactive: {
      label: 'Inativo',
      class: 'bg-brand-snow text-brand-iron border border-brand-mist',
    },
    discontinued: {
      label: 'Descont.',
      class: 'bg-red-50 text-red-700 border border-red-200',
    },
  };
  const cfg = config[status] ?? config.active;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase ${cfg.class}`}
    >
      {cfg.label}
    </span>
  );
}
