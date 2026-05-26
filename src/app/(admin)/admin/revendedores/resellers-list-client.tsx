/* ══════════════════════════════════════════
   ResellersListClient — Original Filter Admin
   ──────────────────────────────────────────
   Tabs por status (Pendentes/Aprovados/Rejeitados/Todos)
   + AdminTable + busca + filtro de segmento + modal de detalhes.
   ══════════════════════════════════════════ */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Check,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import {
  adminApi,
  type ResellerApplicationItem,
  type ResellerListQuery,
  type ResellerStatus,
} from '@/lib/admin-api';
import { useAdminToast } from '@/components/admin/admin-toast';
import { AdminTable, type AdminTableColumn } from '@/components/admin/table/admin-table';
import { AdminPagination } from '@/components/admin/table/admin-pagination';
import { ResellerApplicationModal } from '@/components/admin/resellers/reseller-application-modal';

const LIMIT = 25;

const SEGMENT_OPTIONS = [
  { value: 'oficina', label: 'Oficina' },
  { value: 'distribuidora', label: 'Distribuidora' },
  { value: 'atacado', label: 'Atacado' },
  { value: 'loja', label: 'Loja' },
  { value: 'frota', label: 'Frota' },
  { value: 'concessionaria', label: 'Concessionária' },
  { value: 'outro', label: 'Outro' },
];

const SEGMENT_LABELS: Record<string, string> = {
  oficina: 'Oficina',
  distribuidora: 'Distribuidora',
  atacado: 'Atacado',
  loja: 'Loja',
  frota: 'Frota',
  concessionaria: 'Conces.',
  outro: 'Outro',
};

