/* ══════════════════════════════════════════
   OrdersListClient — Original Filter Admin
   ══════════════════════════════════════════ */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  ShoppingBag,
  Clock,
  ChevronRight,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
  AlertCircle,
  CreditCard,
  Briefcase,
  UserRound,
} from 'lucide-react';
import {
  adminApi,
  type OrderListItem,
  type OrderListQuery,
  type FulfillmentStatus,
} from '@/lib/admin-api';
import { useAdminToast } from '@/components/admin/admin-toast';
import { AdminTable, type AdminTableColumn } from '@/components/admin/table/admin-table';
import { AdminPagination } from '@/components/admin/table/admin-pagination';

const LIMIT = 25;

function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
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

export function OrdersListClient() {
  const { toast } = useAdminToast();

  const [query, setQuery] = useState<OrderListQuery>({
    page: 1,
    limit: LIMIT,
    fulfillmentStatus: 'pending',
    sort: 'createdAt',
    order: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');

  const [items, setItems] = useState<OrderListItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: LIMIT,
  });
  const [counts, setCounts] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
  });
  const [stats, setStats] = useState({ totalRevenue: 0, paidRevenue: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.orders.list(query);
      setItems(data.items);
      setPagination(data.pagination);
      setCounts(data.counts);
      setStats(data.stats);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao carregar pedidos');
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

  function setFulfillmentTab(status: FulfillmentStatus | '') {
    setQuery((q) => ({ ...q, fulfillmentStatus: status, page: 1 }));
  }

  function setRoleFilter(role: '' | 'retail' | 'reseller') {
    setQuery((q) => ({ ...q, role, page: 1 }));
  }

  function handleSort(key: string) {
    setQuery((q) => {
      if (q.sort === key) {
        return { ...q, order: q.order === 'asc' ? 'desc' : 'asc', page: 1 };
      }
      return { ...q, sort: key, order: 'desc', page: 1 };
    });
  }

  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);
  const activeOrders = counts.pending + counts.processing + counts.shipped;

  const columns: AdminTableColumn<OrderListItem>[] = [
    {
      key: 'orderNumber',
      label: 'Pedido',
      sortable: true,
      render: (o) => (
        <Link
          href={`/admin/pedidos/${o._id}`}
          className="text-brand-yellow-deep hover:text-brand-black font-mono text-xs font-bold tracking-wider transition"
        >
          {o.orderNumber}
        </Link>
      ),
    },
    {
      key: 'customer',
      label: 'Cliente',
      render: (o) => (
        <div className="max-w-xs">
          <div className="flex items-center gap-1.5">
            {o.customerRole === 'reseller' ? (
              <Briefcase className="text-brand-yellow-deep size-3 shrink-0" />
            ) : (
              <UserRound className="text-brand-iron size-3 shrink-0" />
            )}
            <span className="font-display text-brand-black truncate text-sm font-bold">
              {o.customerName}
            </span>
            {o.customerTier > 0 && (
              <span className="bg-brand-yellow text-brand-black inline-flex items-center px-1 py-0 font-mono text-[9px] font-bold tracking-widest uppercase">
                {o.customerTier}%
              </span>
            )}
          </div>
          <div className="text-brand-iron mt-0.5 truncate font-mono text-[10px]">
            {o.customerEmail}
          </div>
        </div>
      ),
    },
    {
      key: 'payment',
      label: 'Pagamento',
      hideOnMobile: true,
      render: (o) => (
        <div>
          <PaymentBadge status={o.paymentStatus} />
          {o.paymentMethod && (
            <div className="text-brand-iron mt-1 font-mono text-[10px] tracking-widest uppercase">
              {paymentMethodLabel(o.paymentMethod)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      align: 'right',
      render: (o) => (
        <div className="text-right">
          <div className="font-display text-brand-black font-bold">{formatMoney(o.total)}</div>
          {o.discountTotal > 0 && (
            <div className="text-brand-yellow-deep font-mono text-[10px]">
              −{formatMoney(o.discountTotal)} B2B
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Data',
      sortable: true,
      hideOnMobile: true,
      render: (o) => (
        <div className="text-brand-iron flex items-center gap-1 text-xs">
          <Clock className="size-3 shrink-0" />
          {relativeTime(o.createdAt)}
        </div>
      ),
    },
    {
      key: 'fulfillmentStatus',
      label: 'Status',
      align: 'center',
      render: (o) => <FulfillmentBadge status={o.fulfillmentStatus} />,
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
      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Pedidos ativos"
          value={String(activeOrders)}
          hint={`${totalAll} no total`}
          icon={<Package className="size-4" />}
        />
        <StatCard
          label="Entregues"
          value={String(counts.delivered)}
          icon={<CheckCircle2 className="size-4" />}
        />
        <StatCard
          label="Receita confirmada"
          value={formatMoney(stats.paidRevenue)}
          hint="Pagos + enviados + entregues"
          icon={<CreditCard className="size-4" />}
        />
        <StatCard
          label="Receita bruta"
          value={formatMoney(stats.totalRevenue)}
          hint="Inclui pendentes"
          icon={<ShoppingBag className="size-4" />}
        />
      </div>

      {/* ─── Tabs de fulfillment ─── */}
      <div className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1">
        <StatusTab
          label="Pendentes"
          count={counts.pending}
          active={query.fulfillmentStatus === 'pending'}
          highlight
          onClick={() => setFulfillmentTab('pending')}
        />
        <StatusTab
          label="Em separação"
          count={counts.processing}
          active={query.fulfillmentStatus === 'processing'}
          onClick={() => setFulfillmentTab('processing')}
        />
        <StatusTab
          label="Enviados"
          count={counts.shipped}
          active={query.fulfillmentStatus === 'shipped'}
          onClick={() => setFulfillmentTab('shipped')}
        />
        <StatusTab
          label="Entregues"
          count={counts.delivered}
          active={query.fulfillmentStatus === 'delivered'}
          onClick={() => setFulfillmentTab('delivered')}
        />
        <StatusTab
          label="Cancelados"
          count={counts.cancelled}
          active={query.fulfillmentStatus === 'cancelled'}
          onClick={() => setFulfillmentTab('cancelled')}
        />
        <StatusTab
          label="Todos"
          count={totalAll}
          active={!query.fulfillmentStatus}
          onClick={() => setFulfillmentTab('')}
        />
      </div>

      {/* ─── Filtros ─── */}
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
              placeholder="Buscar por número, cliente, email ou CPF/CNPJ..."
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
              value={query.role || ''}
              onChange={(e) => setRoleFilter(e.target.value as '' | 'retail' | 'reseller')}
              className="border-brand-mist focus:border-brand-yellow text-brand-black w-full cursor-pointer appearance-none border bg-white px-3 py-2.5 text-sm transition-colors outline-none"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <option value="">Todos os tipos de cliente</option>
              <option value="retail">Apenas varejo (B2C)</option>
              <option value="reseller">Apenas revendedores (B2B)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Tabela ─── */}
      <AdminTable
        columns={columns}
        items={items}
        loading={loading}
        rowKey={(o) => o._id}
        sortKey={query.sort}
        sortOrder={query.order}
        onSortChange={handleSort}
        onRowClick={(o) => {
          window.location.href = `/admin/pedidos/${o._id}`;
        }}
        emptyMessage="Nenhum pedido encontrado"
        emptyHint={
          totalAll === 0
            ? 'Ainda não há pedidos no sistema. Eles aparecerão aqui quando o checkout entrar no ar.'
            : 'Ajuste os filtros ou volte para outras abas.'
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
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="bg-brand-white border-brand-mist border p-4"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <div className="text-brand-iron mb-2 flex items-center gap-2">
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
      {hint && (
        <div className="text-brand-steel mt-1.5 font-mono text-[10px] tracking-widest uppercase">
          {hint}
        </div>
      )}
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

function PaymentBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; class: string }> = {
    pending: {
      label: 'Aguardando',
      class: 'bg-brand-yellow text-brand-black',
    },
    processing: {
      label: 'Processando',
      class: 'bg-amber-100 text-amber-800 border border-amber-200',
    },
    paid: {
      label: 'Pago',
      class: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
    failed: {
      label: 'Falhou',
      class: 'bg-red-100 text-red-800 border border-red-200',
    },
    refunded: {
      label: 'Estornado',
      class: 'bg-brand-snow text-brand-iron border border-brand-mist',
    },
    chargeback: {
      label: 'Chargeback',
      class: 'bg-red-100 text-red-800 border border-red-200',
    },
  };
  const cfg = config[status] ?? config.pending;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase ${cfg.class}`}
    >
      {cfg.label}
    </span>
  );
}

function FulfillmentBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; class: string; icon: typeof Clock }> = {
    pending: {
      label: 'Pendente',
      class: 'bg-brand-yellow text-brand-black',
      icon: Clock,
    },
    processing: {
      label: 'Em separação',
      class: 'bg-amber-100 text-amber-800 border border-amber-200',
      icon: Package,
    },
    shipped: {
      label: 'Enviado',
      class: 'bg-blue-100 text-blue-800 border border-blue-200',
      icon: Truck,
    },
    delivered: {
      label: 'Entregue',
      class: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      icon: CheckCircle2,
    },
    cancelled: {
      label: 'Cancelado',
      class: 'bg-red-100 text-red-800 border border-red-200',
      icon: XCircle,
    },
    returned: {
      label: 'Devolvido',
      class: 'bg-brand-snow text-brand-iron border border-brand-mist',
      icon: AlertCircle,
    },
  };
  const cfg = config[status] ?? config.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase ${cfg.class}`}
    >
      <Icon className="size-2.5" strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

function paymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    credit_card: 'Cartão',
    pix: 'PIX',
    boleto: 'Boleto',
    bank_transfer: 'TED',
  };
  return labels[method] ?? method;
}
