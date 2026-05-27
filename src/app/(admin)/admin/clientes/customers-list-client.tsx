/* ══════════════════════════════════════════
   CustomersListClient — Original Filter Admin
   ══════════════════════════════════════════ */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  Users,
  Briefcase,
  UserRound,
  ChevronRight,
  Clock,
  ShoppingBag,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { adminApi, type CustomerListItem, type CustomerListQuery } from '@/lib/admin-api';
import { useAdminToast } from '@/components/admin/admin-toast';
import { AdminTable, type AdminTableColumn } from '@/components/admin/table/admin-table';
import { AdminPagination } from '@/components/admin/table/admin-pagination';

const LIMIT = 25;

function formatMoney(value: number): string {
  return (value ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatCnpj(cnpj?: string): string {
  if (!cnpj) return '';
  const d = cnpj.replace(/\D/g, '');
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function relativeTime(date: string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  const diffH = Math.round(diffMs / 3600000);
  const diffD = Math.round(diffMs / 86400000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffH < 24) return `há ${diffH}h`;
  if (diffD < 30) return `há ${diffD}d`;
  return d.toLocaleDateString('pt-BR');
}

export function CustomersListClient() {
  const { toast } = useAdminToast();

  const [query, setQuery] = useState<CustomerListQuery>({
    page: 1,
    limit: LIMIT,
    role: 'all',
    sort: 'createdAt',
    order: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');

  const [items, setItems] = useState<CustomerListItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: LIMIT,
  });
  const [counts, setCounts] = useState({
    retail: 0,
    reseller: 0,
    active: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.customers.list(query);
      setItems(data.items);
      setPagination(data.pagination);
      setCounts(data.counts);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao carregar clientes');
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

  function setRoleTab(role: 'all' | 'retail' | 'reseller') {
    setQuery((q) => ({ ...q, role, page: 1 }));
  }

  function setActiveFilter(active: '' | 'true' | 'false') {
    setQuery((q) => ({ ...q, active, page: 1 }));
  }

  function handleSort(key: string) {
    setQuery((q) => {
      if (q.sort === key) {
        return { ...q, order: q.order === 'asc' ? 'desc' : 'asc', page: 1 };
      }
      return { ...q, sort: key, order: 'desc', page: 1 };
    });
  }

  const totalAll = counts.retail + counts.reseller;

  const columns: AdminTableColumn<CustomerListItem>[] = [
    {
      key: 'name',
      label: 'Cliente',
      sortable: true,
      render: (c) => (
        <div className="max-w-xs">
          <div className="flex items-center gap-1.5">
            {c.role === 'reseller' ? (
              <Briefcase className="text-brand-yellow-deep size-3 shrink-0" />
            ) : (
              <UserRound className="text-brand-iron size-3 shrink-0" />
            )}
            <Link
              href={`/admin/clientes/${c._id}`}
              className="font-display text-brand-black hover:text-brand-yellow-deep truncate text-sm font-bold transition"
            >
              {c.name || '—'}
            </Link>
            {!c.isActive && (
              <span className="inline-flex items-center border border-red-200 bg-red-100 px-1 py-0 font-mono text-[9px] font-bold tracking-widest text-red-800 uppercase">
                Inativo
              </span>
            )}
          </div>
          <div className="text-brand-iron mt-0.5 truncate font-mono text-[10px]">{c.email}</div>
          {c.company?.cnpj && (
            <div className="text-brand-steel mt-0.5 truncate font-mono text-[10px]">
              {formatCnpj(c.company.cnpj)}
              {c.company.razaoSocial && (
                <span className="text-brand-iron"> · {c.company.razaoSocial}</span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Tipo',
      hideOnMobile: true,
      render: (c) => (
        <div className="flex items-center gap-1.5">
          {c.role === 'reseller' ? (
            <span className="bg-brand-yellow text-brand-black inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
              <Briefcase className="size-2.5" strokeWidth={3} />
              B2B
            </span>
          ) : (
            <span className="bg-brand-snow text-brand-iron border-brand-mist inline-flex items-center border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
              Varejo
            </span>
          )}
          {c.discountTier > 0 && (
            <span className="bg-brand-black text-brand-yellow inline-flex items-center px-1 py-0 font-mono text-[9px] font-bold tracking-widest uppercase">
              {c.discountTier}%
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'ordersCount',
      label: 'Pedidos',
      align: 'center',
      hideOnMobile: true,
      render: (c) => (
        <div className="text-center">
          <div className="font-display text-brand-black font-bold tabular-nums">
            {c.ordersCount}
          </div>
          {c.lastOrderAt && (
            <div className="text-brand-steel mt-0.5 font-mono text-[10px] tracking-widest uppercase">
              {relativeTime(c.lastOrderAt)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'totalSpent',
      label: 'Comprou',
      align: 'right',
      hideOnMobile: true,
      render: (c) => (
        <div className="text-right">
          <div className="text-brand-black font-mono font-bold tabular-nums">
            {formatMoney(c.totalSpent)}
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Desde',
      sortable: true,
      hideOnMobile: true,
      render: (c) => (
        <div className="text-brand-iron flex items-center gap-1 text-xs">
          <Clock className="size-3 shrink-0" />
          {relativeTime(c.createdAt)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '40px',
      render: () => <ChevronRight className="text-brand-mist ml-auto size-4" strokeWidth={2} />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total" value={String(totalAll)} icon={<Users className="size-4" />} />
        <StatCard
          label="Revendedores B2B"
          value={String(counts.reseller)}
          icon={<Briefcase className="size-4" />}
          highlight
        />
        <StatCard
          label="Ativos"
          value={String(counts.active)}
          icon={<CheckCircle2 className="size-4" />}
        />
        <StatCard
          label="Inativos"
          value={String(counts.inactive)}
          icon={<XCircle className="size-4" />}
        />
      </div>

      {/* Tabs por role */}
      <div className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1">
        <StatusTab
          label="Todos"
          count={totalAll}
          active={query.role === 'all'}
          onClick={() => setRoleTab('all')}
        />
        <StatusTab
          label="Varejo"
          count={counts.retail}
          active={query.role === 'retail'}
          onClick={() => setRoleTab('retail')}
        />
        <StatusTab
          label="Revendedores"
          count={counts.reseller}
          active={query.role === 'reseller'}
          highlight
          onClick={() => setRoleTab('reseller')}
        />
      </div>

      {/* Filtros */}
      <div
        className="bg-brand-white border-brand-mist border p-4"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-8">
            <Search className="text-brand-steel pointer-events-none absolute top-3 left-3.5 size-4" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nome, email, telefone, CPF ou CNPJ..."
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

          <div className="md:col-span-4">
            <select
              value={query.active || ''}
              onChange={(e) => setActiveFilter(e.target.value as '' | 'true' | 'false')}
              className="border-brand-mist focus:border-brand-yellow text-brand-black w-full cursor-pointer appearance-none border bg-white px-3 py-2.5 text-sm transition-colors outline-none"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <option value="">Ativos e inativos</option>
              <option value="true">Apenas ativos</option>
              <option value="false">Apenas inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <AdminTable
        columns={columns}
        items={items}
        loading={loading}
        rowKey={(c) => c._id}
        sortKey={query.sort}
        sortOrder={query.order}
        onSortChange={handleSort}
        onRowClick={(c) => {
          window.location.href = `/admin/clientes/${c._id}`;
        }}
        emptyMessage="Nenhum cliente encontrado"
        emptyHint={
          totalAll === 0
            ? 'Quando alguém se cadastrar no site ou for aprovado como revendedor, aparecerá aqui.'
            : 'Ajuste a busca ou volte para outras abas.'
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

// ═══════════════════════════════════════════
//   Sub-componentes
// ═══════════════════════════════════════════

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-brand-white border p-4 ${
        highlight ? 'border-brand-yellow' : 'border-brand-mist'
      }`}
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <div
        className={`mb-2 flex items-center gap-2 ${
          highlight ? 'text-brand-yellow-deep' : 'text-brand-iron'
        }`}
      >
        {icon}
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase">{label}</span>
      </div>
      <div
        className="font-display text-brand-black leading-none font-black tracking-tight"
        style={{
          fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          letterSpacing: '-0.025em',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatusTab({
  label,
  count,
  active,
  highlight,
  onClick,
}: {
  label: string;
  count: number;
  active?: boolean;
  highlight?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-display inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition ${
        active
          ? 'bg-brand-black text-brand-yellow'
          : 'bg-brand-white text-brand-iron border-brand-mist hover:border-brand-iron border'
      }`}
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {label}
      <span
        className={`font-mono text-[10px] ${
          active
            ? 'text-brand-yellow/70'
            : highlight && count > 0
              ? 'text-brand-yellow-deep font-bold'
              : 'text-brand-steel'
        }`}
      >
        ({count})
      </span>
    </button>
  );
}