function formatCnpj(cnpj: string): string {
  const d = cnpj.replace(/\D/g, '');
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function relativeTime(date: string): string {
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

export function ResellersListClient() {
  const { toast } = useAdminToast();
  const [query, setQuery] = useState<ResellerListQuery>({
    page: 1,
    limit: LIMIT,
    status: 'pending',
    sort: 'createdAt',
    order: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');
  const [items, setItems] = useState<ResellerApplicationItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: LIMIT,
  });
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ResellerApplicationItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.resellers.list(query);
      setItems(data.items);
      setPagination(data.pagination);
      setCounts(data.counts);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao carregar aplicações');
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

  function setStatusTab(status: ResellerStatus | 'all') {
    setQuery((q) => ({ ...q, status, page: 1 }));
  }

  function setSegment(segment: ResellerListQuery['segment']) {
    setQuery((q) => ({ ...q, segment, page: 1 }));
  }

  function handleSort(key: string) {
    setQuery((q) => {
      if (q.sort === key) {
        return { ...q, order: q.order === 'asc' ? 'desc' : 'asc', page: 1 };
      }
      return { ...q, sort: key, order: 'desc', page: 1 };
    });
  }

  function handleApplicationUpdated() {
    setSelected(null);
    fetchData();
  }

  const totalAll = counts.pending + counts.approved + counts.rejected;

  const columns: AdminTableColumn<ResellerApplicationItem>[] = [
    {
      key: 'razaoSocial',
      label: 'Empresa',
      sortable: true,
      render: (a) => (
        <div className="max-w-md">
          <div className="flex items-center gap-1.5">
            <Building2 className="text-brand-iron size-3 shrink-0" />
            <span className="font-display text-brand-black truncate font-bold">
              {a.razaoSocial}
            </span>
          </div>
          <div className="text-brand-iron mt-0.5 font-mono text-[10px]">
            {formatCnpj(a.cnpj)}
            {a.nomeFantasia && <span className="text-brand-steel"> · {a.nomeFantasia}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'contato',
      label: 'Contato',
      hideOnMobile: true,
      render: (a) => (
        <div className="max-w-xs">
          <div className="text-brand-black truncate text-sm">{a.contactName}</div>
          <div className="text-brand-iron truncate font-mono text-[10px]">{a.email}</div>
        </div>
      ),
    },
    {
      key: 'segment',
      label: 'Segmento',
      hideOnMobile: true,
      render: (a) => (
        <span className="bg-brand-snow text-brand-iron border-brand-mist inline-flex items-center border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
          {SEGMENT_LABELS[a.segment] ?? a.segment}
        </span>
      ),
    },
    {
      key: 'localizacao',
      label: 'Cidade/UF',
      hideOnMobile: true,
      render: (a) => (
        <div className="text-brand-iron flex items-center gap-1 text-xs">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">
            {a.cidade}
            <span className="text-brand-steel"> / {a.uf}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Data',
      sortable: true,
      hideOnMobile: true,
      render: (a) => (
        <div className="text-brand-iron flex items-center gap-1 text-xs">
          <Clock className="size-3 shrink-0" />
          {relativeTime(a.createdAt)}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (a) => {
        if (a.status === 'pending') {
          return (
            <span className="bg-brand-yellow text-brand-black inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
              Pendente
            </span>
          );
        }
        if (a.status === 'approved') {
          return (
            <span
              className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-100 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-emerald-800 uppercase"
              title={`Tier ${a.approvedDiscountTier}% de desconto`}
            >
              <Check className="size-2.5" strokeWidth={3} />
              {a.approvedDiscountTier}%
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 border border-red-200 bg-red-100 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-red-800 uppercase">
            <XCircle className="size-2.5" strokeWidth={2.5} />
            Rejeitado
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '60px',
      render: () => (
        <div className="flex justify-end">
          <ChevronRight className="text-brand-mist size-4" strokeWidth={2} />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        {/* ─── Tabs de status ─── */}
        <div className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1">
          <StatusTab
            label="Pendentes"
            count={counts.pending}
            active={query.status === 'pending'}
            highlight
            onClick={() => setStatusTab('pending')}
          />
          <StatusTab
            label="Aprovadas"
            count={counts.approved}
            active={query.status === 'approved'}
            onClick={() => setStatusTab('approved')}
          />
          <StatusTab
            label="Rejeitadas"
            count={counts.rejected}
            active={query.status === 'rejected'}
            onClick={() => setStatusTab('rejected')}
          />
          <StatusTab
            label="Todas"
            count={totalAll}
            active={query.status === 'all'}
            onClick={() => setStatusTab('all')}
          />
        </div>

        {/* ─── Busca + filtros ─── */}
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
                placeholder="Buscar por razão social, CNPJ, nome, email ou cidade..."
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
                value={query.segment || ''}
                onChange={(e) => setSegment(e.target.value as ResellerListQuery['segment'])}
                className="border-brand-mist focus:border-brand-yellow text-brand-black w-full cursor-pointer appearance-none border bg-white px-3 py-2.5 text-sm transition-colors outline-none"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <option value="">Todos os segmentos</option>
                {SEGMENT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─── Tabela ─── */}
        <AdminTable
          columns={columns}
          items={items}
          loading={loading}
          rowKey={(a) => a._id}
          sortKey={query.sort}
          sortOrder={query.order}
          onSortChange={handleSort}
          onRowClick={(a) => setSelected(a)}
          emptyMessage={
            query.status === 'pending'
              ? 'Nenhuma aplicação pendente'
              : query.status === 'approved'
                ? 'Nenhuma aplicação aprovada'
                : query.status === 'rejected'
                  ? 'Nenhuma aplicação rejeitada'
                  : 'Nenhuma aplicação encontrada'
          }
          emptyHint={
            query.status === 'pending'
              ? 'Quando alguém preencher o formulário de "Seja Revendedor", aparecerá aqui.'
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

      {/* ─── Modal ─── */}
      {selected && (
        <ResellerApplicationModal
          application={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleApplicationUpdated}
        />
      )}
    </>
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
      className={`font-display relative inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition ${
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
      {highlight && !active && count > 0 && (
        <span
          className="bg-brand-yellow absolute -top-1 -right-1 size-2"
          style={{ borderRadius: '50%' }}
        />
      )}
    </button>
  );
}
