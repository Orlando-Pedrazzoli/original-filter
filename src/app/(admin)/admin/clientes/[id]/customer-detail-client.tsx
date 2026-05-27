/* ══════════════════════════════════════════
   CustomerDetailClient — Original Filter Admin
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User as UserIcon,
  Briefcase,
  Mail,
  Phone,
  Building2,
  MapPin,
  ShoppingBag,
  Calendar,
  Loader2,
  Settings,
  Check,
  X,
  AlertCircle,
  ChevronRight,
  Edit2,
  Award,
  Power,
  Star,
  Home,
  CreditCard,
  Package,
  ClipboardList,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { useAdminToast } from '@/components/admin/admin-toast';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

type Customer = Record<string, any>;
type OrderItem = Record<string, any>;
type Stats = {
  totalOrders: number;
  totalPaid: number;
  paidOrders: number;
  totalDiscount: number;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
};

const TIER_OPTIONS: { value: 0 | 5 | 10 | 15 | 20; label: string; hint: string }[] = [
  { value: 0, label: 'Sem desconto', hint: 'Sem benefício B2B' },
  { value: 5, label: '5% off', hint: 'Pequeno volume / oficina' },
  { value: 10, label: '10% off', hint: 'Volume médio / atacado' },
  { value: 15, label: '15% off', hint: 'Distribuidora' },
  { value: 20, label: '20% off', hint: 'Parceiro estratégico' },
];

function formatMoney(value: number): string {
  return (value ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatCnpj(cnpj?: string): string {
  if (!cnpj) return '';
  const d = cnpj.replace(/\D/g, '');
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function formatCpf(cpf?: string): string {
  if (!cpf) return '';
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

interface CustomerDetailClientProps {
  customer: Customer;
  orders: OrderItem[];
  stats: Stats;
}

export function CustomerDetailClient({
  customer: initialCustomer,
  orders,
  stats,
}: CustomerDetailClientProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [editTierOpen, setEditTierOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [toggleActiveOpen, setToggleActiveOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isReseller = customer.role === 'reseller';
  const tier = customer.discountTier ?? 0;
  const isActive = customer.isActive ?? true;

  async function handleToggleActive() {
    setLoading(true);
    try {
      const result = await adminApi.customers.update(customer._id, {
        isActive: !isActive,
      });
      setCustomer((c: Customer) => ({ ...c, isActive: result.customer.isActive }));
      toast.success(result.customer.isActive ? 'Conta reativada' : 'Conta desativada');
      setToggleActiveOpen(false);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message || 'Erro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/clientes"
          className="text-brand-iron hover:text-brand-yellow-deep mb-3 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase transition"
        >
          <ArrowLeft className="size-3" />
          Voltar para clientes
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className={`font-display inline-flex size-14 shrink-0 items-center justify-center text-xl font-black ${
                isActive ? 'bg-brand-black text-brand-yellow' : 'bg-brand-snow text-brand-mist'
              }`}
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              {(customer.name || customer.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                {isReseller ? (
                  <span className="bg-brand-yellow text-brand-black inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
                    <Briefcase className="size-2.5" strokeWidth={3} />
                    Revendedor B2B
                  </span>
                ) : (
                  <span className="bg-brand-snow text-brand-iron border-brand-mist inline-flex items-center border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
                    Cliente varejo
                  </span>
                )}
                {tier > 0 && (
                  <span className="bg-brand-black text-brand-yellow inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
                    <Award className="size-2.5" strokeWidth={2.5} />
                    {tier}% off
                  </span>
                )}
                {!isActive && (
                  <span className="inline-flex items-center border border-red-200 bg-red-100 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-red-800 uppercase">
                    Inativo
                  </span>
                )}
              </div>
              <h1
                className="font-display text-brand-black truncate leading-tight font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                  letterSpacing: '-0.035em',
                }}
              >
                {customer.name || 'Sem nome'}
              </h1>
              <div className="text-brand-iron mt-0.5 font-mono text-xs">{customer.email}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isReseller && customer.company?.cnpj && (
              <button
                type="button"
                onClick={() => setPromoteOpen(true)}
                disabled={loading}
                className="font-display bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide uppercase transition disabled:opacity-50"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <Briefcase className="size-3.5" strokeWidth={2.5} />
                Promover para B2B
              </button>
            )}

            {isReseller && (
              <button
                type="button"
                onClick={() => setEditTierOpen(true)}
                disabled={loading}
                className="font-display bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide uppercase transition disabled:opacity-50"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <Award className="size-3.5" strokeWidth={2.5} />
                Editar tier
              </button>
            )}

            <button
              type="button"
              onClick={() => setToggleActiveOpen(true)}
              disabled={loading}
              className={`font-display inline-flex items-center gap-2 border px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition ${
                isActive
                  ? 'border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50'
                  : 'border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50'
              }`}
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <Power className="size-3.5" strokeWidth={2.5} />
              {isActive ? 'Desativar conta' : 'Reativar conta'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Pedidos"
          value={String(stats.totalOrders)}
          hint={stats.paidOrders > 0 ? `${stats.paidOrders} pagos` : undefined}
          icon={<ShoppingBag className="size-4" />}
        />
        <StatCard
          label="Total comprado"
          value={formatMoney(stats.totalPaid)}
          icon={<TrendingUp className="size-4" />}
          highlight
        />
        <StatCard
          label="Economia B2B"
          value={formatMoney(stats.totalDiscount)}
          icon={<Award className="size-4" />}
        />
        <StatCard
          label="Cliente desde"
          value={formatDateShort(customer.createdAt)}
          hint={stats.lastOrderAt ? `Última: ${formatDateShort(stats.lastOrderAt)}` : undefined}
          icon={<Calendar className="size-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna esquerda — Pedidos (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Pedidos */}
          <Section
            icon={<Package className="size-4" />}
            title={`Pedidos recentes (${orders.length})`}
          >
            {orders.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingBag className="text-brand-mist mx-auto mb-3 size-10" strokeWidth={1.5} />
                <p className="text-brand-iron text-sm">Este cliente ainda não fez nenhum pedido.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.map((o: OrderItem) => (
                  <OrderRow key={o._id} order={o} />
                ))}
                {orders.length === 50 && (
                  <div className="text-brand-steel pt-2 text-center font-mono text-[10px] tracking-widest uppercase">
                    Mostrando os 50 mais recentes
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* Endereços */}
          {customer.addresses && customer.addresses.length > 0 && (
            <Section
              icon={<MapPin className="size-4" />}
              title={`Endereços salvos (${customer.addresses.length})`}
            >
              <div className="space-y-2">
                {customer.addresses.map((addr: any, i: number) => (
                  <AddressRow key={i} address={addr} />
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Coluna direita — Dados (1/3) */}
        <div className="space-y-6">
          {/* Contato */}
          <Section icon={<UserIcon className="size-4" />} title="Contato">
            <div className="space-y-2.5">
              <DetailRow
                label="Email"
                value={customer.email}
                icon={<Mail className="size-3" />}
                href={`mailto:${customer.email}`}
                mono
              />
              <DetailRow
                label="Telefone"
                value={customer.phone}
                icon={<Phone className="size-3" />}
                href={`tel:${(customer.phone ?? '').replace(/\D/g, '')}`}
                mono
              />
              {customer.whatsapp && (
                <DetailRow
                  label="WhatsApp"
                  value={customer.whatsapp}
                  icon={<Phone className="size-3" />}
                  href={`https://wa.me/55${customer.whatsapp.replace(/\D/g, '')}`}
                  external
                  mono
                />
              )}
              {customer.cpf && <DetailRow label="CPF" value={formatCpf(customer.cpf)} mono />}
            </div>
          </Section>

          {/* Empresa */}
          {customer.company && (
            <Section icon={<Building2 className="size-4" />} title="Empresa">
              <div className="space-y-2.5">
                <DetailRow label="Razão social" value={customer.company.razaoSocial} />
                <DetailRow label="CNPJ" value={formatCnpj(customer.company.cnpj)} mono />
                {customer.company.nomeFantasia && (
                  <DetailRow label="Nome fantasia" value={customer.company.nomeFantasia} />
                )}
                {customer.company.inscricaoEstadual && (
                  <DetailRow label="IE" value={customer.company.inscricaoEstadual} mono />
                )}
              </div>
            </Section>
          )}

          {/* Sistema */}
          <Section icon={<Settings className="size-4" />} title="Sistema">
            <div className="space-y-2.5">
              <DetailRow label="ID" value={customer._id} mono />
              <DetailRow label="Criado em" value={formatDate(customer.createdAt)} />
              <DetailRow
                label="Último login"
                value={customer.lastLogin ? formatDate(customer.lastLogin) : 'Nunca'}
              />
              {customer.approvedFromApplication && (
                <DetailRow
                  label="Aprovação B2B"
                  value="Via formulário"
                  icon={<ClipboardList className="size-3" />}
                />
              )}
            </div>
          </Section>
        </div>
      </div>

      {/* Modais */}
      {editTierOpen && (
        <TierModal
          customer={customer}
          onClose={() => setEditTierOpen(false)}
          onSaved={(newTier) => {
            setCustomer((c: Customer) => ({ ...c, discountTier: newTier }));
            setEditTierOpen(false);
            router.refresh();
          }}
        />
      )}

      {promoteOpen && (
        <PromoteModal
          customer={customer}
          onClose={() => setPromoteOpen(false)}
          onSaved={(newTier) => {
            setCustomer((c: Customer) => ({
              ...c,
              role: 'reseller',
              discountTier: newTier,
            }));
            setPromoteOpen(false);
            router.refresh();
          }}
        />
      )}

      <ConfirmDialog
        open={toggleActiveOpen}
        onClose={() => setToggleActiveOpen(false)}
        onConfirm={handleToggleActive}
        title={isActive ? 'Desativar conta?' : 'Reativar conta?'}
        description={
          isActive ? (
            <>
              O cliente <strong>{customer.name}</strong> NÃO conseguirá mais fazer login nem
              realizar compras. Os dados são preservados — você pode reativar a qualquer momento.
            </>
          ) : (
            <>
              O cliente <strong>{customer.name}</strong> voltará a poder fazer login e compras
              normalmente.
            </>
          )
        }
        confirmLabel={isActive ? 'Sim, desativar' : 'Sim, reativar'}
        variant={isActive ? 'danger' : 'default'}
        loading={loading}
      />
    </div>
  );
}

// ═══════════════════════════════════════════
//   Sub-componentes
// ═══════════════════════════════════════════

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-brand-white border-brand-mist relative border p-5 md:p-6"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <div className="bg-brand-yellow absolute top-5 bottom-5 left-0 w-1 md:top-6 md:bottom-6" />
      <div className="pl-4">
        <div className="text-brand-iron mb-4 flex items-center gap-2">
          {icon}
          <h2 className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  hint?: string;
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
        className="font-display text-brand-black leading-none font-black tracking-tight tabular-nums"
        style={{
          fontSize: 'clamp(1.125rem, 2.2vw, 1.5rem)',
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

function DetailRow({
  label,
  value,
  icon,
  mono,
  href,
  external,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  mono?: boolean;
  href?: string;
  external?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-1 md:grid-cols-12 md:gap-3">
      <div className="text-brand-iron flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase md:col-span-5">
        {icon}
        {label}
      </div>
      <div className="min-w-0 md:col-span-7">
        {href ? (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="text-brand-black hover:text-brand-yellow-deep inline-flex items-center gap-1 truncate text-sm transition"
          >
            <span className={mono ? 'font-mono' : ''}>{value}</span>
            {external && <ExternalLink className="size-3" />}
          </a>
        ) : (
          <span className={`text-brand-black text-sm ${mono ? 'font-mono' : ''}`}>
            {value || '—'}
          </span>
        )}
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: OrderItem }) {
  const fulfillmentLabels: Record<string, { label: string; class: string }> = {
    pending: { label: 'Pendente', class: 'bg-brand-yellow text-brand-black' },
    processing: { label: 'Em separação', class: 'bg-amber-100 text-amber-800' },
    shipped: { label: 'Enviado', class: 'bg-blue-100 text-blue-800' },
    delivered: { label: 'Entregue', class: 'bg-emerald-100 text-emerald-800' },
    cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-800' },
    returned: { label: 'Devolvido', class: 'bg-brand-snow text-brand-iron' },
  };
  const cfg = fulfillmentLabels[order.fulfillmentStatus] ?? fulfillmentLabels.pending;

  return (
    <Link
      href={`/admin/pedidos/${order._id}`}
      className="group bg-brand-snow border-brand-mist hover:border-brand-iron flex items-center gap-3 border p-3 transition"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-brand-yellow-deep font-mono text-xs font-bold">
            {order.orderNumber}
          </span>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase ${cfg.class}`}
          >
            {cfg.label}
          </span>
          {order.paymentStatus === 'paid' && (
            <span className="inline-flex items-center border border-emerald-200 bg-emerald-100 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-emerald-800 uppercase">
              <Check className="size-2.5" strokeWidth={3} />
              Pago
            </span>
          )}
        </div>
        <div className="text-brand-iron font-mono text-[10px] tracking-widest uppercase">
          {formatDate(order.createdAt)}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="font-display text-brand-black font-bold">{formatMoney(order.total)}</div>
        {order.discountTotal > 0 && (
          <div className="text-brand-yellow-deep font-mono text-[10px]">
            −{formatMoney(order.discountTotal)} B2B
          </div>
        )}
      </div>

      <ChevronRight className="text-brand-mist group-hover:text-brand-yellow-deep size-4 transition" />
    </Link>
  );
}

function AddressRow({ address }: { address: any }) {
  const labelConfig: Record<string, { icon: typeof Home; class: string }> = {
    principal: { icon: Home, class: 'text-brand-yellow-deep' },
    entrega: { icon: Package, class: 'text-blue-700' },
    cobranca: { icon: CreditCard, class: 'text-purple-700' },
  };
  const cfg = labelConfig[address.label] ?? labelConfig.principal;
  const Icon = cfg.icon;

  return (
    <div
      className="bg-brand-snow border-brand-mist flex items-start gap-3 border p-3"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <Icon className={`mt-0.5 size-4 shrink-0 ${cfg.class}`} strokeWidth={2} />
      <div className="min-w-0 flex-1 text-sm">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-brand-iron font-mono text-[9px] font-bold tracking-widest uppercase">
            {address.label}
          </span>
          {address.isDefault && (
            <span className="bg-brand-yellow text-brand-black inline-flex items-center gap-0.5 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
              <Star className="size-2.5" strokeWidth={3} />
              Padrão
            </span>
          )}
        </div>
        <div className="text-brand-black">
          <strong>
            {address.logradouro}, {address.numero}
          </strong>
          {address.complemento && <span className="text-brand-iron"> · {address.complemento}</span>}
        </div>
        <div className="text-brand-iron text-xs">
          {address.bairro} · {address.cidade}/{address.uf}
        </div>
        <div className="text-brand-steel mt-0.5 font-mono text-xs">CEP {address.cep}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//   TierModal — Editar tier de reseller existente
// ═══════════════════════════════════════════

function TierModal({
  customer,
  onClose,
  onSaved,
}: {
  customer: Customer;
  onClose: () => void;
  onSaved: (newTier: number) => void;
}) {
  const { toast } = useAdminToast();
  const [selectedTier, setSelectedTier] = useState<0 | 5 | 10 | 15 | 20>(
    (customer.discountTier ?? 0) as 0 | 5 | 10 | 15 | 20,
  );
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (selectedTier === customer.discountTier) {
      onClose();
      return;
    }
    setLoading(true);
    try {
      const result = await adminApi.customers.update(customer._id, {
        discountTier: selectedTier,
      });
      toast.success(`Tier atualizado para ${selectedTier}%`);
      onSaved(result.customer.discountTier);
    } catch (err) {
      toast.error((err as Error).message || 'Erro');
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-brand-white relative my-8 w-full max-w-md p-6"
        style={{ borderRadius: 'var(--radius-edge)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="text-brand-iron hover:text-brand-black absolute top-3 right-3 inline-flex size-7 items-center justify-center transition disabled:opacity-50"
        >
          <X className="size-4" />
        </button>

        <div className="mb-5 flex items-start gap-3">
          <div className="bg-brand-yellow text-brand-black inline-flex size-10 items-center justify-center">
            <Award className="size-5" strokeWidth={2.5} />
          </div>
          <div>
            <h2
              className="font-display text-brand-black leading-tight font-black"
              style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)' }}
            >
              Tier de desconto B2B
            </h2>
            <p className="text-brand-iron text-sm">
              {customer.company?.razaoSocial ?? customer.name}
            </p>
          </div>
        </div>

        <div className="mb-5 space-y-2">
          {TIER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedTier(opt.value)}
              disabled={loading}
              className={`flex w-full items-center justify-between gap-3 border p-3 text-left transition disabled:opacity-50 ${
                selectedTier === opt.value
                  ? 'bg-brand-yellow/10 border-brand-yellow'
                  : 'bg-brand-white border-brand-mist hover:border-brand-iron'
              }`}
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`inline-flex size-5 shrink-0 items-center justify-center border-2 ${
                    selectedTier === opt.value
                      ? 'border-brand-yellow-deep bg-brand-yellow'
                      : 'border-brand-mist'
                  }`}
                >
                  {selectedTier === opt.value && (
                    <Check className="text-brand-black size-3" strokeWidth={3} />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="font-display text-brand-black font-bold">{opt.label}</div>
                  <div className="text-brand-iron font-mono text-[10px] tracking-widest uppercase">
                    {opt.hint}
                  </div>
                </div>
              </div>
              <div
                className={`font-display shrink-0 font-black tabular-nums ${
                  selectedTier === opt.value ? 'text-brand-yellow-deep' : 'text-brand-mist'
                }`}
                style={{ fontSize: 'clamp(1.125rem, 1.8vw, 1.375rem)' }}
              >
                {opt.value}%
              </div>
            </button>
          ))}
        </div>

        {selectedTier === 0 && (
          <div
            className="mb-4 flex items-start gap-2 border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            <div>
              Tier 0% mantém o cliente como revendedor mas sem benefício. Se quiser remover do
              programa B2B, use o botão &ldquo;Desativar conta&rdquo; ou entre em contato com
              suporte para demoção.
            </div>
          </div>
        )}

        <div className="border-brand-mist flex items-center justify-end gap-2 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="font-display text-brand-iron hover:text-brand-black px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright font-display inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition disabled:cursor-wait disabled:opacity-50"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" strokeWidth={3} />
            )}
            Salvar tier {selectedTier}%
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//   PromoteModal — Promover varejo para B2B
// ═══════════════════════════════════════════

function PromoteModal({
  customer,
  onClose,
  onSaved,
}: {
  customer: Customer;
  onClose: () => void;
  onSaved: (newTier: number) => void;
}) {
  const { toast } = useAdminToast();
  const [selectedTier, setSelectedTier] = useState<0 | 5 | 10 | 15 | 20>(10);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      // Promove + define tier numa única chamada
      const result = await adminApi.customers.update(customer._id, {
        role: 'reseller',
      });
      // Em seguida atribui o tier (a API valida)
      if (selectedTier > 0) {
        await adminApi.customers.update(customer._id, {
          discountTier: selectedTier,
        });
      }
      toast.success(
        selectedTier > 0 ? `Promovido para B2B com ${selectedTier}% off` : 'Promovido para B2B',
      );
      onSaved(selectedTier);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao promover');
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-brand-white relative my-8 w-full max-w-md p-6"
        style={{ borderRadius: 'var(--radius-edge)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="text-brand-iron hover:text-brand-black absolute top-3 right-3 inline-flex size-7 items-center justify-center transition disabled:opacity-50"
        >
          <X className="size-4" />
        </button>

        <div className="mb-5 flex items-start gap-3">
          <div className="bg-brand-yellow text-brand-black inline-flex size-10 items-center justify-center">
            <Briefcase className="size-5" strokeWidth={2.5} />
          </div>
          <div>
            <h2
              className="font-display text-brand-black leading-tight font-black"
              style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)' }}
            >
              Promover para B2B
            </h2>
            <p className="text-brand-iron text-sm">
              {customer.company?.razaoSocial ?? customer.name}
            </p>
          </div>
        </div>

        <div
          className="bg-brand-snow border-brand-mist text-brand-iron mb-4 flex items-start gap-2 border p-3 text-xs"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <div>
            Este cliente já tem dados de empresa cadastrados (CNPJ:{' '}
            {formatCnpj(customer.company?.cnpj)}). Defina o tier B2B inicial.
          </div>
        </div>

        <div className="mb-5 space-y-2">
          {TIER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedTier(opt.value)}
              disabled={loading}
              className={`flex w-full items-center justify-between gap-3 border p-3 text-left transition disabled:opacity-50 ${
                selectedTier === opt.value
                  ? 'bg-brand-yellow/10 border-brand-yellow'
                  : 'bg-brand-white border-brand-mist hover:border-brand-iron'
              }`}
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`inline-flex size-5 shrink-0 items-center justify-center border-2 ${
                    selectedTier === opt.value
                      ? 'border-brand-yellow-deep bg-brand-yellow'
                      : 'border-brand-mist'
                  }`}
                >
                  {selectedTier === opt.value && (
                    <Check className="text-brand-black size-3" strokeWidth={3} />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="font-display text-brand-black font-bold">{opt.label}</div>
                  <div className="text-brand-iron font-mono text-[10px] tracking-widest uppercase">
                    {opt.hint}
                  </div>
                </div>
              </div>
              <div
                className={`font-display shrink-0 font-black tabular-nums ${
                  selectedTier === opt.value ? 'text-brand-yellow-deep' : 'text-brand-mist'
                }`}
                style={{ fontSize: 'clamp(1.125rem, 1.8vw, 1.375rem)' }}
              >
                {opt.value}%
              </div>
            </button>
          ))}
        </div>

        <div className="border-brand-mist flex items-center justify-end gap-2 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="font-display text-brand-iron hover:text-brand-black px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright font-display inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition disabled:cursor-wait disabled:opacity-50"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Briefcase className="size-3.5" strokeWidth={2.5} />
            )}
            Confirmar promoção
          </button>
        </div>
      </div>
    </div>
  );
}
