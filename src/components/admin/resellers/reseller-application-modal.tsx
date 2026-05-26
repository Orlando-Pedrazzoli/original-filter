/* ══════════════════════════════════════════
   ResellerApplicationModal — Original Filter Admin
   ──────────────────────────────────────────
   Modal que mostra TODOS os detalhes de uma aplicação
   de revendedor + ações de aprovar/rejeitar/reabrir.

   Estados do modal:
   - 'view'     → visualização (botões aprovar/rejeitar)
   - 'approve'  → tier picker
   - 'reject'   → textarea de motivo
   - 'reopen'   → confirmação simples
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useState } from 'react';
import {
  X,
  Building2,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Truck,
  Check,
  XCircle,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Calendar,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { adminApi, type ResellerApplicationItem } from '@/lib/admin-api';
import { useAdminToast } from '@/components/admin/admin-toast';

interface ResellerApplicationModalProps {
  application: ResellerApplicationItem;
  onClose: () => void;
  onUpdated: () => void;
}

type ModalMode = 'view' | 'approve' | 'reject' | 'reopen';

const SEGMENT_LABELS: Record<string, string> = {
  oficina: 'Oficina mecânica',
  distribuidora: 'Distribuidora',
  atacado: 'Atacado / autopeças',
  loja: 'Loja de autopeças',
  frota: 'Frota / transportadora',
  concessionaria: 'Concessionária',
  outro: 'Outro',
};

const TIER_OPTIONS: { value: 0 | 5 | 10 | 15 | 20; label: string; hint: string }[] = [
  { value: 0, label: 'Sem desconto', hint: 'Aprovar sem benefício (raro)' },
  { value: 5, label: '5% off', hint: 'Pequeno volume / oficina' },
  { value: 10, label: '10% off', hint: 'Volume médio / atacado' },
  { value: 15, label: '15% off', hint: 'Distribuidora / grande conta' },
  { value: 20, label: '20% off', hint: 'Parceiro estratégico' },
];

function formatCnpj(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatDate(date: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ResellerApplicationModal({
  application: app,
  onClose,
  onUpdated,
}: ResellerApplicationModalProps) {
  const { toast } = useAdminToast();
  const [mode, setMode] = useState<ModalMode>('view');
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<0 | 5 | 10 | 15 | 20>(10);
  const [rejectionReason, setRejectionReason] = useState('');

  // ESC fecha
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, loading]);

  // ─── Ações ───
  async function handleApprove() {
    setLoading(true);
    try {
      const result = await adminApi.resellers.approve(app._id, selectedTier);
      toast.success(
        `Aprovado · tier ${selectedTier}%${result.userCreated ? ' · conta criada' : ' · conta já existia'}`,
      );
      onUpdated();
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao aprovar');
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (rejectionReason.trim().length < 3) {
      toast.error('Informe o motivo da rejeição');
      return;
    }
    setLoading(true);
    try {
      await adminApi.resellers.reject(app._id, rejectionReason.trim());
      toast.success('Aplicação rejeitada');
      onUpdated();
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao rejeitar');
    } finally {
      setLoading(false);
    }
  }

  async function handleReopen() {
    setLoading(true);
    try {
      await adminApi.resellers.reopen(app._id);
      toast.success('Aplicação reaberta');
      onUpdated();
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao reabrir');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-brand-white relative my-8 w-full max-w-3xl"
        style={{ borderRadius: 'var(--radius-edge)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header sticky */}
        <div
          className="bg-brand-white border-brand-mist sticky top-0 z-10 flex items-start justify-between gap-4 border-b px-6 py-4"
          style={{
            borderTopLeftRadius: 'var(--radius-edge)',
            borderTopRightRadius: 'var(--radius-edge)',
          }}
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <StatusBadge status={app.status} />
              <span className="text-brand-iron font-mono text-[10px] tracking-widest uppercase">
                Aplicação de revendedor
              </span>
            </div>
            <h2
              className="font-display text-brand-black truncate leading-tight font-black"
              style={{
                fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
                letterSpacing: '-0.025em',
              }}
            >
              {app.razaoSocial}
            </h2>
            <div className="text-brand-iron mt-0.5 font-mono text-xs">{formatCnpj(app.cnpj)}</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-brand-iron hover:text-brand-black inline-flex size-8 shrink-0 items-center justify-center transition disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Status info */}
          {app.status !== 'pending' && (
            <div
              className={`p-4 ${
                app.status === 'approved'
                  ? 'border border-emerald-200 bg-emerald-50'
                  : 'border border-red-200 bg-red-50'
              }`}
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <div className="flex items-start gap-3">
                {app.status === 'approved' ? (
                  <Check className="mt-0.5 size-5 shrink-0 text-emerald-700" strokeWidth={2.5} />
                ) : (
                  <XCircle className="mt-0.5 size-5 shrink-0 text-red-700" strokeWidth={2.5} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-display text-brand-black font-bold">
                    {app.status === 'approved'
                      ? `Aprovado · tier ${app.approvedDiscountTier}% de desconto`
                      : 'Rejeitado'}
                  </div>
                  <div className="text-brand-iron mt-1 flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase">
                    <Calendar className="size-3" />
                    {formatDate(app.reviewedAt)}
                  </div>
                  {app.rejectionReason && (
                    <div className="text-brand-iron mt-2 text-sm italic">
                      &ldquo;{app.rejectionReason}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {mode === 'view' && (
            <>
              {/* ─── EMPRESA ─── */}
              <Section icon={<Building2 className="size-3.5" />} title="Empresa">
                <Field label="Razão Social" value={app.razaoSocial} />
                <Field label="CNPJ" value={formatCnpj(app.cnpj)} mono />
                {app.nomeFantasia && <Field label="Nome fantasia" value={app.nomeFantasia} />}
                {app.inscricaoEstadual && (
                  <Field label="Inscrição estadual" value={app.inscricaoEstadual} mono />
                )}
                <Field
                  label="Segmento"
                  value={SEGMENT_LABELS[app.segment] ?? app.segment}
                  icon={<Briefcase className="size-3" />}
                />
              </Section>

              {/* ─── CONTATO ─── */}
              <Section icon={<UserIcon className="size-3.5" />} title="Contato">
                <Field label="Nome" value={app.contactName} />
                <Field
                  label="Email"
                  value={app.email}
                  icon={<Mail className="size-3" />}
                  href={`mailto:${app.email}`}
                  mono
                />
                <Field
                  label="Telefone"
                  value={app.phone}
                  icon={<Phone className="size-3" />}
                  href={`tel:${app.phone.replace(/\D/g, '')}`}
                  mono
                />
                {app.whatsapp && (
                  <Field
                    label="WhatsApp"
                    value={app.whatsapp}
                    icon={<Phone className="size-3" />}
                    href={`https://wa.me/55${app.whatsapp.replace(/\D/g, '')}`}
                    external
                    mono
                  />
                )}
              </Section>

              {/* ─── LOCALIZAÇÃO ─── */}
              <Section icon={<MapPin className="size-3.5" />} title="Localização">
                <Field label="Cidade / UF" value={`${app.cidade} / ${app.uf}`} />
              </Section>

              {/* ─── PERFIL COMERCIAL ─── */}
              {(app.estimatedMonthlyVolume || app.currentSuppliers || app.message) && (
                <Section icon={<TrendingUp className="size-3.5" />} title="Perfil comercial">
                  {app.estimatedMonthlyVolume && (
                    <Field
                      label="Volume mensal estimado"
                      value={app.estimatedMonthlyVolume}
                      icon={<Truck className="size-3" />}
                    />
                  )}
                  {app.currentSuppliers && (
                    <Field label="Fornecedores atuais" value={app.currentSuppliers} />
                  )}
                  {app.message && (
                    <Field
                      label="Mensagem"
                      value={app.message}
                      icon={<MessageSquare className="size-3" />}
                      multiline
                    />
                  )}
                </Section>
              )}

              {/* ─── METADATA ─── */}
              <div className="text-brand-steel border-brand-mist border-t pt-4 font-mono text-[10px] tracking-widest uppercase">
                Enviada em {formatDate(app.createdAt)}
              </div>
            </>
          )}

          {mode === 'approve' && (
            <ApprovePanel
              tier={selectedTier}
              onTierChange={setSelectedTier}
              razaoSocial={app.razaoSocial}
              email={app.email}
            />
          )}

          {mode === 'reject' && (
            <RejectPanel
              razaoSocial={app.razaoSocial}
              reason={rejectionReason}
              onReasonChange={setRejectionReason}
            />
          )}

          {mode === 'reopen' && <ReopenPanel razaoSocial={app.razaoSocial} status={app.status} />}
        </div>

        {/* Footer com ações */}
        <div
          className="bg-brand-snow border-brand-mist sticky bottom-0 z-10 flex items-center justify-between gap-2 border-t px-6 py-4"
          style={{
            borderBottomLeftRadius: 'var(--radius-edge)',
            borderBottomRightRadius: 'var(--radius-edge)',
          }}
        >
          {mode === 'view' && (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="font-display text-brand-iron hover:text-brand-black px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition disabled:opacity-50"
              >
                Fechar
              </button>

              <div className="flex items-center gap-2">
                {app.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMode('reject')}
                      className="font-display inline-flex items-center gap-2 border border-red-200 px-4 py-2.5 text-xs font-bold tracking-wide text-red-600 uppercase transition hover:border-red-300 hover:bg-red-50"
                      style={{ borderRadius: 'var(--radius-edge)' }}
                    >
                      <XCircle className="size-3.5" strokeWidth={2.5} />
                      Rejeitar
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('approve')}
                      className="font-display bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition"
                      style={{ borderRadius: 'var(--radius-edge)' }}
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                      Aprovar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode('reopen')}
                    className="font-display text-brand-iron hover:text-brand-black border-brand-mist hover:border-brand-iron inline-flex items-center gap-2 border px-4 py-2.5 text-xs font-bold tracking-wide uppercase transition"
                    style={{ borderRadius: 'var(--radius-edge)' }}
                  >
                    <RotateCcw className="size-3.5" strokeWidth={2.5} />
                    Reabrir
                  </button>
                )}
              </div>
            </>
          )}

          {mode === 'approve' && (
            <>
              <button
                type="button"
                onClick={() => setMode('view')}
                disabled={loading}
                className="font-display text-brand-iron hover:text-brand-black inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition disabled:opacity-50"
              >
                <ArrowLeft className="size-3.5" />
                Voltar
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={loading}
                className="font-display bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition disabled:cursor-wait disabled:opacity-50"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" strokeWidth={3} />
                )}
                Confirmar aprovação · {selectedTier}%
              </button>
            </>
          )}

          {mode === 'reject' && (
            <>
              <button
                type="button"
                onClick={() => setMode('view')}
                disabled={loading}
                className="font-display text-brand-iron hover:text-brand-black inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition disabled:opacity-50"
              >
                <ArrowLeft className="size-3.5" />
                Voltar
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={loading || rejectionReason.trim().length < 3}
                className="font-display inline-flex items-center gap-2 bg-red-600 px-5 py-2.5 text-xs font-bold tracking-wide text-white uppercase transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <XCircle className="size-3.5" strokeWidth={2.5} />
                )}
                Confirmar rejeição
              </button>
            </>
          )}

          {mode === 'reopen' && (
            <>
              <button
                type="button"
                onClick={() => setMode('view')}
                disabled={loading}
                className="font-display text-brand-iron hover:text-brand-black inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition disabled:opacity-50"
              >
                <ArrowLeft className="size-3.5" />
                Voltar
              </button>
              <button
                type="button"
                onClick={handleReopen}
                disabled={loading}
                className="font-display bg-brand-black text-brand-yellow hover:bg-brand-graphite inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition disabled:cursor-wait disabled:opacity-50"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="size-3.5" strokeWidth={2.5} />
                )}
                Confirmar reabertura
              </button>
            </>
          )}
        </div>
      </div>
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
    <div className="space-y-3">
      <div className="text-brand-iron flex items-center gap-2">
        {icon}
        <span className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase">{title}</span>
        <div className="bg-brand-mist h-px flex-1" />
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
  mono,
  href,
  external,
  multiline,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
  href?: string;
  external?: boolean;
  multiline?: boolean;
}) {
  const valueElement = (
    <span
      className={`text-brand-black text-sm ${mono ? 'font-mono' : ''} ${multiline ? 'whitespace-pre-wrap' : ''}`}
    >
      {value}
    </span>
  );

  return (
    <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-12 md:gap-4">
      <div className="text-brand-iron flex items-center gap-1.5 pt-0.5 font-mono text-[10px] tracking-widest uppercase md:col-span-4">
        {icon}
        {label}
      </div>
      <div className="min-w-0 md:col-span-8">
        {href ? (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="text-brand-black hover:text-brand-yellow-deep inline-flex items-center gap-1.5 text-sm transition"
          >
            <span className={mono ? 'font-mono' : ''}>{value}</span>
            {external && <ExternalLink className="size-3" />}
          </a>
        ) : (
          valueElement
        )}
      </div>
    </div>
  );
}

