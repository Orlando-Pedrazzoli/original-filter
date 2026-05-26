/* ══════════════════════════════════════════
   BrandsListClient — Original Filter Admin
   ──────────────────────────────────────────
   Lista de marcas com:
   - Busca por nome/slug
   - Filtros: categoria, ativo/inativo
   - Sort por nome, displayOrder
   - Paginação
   - Ações: editar, ativar/desativar
   ══════════════════════════════════════════ */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Edit3, ExternalLink, ImageOff, Eye, EyeOff } from 'lucide-react';
import { adminApi, type BrandListItem, type BrandListQuery } from '@/lib/admin-api';
import { useAdminToast } from '@/components/admin/admin-toast';
import { AdminTable, type AdminTableColumn } from '@/components/admin/table/admin-table';
import { AdminPagination } from '@/components/admin/table/admin-pagination';

const LIMIT = 50;

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'rodoviario', label: 'Rodoviário' },
  { value: 'agricola', label: 'Agrícola' },
  { value: 'maquinas-pesadas', label: 'Máquinas pesadas' },
  { value: 'automotivo', label: 'Automotivo' },
  { value: 'industrial', label: 'Industrial' },
];

export function BrandsListClient() {
  const { toast } = useAdminToast();
  const [query, setQuery] = useState<BrandListQuery>({
    page: 1,
    limit: LIMIT,
    sort: 'displayOrder',
    order: 'asc',
  });
  const [searchInput, setSearchInput] = useState('');
  const [items, setItems] = useState<BrandListItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: LIMIT,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.brands.list(query);
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao carregar marcas');
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery((q) => ({ ...q, q: searchInput.trim(), page: 1 }));
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  function setFilter<K extends keyof BrandListQuery>(key: K, value: BrandListQuery[K]) {
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
    setQuery({ page: 1, limit: LIMIT, sort: 'displayOrder', order: 'asc' });
  }

  // Toggle ativo/inativo inline
  async function toggleActive(brand: BrandListItem) {
    try {
      await adminApi.brands.update(brand.slug, { isActive: !brand.isActive });
      setItems((prev) =>
        prev.map((b) => (b.slug === brand.slug ? { ...b, isActive: !b.isActive } : b)),
      );
      toast.success(
        brand.isActive ? `Marca "${brand.name}" desativada` : `Marca "${brand.name}" ativada`,
      );
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao atualizar');
    }
  }

  const hasActiveFilters = !!query.q || !!query.category || !!query.active;

  const columns: AdminTableColumn<BrandListItem>[] = [
    {
      key: 'logo',
      label: '',
      width: '72px',
      render: (b) => (
        <div className="bg-brand-snow border-brand-mist relative flex size-14 items-center justify-center overflow-hidden border">
          {b.logo ? (
            <Image src={b.logo} alt={b.name} fill sizes="56px" className="object-contain p-2" />
          ) : (
            <ImageOff className="text-brand-mist size-4" strokeWidth={1.5} />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
      render: (b) => (
        <div>
          <Link
            href={`/admin/marcas/${b.slug}/editar`}
            className="font-display text-brand-black hover:text-brand-yellow-deep font-bold transition"
          >
            {b.name}
          </Link>
          <div className="text-brand-iron mt-0.5 font-mono text-[10px] tracking-widest uppercase">
            {b.slug}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Categoria',
      hideOnMobile: true,
      render: (b) => <CategoryBadge category={b.category} />,
    },
    {
      key: 'country',
      label: 'País',
      hideOnMobile: true,
      render: (b) => <span className="text-brand-iron text-xs">{b.country || '—'}</span>,
    },
    {
      key: 'displayOrder',
      label: 'Ordem',
      sortable: true,
      align: 'center',
      hideOnMobile: true,
      render: (b) => <span className="text-brand-iron font-mono text-xs">{b.displayOrder}</span>,
    },
    {
      key: 'productsCount',
      label: 'Produtos',
      align: 'center',
      hideOnMobile: true,
      render: (b) => (
        <span className="text-brand-black font-mono text-xs font-bold">{b.productsCount}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      align: 'center',
      render: (b) => (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase ${
            b.isActive
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'bg-brand-snow text-brand-iron border-brand-mist border'
          }`}
        >
          {b.isActive ? 'Ativa' : 'Inativa'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '140px',
      render: (b) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/produtos/marca/${b.slug}`}
            target="_blank"
            className="text-brand-iron hover:text-brand-yellow-deep hover:bg-brand-snow inline-flex size-8 items-center justify-center transition"
            title="Ver no site"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="size-3.5" />
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleActive(b);
            }}
            className="text-brand-iron hover:text-brand-yellow-deep hover:bg-brand-snow inline-flex size-8 items-center justify-center transition"
            title={b.isActive ? 'Desativar' : 'Ativar'}
          >
            {b.isActive ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
          <Link
            href={`/admin/marcas/${b.slug}/editar`}
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
      {/* Filtros */}
      <div
        className="bg-brand-white border-brand-mist border p-4"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-6">
            <Search className="text-brand-steel pointer-events-none absolute top-3 left-3.5 size-4" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nome ou slug..."
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

          <div className="md:col-span-3">
            <select
              value={query.category || ''}
              onChange={(e) => setFilter('category', e.target.value as BrandListQuery['category'])}
              className="border-brand-mist focus:border-brand-yellow text-brand-black w-full cursor-pointer appearance-none border bg-white px-3 py-2.5 text-sm transition-colors outline-none"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <option value="">Todas as categorias</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={query.active || ''}
              onChange={(e) => setFilter('active', e.target.value as BrandListQuery['active'])}
              className="border-brand-mist focus:border-brand-yellow text-brand-black w-full cursor-pointer appearance-none border bg-white px-3 py-2.5 text-sm transition-colors outline-none"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <option value="">Qualquer status</option>
              <option value="true">Ativas</option>
              <option value="false">Inativas</option>
            </select>
          </div>

          <div className="md:col-span-1">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="font-display text-brand-iron hover:text-brand-yellow-deep border-brand-mist hover:border-brand-iron w-full border px-3 py-2.5 text-xs font-semibold tracking-wide uppercase transition"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Limpar
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>

      <AdminTable
        columns={columns}
        items={items}
        loading={loading}
        rowKey={(b) => b.slug}
        sortKey={query.sort}
        sortOrder={query.order}
        onSortChange={handleSort}
        emptyMessage="Nenhuma marca encontrada"
        emptyHint={
          hasActiveFilters
            ? 'Ajuste os filtros para ver mais marcas.'
            : 'Comece cadastrando a primeira marca.'
        }
      />

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

function CategoryBadge({ category }: { category: string }) {
  const config: Record<string, { label: string; class: string }> = {
    rodoviario: {
      label: 'Rodoviário',
      class: 'bg-brand-black text-brand-yellow',
    },
    agricola: {
      label: 'Agrícola',
      class: 'bg-emerald-100 text-emerald-800',
    },
    'maquinas-pesadas': {
      label: 'Máq. pesadas',
      class: 'bg-orange-100 text-orange-800',
    },
    automotivo: {
      label: 'Automotivo',
      class: 'bg-blue-100 text-blue-800',
    },
    industrial: {
      label: 'Industrial',
      class: 'bg-purple-100 text-purple-800',
    },
  };
  const cfg = config[category] ?? {
    label: category,
    class: 'bg-brand-mist text-brand-iron',
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase ${cfg.class}`}
    >
      {cfg.label}
    </span>
  );
}
