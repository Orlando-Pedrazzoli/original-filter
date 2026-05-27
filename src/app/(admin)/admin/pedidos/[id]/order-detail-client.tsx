/* ══════════════════════════════════════════
   OrderDetailClient — Original Filter Admin
   ──────────────────────────────────────────
   Renderiza todo o detalhe do pedido + ações.
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  CreditCard,
  MapPin,
  User as UserIcon,
  Briefcase,
  Phone,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Save,
  Loader2,
  X,
  ChevronRight,
  Calendar,
  DollarSign,
  FileText,
  ImageOff,
} from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { useAdminToast } from '@/components/admin/admin-toast';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

// Types loose para simplificar (vem do MongoDB serializado)
type OrderDetail = Record<string, any>;

const FULFILLMENT_STEPS = [
  { key: 'pending', label: 'Pendente', icon: Clock },
  { key: 'processing', label: 'Em separação', icon: Package },
  { key: 'shipped', label: 'Enviado', icon: Truck },
  { key: 'delivered', label: 'Entregue', icon: CheckCircle2 },
];

function formatMoney(value: number): string {
  return (value ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCnpjCpf(doc: string, type: string): string {
  const d = (doc ?? '').replace(/\D/g, '');
  if (type === 'cpf' && d.length === 11) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  if (type === 'cnpj' && d.length === 14) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  }
  return doc;
}

export function OrderDetailClient({ order: initialOrder }: { order: OrderDetail }) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [order, setOrder] = useState<OrderDetail>(initialOrder);
  const [loading, setLoading] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  function copy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }

  async function advanceFulfillment(next: string) {
    setLoading(true);
    try {
      const result = await adminApi.orders.updateFulfillment(
        order._id,
        next as 'pending' | 'processing' | 'shipped' | 'delivered',
      );
      setOrder((o: OrderDetail) => ({
        ...o,
        fulfillmentStatus: result.order.fulfillmentStatus,
      }));
      toast.success(`Status atualizado para: ${next}`);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao atualizar');
    } finally {
      setLoading(false);
    }
  }

  const customer = order.customerSnapshot ?? {};
  const isReseller = customer.role === 'reseller';
  const fulfillmentStatus = order.fulfillmentStatus ?? 'pending';
  const paymentStatus = order.paymentStatus ?? 'pending';
  const items = order.items ?? [];
  const shippingAddress = order.shipping?.address;

  const currentStepIndex = FULFILLMENT_STEPS.findIndex((s) => s.key === fulfillmentStatus);
  const isCancelled = fulfillmentStatus === 'cancelled';
  const isPaid = paymentStatus === 'paid';

  // Próximo step possível
  let nextStep: { key: string; label: string } | null = null;
  if (!isCancelled && currentStepIndex >= 0 && currentStepIndex < FULFILLMENT_STEPS.length - 1) {
    nextStep = FULFILLMENT_STEPS[currentStepIndex + 1];
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/pedidos"
          className="text-brand-iron hover:text-brand-yellow-deep mb-3 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase transition"
        >
          <ArrowLeft className="size-3" />
          Voltar para pedidos
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <FulfillmentBadge status={fulfillmentStatus} />
              <PaymentBadge status={paymentStatus} />
              <span className="text-brand-iron flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase">
                <Calendar className="size-3" />
                {formatDate(order.createdAt)}
              </span>
            </div>
            <h1
              className="font-display text-brand-black leading-tight font-black tracking-tight"
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                letterSpacing: '-0.035em',
              }}
            >
              Pedido <span className="text-brand-yellow-deep">{order.orderNumber}</span>
            </h1>
          </div>

          {/* Ações principais */}
          <div className="flex flex-wrap items-center gap-2">
            {!isPaid && !isCancelled && (
              <button
                type="button"
                onClick={() => setMarkPaidOpen(true)}
                disabled={loading}
                className="font-display inline-flex items-center gap-2 bg-emerald-600 px-4 py-2.5 text-xs font-bold tracking-wide text-white uppercase transition hover:bg-emerald-700 disabled:opacity-50"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <Check className="size-3.5" strokeWidth={3} />
                Marcar pago
              </button>
            )}

            {nextStep && isPaid && (
              <button
                type="button"
                onClick={() => advanceFulfillment(nextStep.key)}
                disabled={loading}
                className="font-display bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide uppercase transition disabled:opacity-50"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ChevronRight className="size-3.5" strokeWidth={2.5} />
                )}
                Avançar para: {nextStep.label}
              </button>
            )}

            {(fulfillmentStatus === 'processing' || fulfillmentStatus === 'shipped') && (
              <button
                type="button"
                onClick={() => setTrackingModalOpen(true)}
                disabled={loading}
                className="font-display text-brand-iron hover:text-brand-black border-brand-mist hover:border-brand-iron inline-flex items-center gap-2 border px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <Truck className="size-3.5" />
                {order.shipping?.trackingCode ? 'Atualizar rastreio' : 'Adicionar rastreio'}
              </button>
            )}

            {!isCancelled && fulfillmentStatus !== 'delivered' && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                disabled={loading}
                className="font-display inline-flex items-center gap-2 border border-red-200 px-4 py-2.5 text-xs font-semibold tracking-wide text-red-600 uppercase transition hover:border-red-300 hover:bg-red-50"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <XCircle className="size-3.5" />
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <Section icon={<Package className="size-4" />} title="Status">
          <FulfillmentTimeline currentStatus={fulfillmentStatus} />
        </Section>
      )}

      {/* Cancelado: aviso */}
      {isCancelled && (
        <div
          className="flex items-start gap-3 border border-red-200 bg-red-50 p-4"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <XCircle className="mt-0.5 size-5 shrink-0 text-red-700" strokeWidth={2.5} />
          <div className="flex-1">
            <div className="font-display text-brand-black font-bold">Pedido cancelado</div>
            <div className="text-brand-iron mt-1 font-mono text-[10px] tracking-widest uppercase">
              {formatDate(order.cancelledAt)}
            </div>
            {order.cancellationReason && (
              <div className="text-brand-iron mt-2 text-sm italic">
                Motivo: &ldquo;{order.cancellationReason}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna esquerda — Itens + Cliente + Entrega (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* ─── ITENS ─── */}
          <Section icon={<Package className="size-4" />} title={`Itens (${items.length})`}>
            <div className="space-y-2">
              {items.map((item: any, i: number) => (
                <OrderItem key={i} item={item} />
              ))}
            </div>
          </Section>

          {/* ─── CLIENTE ─── */}
          <Section
            icon={isReseller ? <Briefcase className="size-4" /> : <UserIcon className="size-4" />}
            title={isReseller ? 'Cliente B2B' : 'Cliente'}
          >
            <div className="space-y-2.5">
              <DetailRow label="Nome" value={customer.name} />
              <DetailRow
                label="Email"
                value={customer.email}
                href={`mailto:${customer.email}`}
                icon={<Mail className="size-3" />}
                mono
                onCopy={() => copy(customer.email, 'email')}
                copied={copiedField === 'email'}
              />
              <DetailRow
                label="Telefone"
                value={customer.phone}
                href={`tel:${(customer.phone ?? '').replace(/\D/g, '')}`}
                icon={<Phone className="size-3" />}
                mono
              />
              <DetailRow
                label={customer.documentType === 'cnpj' ? 'CNPJ' : 'CPF'}
                value={formatCnpjCpf(customer.document, customer.documentType)}
                mono
              />
              {isReseller && customer.discountTier > 0 && (
                <DetailRow
                  label="Tier B2B"
                  value={
                    <span className="bg-brand-yellow text-brand-black inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
                      {customer.discountTier}% off
                    </span>
                  }
                />
              )}
            </div>
          </Section>

          {/* ─── ENTREGA ─── */}
          {shippingAddress && (
            <Section icon={<MapPin className="size-4" />} title="Entrega">
              <div className="space-y-2.5">
                <div>
                  <div className="text-brand-iron mb-1 font-mono text-[10px] tracking-widest uppercase">
                    Endereço
                  </div>
                  <div className="text-brand-black text-sm">
                    <strong>
                      {shippingAddress.logradouro}, {shippingAddress.numero}
                    </strong>
                    {shippingAddress.complemento && (
                      <span className="text-brand-iron"> · {shippingAddress.complemento}</span>
                    )}
                  </div>
                  <div className="text-brand-iron text-sm">
                    {shippingAddress.bairro} · {shippingAddress.cidade}/{shippingAddress.uf}
                  </div>
                  <div className="text-brand-steel mt-0.5 font-mono text-xs">
                    CEP {shippingAddress.cep}
                  </div>
                </div>

                {order.shipping?.method && (
                  <DetailRow
                    label="Modalidade"
                    value={`${order.shipping.method} · ${order.shipping.provider ?? ''}`}
                  />
                )}

                {order.shipping?.estimatedDays && (
                  <DetailRow
                    label="Prazo estimado"
                    value={`${order.shipping.estimatedDays} dias úteis`}
                  />
                )}

                {order.shipping?.trackingCode && (
                  <DetailRow
                    label="Código de rastreio"
                    value={order.shipping.trackingCode}
                    href={order.shipping.trackingUrl}
                    external={!!order.shipping.trackingUrl}
                    mono
                    onCopy={() => copy(order.shipping.trackingCode, 'tracking')}
                    copied={copiedField === 'tracking'}
                  />
                )}

                {order.shipping?.shippedAt && (
                  <DetailRow label="Enviado em" value={formatDate(order.shipping.shippedAt)} />
                )}

                {order.shipping?.deliveredAt && (
                  <DetailRow label="Entregue em" value={formatDate(order.shipping.deliveredAt)} />
                )}
              </div>
            </Section>
          )}

          {/* ─── NOTAS ─── */}
          {(order.notes || order.customerNote) && (
            <Section icon={<FileText className="size-4" />} title="Notas">
              {order.customerNote && (
                <div className="mb-3">
                  <div className="text-brand-iron mb-1 font-mono text-[10px] tracking-widest uppercase">
                    Observação do cliente
                  </div>
                  <div
                    className="bg-brand-snow border-brand-mist text-brand-black border p-3 text-sm whitespace-pre-wrap"
                    style={{ borderRadius: 'var(--radius-edge)' }}
                  >
                    {order.customerNote}
                  </div>
                </div>
              )}
              {order.notes && (
                <div>
                  <div className="text-brand-iron mb-1 font-mono text-[10px] tracking-widest uppercase">
                    Notas internas
                  </div>
                  <div
                    className="border border-amber-200 bg-amber-50 p-3 font-mono text-xs whitespace-pre-wrap text-amber-900"
                    style={{ borderRadius: 'var(--radius-edge)' }}
                  >
                    {order.notes}
                  </div>
                </div>
              )}
            </Section>
          )}
        </div>

        {/* Coluna direita — Resumo + Pagamento (1/3) */}
        <div className="space-y-6">
          {/* ─── RESUMO FINANCEIRO ─── */}
          <Section icon={<DollarSign className="size-4" />} title="Resumo">
            <div className="space-y-1.5">
              <SummaryRow label="Subtotal" value={formatMoney(order.subtotal)} />
              {order.discountTotal > 0 && (
                <SummaryRow
                  label="Desconto B2B"
                  value={`−${formatMoney(order.discountTotal)}`}
                  accent
                />
              )}
              <SummaryRow
                label="Frete"
                value={order.shippingCost > 0 ? formatMoney(order.shippingCost) : 'Grátis'}
              />
              <div className="border-brand-mist border-t pt-2">
                <SummaryRow label="Total" value={formatMoney(order.total)} bold />
              </div>
            </div>
          </Section>

          {/* ─── PAGAMENTO ─── */}
          <Section icon={<CreditCard className="size-4" />} title="Pagamento">
            <div className="space-y-2.5">
              <DetailRow label="Método" value={paymentMethodLabel(order.payment?.method)} />
              <DetailRow label="Status" value={<PaymentBadge status={paymentStatus} />} />
              {order.payment?.provider && (
                <DetailRow label="Gateway" value={order.payment.provider} mono />
              )}
              {order.payment?.installments && (
                <DetailRow label="Parcelas" value={`${order.payment.installments}x`} mono />
              )}
              {order.payment?.cardBrand && order.payment?.cardLastFour && (
                <DetailRow
                  label="Cartão"
                  value={`${order.payment.cardBrand} · final ${order.payment.cardLastFour}`}
                  mono
                />
              )}
              {order.payment?.paidAt && (
                <DetailRow label="Pago em" value={formatDate(order.payment.paidAt)} />
              )}
              {order.payment?.externalId && (
                <DetailRow
                  label="ID transação"
                  value={order.payment.externalId}
                  mono
                  onCopy={() => copy(order.payment.externalId, 'txnid')}
                  copied={copiedField === 'txnid'}
                />
              )}
            </div>
          </Section>
        </div>
      </div>

      {/* Modais */}
      {trackingModalOpen && (
        <TrackingModal
          order={order}
          onClose={() => setTrackingModalOpen(false)}
          onSaved={() => {
            setTrackingModalOpen(false);
            router.refresh();
          }}
        />
      )}

      <ConfirmDialog
        open={markPaidOpen}
        onClose={() => setMarkPaidOpen(false)}
        onConfirm={async () => {
          setLoading(true);
          try {
            await adminApi.orders.markPaidManually(order._id);
            toast.success('Pedido marcado como pago');
            router.refresh();
            setMarkPaidOpen(false);
          } catch (err) {
            toast.error((err as Error).message || 'Erro');
          } finally {
            setLoading(false);
          }
        }}
        title="Marcar pedido como pago?"
        description={
          <>
            Use apenas se confirmou o pagamento <strong>fora do sistema</strong> (PIX direto,
            transferência, etc). O status do pedido vai para <strong>pago</strong> e{' '}
            <strong>em separação</strong>.
          </>
        }
        confirmLabel="Sim, marcar como pago"
        variant="warning"
        loading={loading}
      />

      <CancelModal
        open={cancelModalOpen}
        orderId={order._id}
        orderNumber={order.orderNumber}
        onClose={() => setCancelModalOpen(false)}
        onSaved={() => {
          setCancelModalOpen(false);
          router.refresh();
        }}
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

function DetailRow({
  label,
  value,
  icon,
  mono,
  href,
  external,
  onCopy,
  copied,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  mono?: boolean;
  href?: string;
  external?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  const content =
    typeof value === 'string' ? <span className={mono ? 'font-mono' : ''}>{value}</span> : value;

  return (
    <div className="grid grid-cols-1 items-start gap-1 md:grid-cols-12 md:gap-3">
      <div className="text-brand-iron flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase md:col-span-4">
        {icon}
        {label}
      </div>
      <div className="flex min-w-0 items-center gap-2 md:col-span-8">
        {href ? (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="text-brand-black hover:text-brand-yellow-deep inline-flex items-center gap-1 truncate text-sm transition"
          >
            {content}
            {external && <ExternalLink className="size-3" />}
          </a>
        ) : (
          <span className="text-brand-black truncate text-sm">{content}</span>
        )}
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="text-brand-mist hover:text-brand-iron inline-flex size-6 shrink-0 items-center justify-center transition"
            title="Copiar"
          >
            {copied ? (
              <Check className="size-3 text-emerald-600" strokeWidth={3} />
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  accent,
  bold,
}: {
  label: string;
  value: string;
  accent?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span
        className={`text-sm ${bold ? 'font-display text-brand-black font-bold' : 'text-brand-iron'}`}
      >
        {label}
      </span>
      <span
        className={`font-mono ${bold ? 'text-brand-black text-base font-bold' : 'text-sm'} ${
          accent ? 'text-brand-yellow-deep' : 'text-brand-black'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function OrderItem({ item }: { item: any }) {
  return (
    <div
      className="bg-brand-snow border-brand-mist flex items-start gap-3 border p-3"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <div className="bg-brand-white border-brand-mist relative flex size-14 shrink-0 items-center justify-center overflow-hidden border">
        {item.productImage ? (
          <Image
            src={item.productImage}
            alt={item.productTitle}
            fill
            sizes="56px"
            className="object-contain p-1"
          />
        ) : (
          <ImageOff className="text-brand-mist size-4" strokeWidth={1.5} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={`/produtos/${item.productSlug}`}
          target="_blank"
          className="font-display text-brand-black hover:text-brand-yellow-deep line-clamp-2 text-sm leading-tight font-bold transition"
        >
          {item.productTitle}
        </Link>
        <div className="text-brand-iron mt-0.5 font-mono text-[10px]">{item.productSku}</div>
        <div className="mt-2 flex items-baseline gap-3 text-xs">
          <span className="text-brand-iron">
            <strong className="text-brand-black">{item.quantity}x</strong>{' '}
            {formatMoney(item.unitFinalPrice)}
          </span>
          {item.appliedDiscountTier > 0 && (
            <span className="text-brand-steel line-through">
              {formatMoney(item.unitRetailPrice)}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="font-display text-brand-black font-bold">{formatMoney(item.lineTotal)}</div>
        {item.appliedDiscountTier > 0 && (
          <div className="text-brand-yellow-deep font-mono text-[9px] tracking-widest uppercase">
            {item.appliedDiscountTier}% off
          </div>
        )}
      </div>
    </div>
  );
}

function FulfillmentTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = FULFILLMENT_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="relative">
      {/* Linha */}
      <div className="bg-brand-mist absolute top-5 right-0 left-0 h-px" />
      <div
        className="bg-brand-yellow absolute top-5 left-0 h-px transition-all duration-500"
        style={{ width: `${(currentIndex / (FULFILLMENT_STEPS.length - 1)) * 100}%` }}
      />

      {/* Steps */}
      <div className="relative grid grid-cols-4 gap-2">
        {FULFILLMENT_STEPS.map((step, i) => {
          const Icon = step.icon;
          const completed = i <= currentIndex;
          const active = i === currentIndex;
          return (
            <div key={step.key} className="flex flex-col items-center">
              <div
                className={`inline-flex size-10 items-center justify-center transition-all ${
                  active
                    ? 'bg-brand-yellow text-brand-black scale-110'
                    : completed
                      ? 'bg-brand-black text-brand-yellow'
                      : 'bg-brand-snow text-brand-mist border-brand-mist border'
                }`}
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <Icon className="size-4" strokeWidth={2.5} />
              </div>
              <div
                className={`mt-2 text-center font-mono text-[10px] tracking-widest uppercase ${
                  active
                    ? 'text-brand-black font-bold'
                    : completed
                      ? 'text-brand-iron'
                      : 'text-brand-mist'
                }`}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; class: string }> = {
    pending: { label: 'Aguardando pagto', class: 'bg-brand-yellow text-brand-black' },
    processing: {
      label: 'Processando',
      class: 'bg-amber-100 text-amber-800 border border-amber-200',
    },
    paid: { label: 'Pago', class: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
    failed: { label: 'Falhou', class: 'bg-red-100 text-red-800 border border-red-200' },
    refunded: {
      label: 'Estornado',
      class: 'bg-brand-snow text-brand-iron border border-brand-mist',
    },
    chargeback: { label: 'Chargeback', class: 'bg-red-100 text-red-800 border border-red-200' },
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
    pending: { label: 'Pendente', class: 'bg-brand-yellow text-brand-black', icon: Clock },
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

function paymentMethodLabel(method?: string): string {
  if (!method) return '—';
  const labels: Record<string, string> = {
    credit_card: 'Cartão de crédito',
    pix: 'PIX',
    boleto: 'Boleto',
    bank_transfer: 'Transferência',
  };
  return labels[method] ?? method;
}

// ═══════════════════════════════════════════
//   TrackingModal
// ═══════════════════════════════════════════

function TrackingModal({
  order,
  onClose,
  onSaved,
}: {
  order: OrderDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useAdminToast();
  const [trackingCode, setTrackingCode] = useState(order.shipping?.trackingCode ?? '');
  const [trackingUrl, setTrackingUrl] = useState(order.shipping?.trackingUrl ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (trackingCode.trim().length < 3) {
      toast.error('Código de rastreio inválido');
      return;
    }
    setLoading(true);
    try {
      await adminApi.orders.addTracking(
        order._id,
        trackingCode.trim(),
        trackingUrl.trim() || undefined,
      );
      toast.success('Rastreio salvo. Pedido marcado como enviado.');
      onSaved();
    } catch (err) {
      toast.error((err as Error).message || 'Erro');
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-brand-white relative w-full max-w-md p-6"
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
          <div className="bg-brand-yellow/10 text-brand-yellow-deep inline-flex size-10 items-center justify-center">
            <Truck className="size-5" strokeWidth={2} />
          </div>
          <div>
            <h2
              className="font-display text-brand-black leading-tight font-black"
              style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)' }}
            >
              Código de rastreio
            </h2>
            <p className="text-brand-iron text-sm">
              Insira o código fornecido pela transportadora.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase">
              Código <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              placeholder="BR123456789..."
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white px-3 py-2.5 font-mono text-sm transition-colors outline-none"
              style={{ borderRadius: 'var(--radius-edge)' }}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase">
              URL de rastreio (opcional)
            </label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://rastreamento.correios.com.br/..."
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white px-3 py-2.5 font-mono text-sm transition-colors outline-none"
              style={{ borderRadius: 'var(--radius-edge)' }}
              disabled={loading}
            />
            <div className="text-brand-steel mt-1 font-mono text-[10px] tracking-widest uppercase">
              Para o cliente clicar e acompanhar
            </div>
          </div>
        </div>

        <div className="border-brand-mist mt-5 flex items-center justify-end gap-2 border-t pt-4">
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
            disabled={loading || trackingCode.trim().length < 3}
            className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition disabled:cursor-wait disabled:opacity-50"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" strokeWidth={2.5} />
            )}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//   CancelModal
// ═══════════════════════════════════════════

function CancelModal({
  open,
  orderId,
  orderNumber,
  onClose,
  onSaved,
}: {
  open: boolean;
  orderId: string;
  orderNumber: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useAdminToast();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleCancel() {
    if (reason.trim().length < 3) {
      toast.error('Informe o motivo do cancelamento');
      return;
    }
    setLoading(true);
    try {
      await adminApi.orders.cancel(orderId, reason.trim());
      toast.success('Pedido cancelado');
      onSaved();
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao cancelar');
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-brand-white relative w-full max-w-md p-6"
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
          <div className="inline-flex size-10 items-center justify-center bg-red-100 text-red-700">
            <XCircle className="size-5" strokeWidth={2} />
          </div>
          <div>
            <h2
              className="font-display text-brand-black leading-tight font-black"
              style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)' }}
            >
              Cancelar {orderNumber}?
            </h2>
            <p className="text-brand-iron text-sm">Esta ação não pode ser desfeita.</p>
          </div>
        </div>

        <div>
          <label className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase">
            Motivo do cancelamento <span className="text-red-600">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Ex: Cliente desistiu · Falha de estoque · Pagamento não confirmado..."
            className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full resize-y border bg-white px-3 py-2.5 text-sm transition-colors outline-none"
            style={{ borderRadius: 'var(--radius-edge)' }}
            disabled={loading}
          />
          <div className="text-brand-steel mt-1 text-right font-mono text-[10px]">
            {reason.length}/500
          </div>
        </div>

        <div className="border-brand-mist mt-3 flex items-center justify-end gap-2 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="font-display text-brand-iron hover:text-brand-black px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition disabled:opacity-50"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading || reason.trim().length < 3}
            className="font-display inline-flex items-center gap-2 bg-red-600 px-5 py-2.5 text-xs font-bold tracking-wide text-white uppercase transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-50"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <XCircle className="size-3.5" strokeWidth={2.5} />
            )}
            Confirmar cancelamento
          </button>
        </div>
      </div>
    </div>
  );
}