function ApprovePanel({
  tier,
  onTierChange,
  razaoSocial,
  email,
}: {
  tier: 0 | 5 | 10 | 15 | 20;
  onTierChange: (t: 0 | 5 | 10 | 15 | 20) => void;
  razaoSocial: string;
  email: string;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="bg-brand-yellow text-brand-black mb-3 inline-flex size-12 items-center justify-center">
          <Check className="size-6" strokeWidth={3} />
        </div>
        <h3
          className="font-display text-brand-black mb-2 leading-tight font-black"
          style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)' }}
        >
          Aprovar como revendedor
        </h3>
        <p className="text-brand-iron mx-auto max-w-md text-sm">
          Defina o tier de desconto B2B para{' '}
          <strong className="text-brand-black">{razaoSocial}</strong>.
        </p>
      </div>

      <div className="space-y-2">
        <div className="text-brand-iron mb-3 font-mono text-[10px] tracking-[0.22em] uppercase">
          Tier de desconto
        </div>
        {TIER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onTierChange(opt.value)}
            className={`flex w-full items-center justify-between gap-3 border p-3 text-left transition ${
              tier === opt.value
                ? 'bg-brand-yellow/10 border-brand-yellow'
                : 'bg-brand-white border-brand-mist hover:border-brand-iron'
            }`}
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex size-5 items-center justify-center border-2 ${
                  tier === opt.value
                    ? 'border-brand-yellow-deep bg-brand-yellow'
                    : 'border-brand-mist'
                }`}
              >
                {tier === opt.value && (
                  <Check className="text-brand-black size-3" strokeWidth={3} />
                )}
              </span>
              <div>
                <div className="font-display text-brand-black font-bold">{opt.label}</div>
                <div className="text-brand-iron font-mono text-[10px] tracking-widest uppercase">
                  {opt.hint}
                </div>
              </div>
            </div>
            <div
              className={`font-display font-black tabular-nums ${
                tier === opt.value ? 'text-brand-yellow-deep' : 'text-brand-mist'
              }`}
              style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}
            >
              {opt.value}%
            </div>
          </button>
        ))}
      </div>

      <div
        className="bg-brand-snow border-brand-mist text-brand-iron flex items-start gap-2 border p-3 text-xs"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        <AlertCircle className="text-brand-iron mt-0.5 size-3.5 shrink-0" />
        <div>
          Será criada uma conta de revendedor para{' '}
          <strong className="text-brand-black font-mono">{email}</strong>. O revendedor receberá
          instrução para definir a senha no primeiro acesso (via &quot;esqueci minha senha&quot;).
        </div>
      </div>
    </div>
  );
}

function RejectPanel({
  razaoSocial,
  reason,
  onReasonChange,
}: {
  razaoSocial: string;
  reason: string;
  onReasonChange: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mb-3 inline-flex size-12 items-center justify-center bg-red-100 text-red-700">
          <XCircle className="size-6" strokeWidth={2} />
        </div>
        <h3
          className="font-display text-brand-black mb-2 leading-tight font-black"
          style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)' }}
        >
          Rejeitar aplicação
        </h3>
        <p className="text-brand-iron mx-auto max-w-md text-sm">
          Informe o motivo da rejeição de{' '}
          <strong className="text-brand-black">{razaoSocial}</strong>. Esse motivo fica registrado
          para futura consulta.
        </p>
      </div>

      <div>
        <label className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase">
          Motivo da rejeição <span className="text-red-600">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Ex: CNPJ inativo · Volume incompatível com programa · Documentação não confere..."
          className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full resize-y border bg-white px-4 py-2.5 text-sm leading-normal transition-colors outline-none"
          style={{ borderRadius: 'var(--radius-edge)' }}
        />
        <div className="text-brand-steel mt-1 text-right font-mono text-[10px]">
          {reason.length}/500
        </div>
      </div>
    </div>
  );
}

function ReopenPanel({
  razaoSocial,
  status,
}: {
  razaoSocial: string;
  status: 'approved' | 'rejected' | 'pending';
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="bg-brand-snow text-brand-iron mb-3 inline-flex size-12 items-center justify-center">
          <RotateCcw className="size-6" strokeWidth={2} />
        </div>
        <h3
          className="font-display text-brand-black mb-2 leading-tight font-black"
          style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)' }}
        >
          Reabrir aplicação?
        </h3>
        <p className="text-brand-iron mx-auto max-w-md text-sm">
          A aplicação de <strong className="text-brand-black">{razaoSocial}</strong> voltará para o
          status <strong>pendente</strong>.
        </p>
      </div>

      {status === 'approved' && (
        <div
          className="flex items-start gap-2 border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <div>
            <strong>Atenção:</strong> a conta de revendedor já criada NÃO será removida. Se quiser
            desativar a conta, faça isso depois em <em>Clientes</em> (em breve).
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const cfg = {
    pending: {
      label: 'Pendente',
      class: 'bg-brand-yellow text-brand-black',
    },
    approved: {
      label: 'Aprovado',
      class: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
    rejected: {
      label: 'Rejeitado',
      class: 'bg-red-100 text-red-800 border border-red-200',
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase ${cfg.class}`}
    >
      {cfg.label}
    </span>
  );
}
