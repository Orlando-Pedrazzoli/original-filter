/* ══════════════════════════════════════════
   AddressesClient — Original Filter
   ──────────────────────────────────────────
   Lista de endereços + modal de criar/editar com
   busca automática por CEP (ViaCEP).
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  Loader2,
  AlertCircle,
  Search,
  CheckCircle2,
  Save,
  Home,
  CreditCard,
  Package,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

interface Address {
  id: number;
  label: 'principal' | 'cobranca' | 'entrega' | string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  isDefault: boolean;
}

const MAX_ADDRESSES = 10;

const LABEL_CONFIG: Record<string, { label: string; icon: typeof Home; class: string }> = {
  principal: {
    label: 'Principal',
    icon: Home,
    class: 'bg-brand-yellow text-brand-black',
  },
  entrega: {
    label: 'Entrega',
    icon: Package,
    class: 'bg-blue-100 text-blue-800',
  },
  cobranca: {
    label: 'Cobrança',
    icon: CreditCard,
    class: 'bg-purple-100 text-purple-800',
  },
};

function formatCep(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

interface AddressesClientProps {
  initialAddresses: Address[];
}

export function AddressesClient({ initialAddresses }: AddressesClientProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  function handleSaved() {
    closeModal();
    router.refresh();
    // Otimização: refetch local sem aguardar reload
    refetchAddresses();
  }

  async function refetchAddresses() {
    try {
      const res = await fetch('/api/account/addresses');
      const data = await res.json();
      if (res.ok && data.addresses) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error('Refetch error:', err);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/account/addresses/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao remover');
      } else {
        await refetchAddresses();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao remover endereço');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const canAddMore = addresses.length < MAX_ADDRESSES;

  return (
    <div className="space-y-4">
      {/* Lista */}
      {addresses.length === 0 ? (
        <div
          className="bg-brand-white border-brand-mist border border-dashed p-10 text-center"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <MapPin className="text-brand-mist mx-auto mb-3 size-10" strokeWidth={1.5} />
          <h3
            className="font-display text-brand-black mb-2 leading-tight font-black"
            style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)' }}
          >
            Nenhum endereço cadastrado
          </h3>
          <p className="text-brand-iron mb-5 text-sm">
            Adicione um endereço para agilizar seus pedidos.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wide uppercase transition"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Adicionar primeiro endereço
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => openEdit(address)}
              onDelete={() => setDeleteTarget(address)}
            />
          ))}
        </div>
      )}

      {/* Botão adicionar */}
      {addresses.length > 0 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-brand-iron font-mono text-[10px] tracking-widest uppercase">
            {addresses.length} / {MAX_ADDRESSES} endereços salvos
          </div>
          {canAddMore && (
            <button
              type="button"
              onClick={openCreate}
              className="border-brand-mist hover:border-brand-iron text-brand-iron hover:text-brand-black font-display inline-flex items-center gap-2 border px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
              Adicionar endereço
            </button>
          )}
        </div>
      )}

      {/* Modal CRUD */}
      {modalOpen && <AddressModal address={editing} onClose={closeModal} onSaved={handleSaved} />}

      {/* Modal delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remover endereço?"
        description={
          deleteTarget ? (
            <>
              <strong className="text-brand-black">
                {deleteTarget.logradouro}, {deleteTarget.numero}
              </strong>
              <br />
              {deleteTarget.bairro} · {deleteTarget.cidade}/{deleteTarget.uf}
              <br />
              <span className="text-xs">Esta ação não pode ser desfeita.</span>
            </>
          ) : null
        }
        confirmLabel="Sim, remover"
        cancelLabel="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

// ═══════════════════════════════════════════
//   AddressCard
// ═══════════════════════════════════════════

function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const config = LABEL_CONFIG[address.label] ?? LABEL_CONFIG.principal;
  const Icon = config.icon;

  return (
    <div
      className={`bg-brand-white group relative border p-5 ${
        address.isDefault
          ? 'border-brand-yellow border-2'
          : 'border-brand-mist hover:border-brand-iron'
      } transition`}
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {/* Default badge */}
      {address.isDefault && (
        <div className="bg-brand-yellow text-brand-black absolute -top-2 left-4 inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
          <Star className="size-2.5" strokeWidth={3} />
          Padrão
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className={`inline-flex size-10 shrink-0 items-center justify-center ${config.class}`}
          >
            <Icon className="size-4" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase ${config.class}`}
              >
                {config.label}
              </span>
            </div>
            <div className="font-display text-brand-black leading-tight font-bold">
              {address.logradouro}, {address.numero}
              {address.complemento && (
                <span className="text-brand-iron font-normal">
                  {' · '}
                  {address.complemento}
                </span>
              )}
            </div>
            <div className="text-brand-iron mt-1 text-sm">
              {address.bairro} · {address.cidade}/{address.uf}
            </div>
            <div className="text-brand-steel mt-0.5 font-mono text-xs">CEP {address.cep}</div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="text-brand-iron hover:text-brand-yellow-deep hover:bg-brand-snow inline-flex size-9 items-center justify-center transition"
            title="Editar"
            aria-label="Editar endereço"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-brand-iron inline-flex size-9 items-center justify-center transition hover:bg-red-50 hover:text-red-600"
            title="Remover"
            aria-label="Remover endereço"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//   AddressModal — Create/Edit
// ═══════════════════════════════════════════

function AddressModal({
  address,
  onClose,
  onSaved,
}: {
  address: Address | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!address;

  const [label, setLabel] = useState<'principal' | 'cobranca' | 'entrega'>(
    (address?.label as 'principal' | 'cobranca' | 'entrega') ?? 'entrega',
  );
  const [cep, setCep] = useState(address?.cep ?? '');
  const [logradouro, setLogradouro] = useState(address?.logradouro ?? '');
  const [numero, setNumero] = useState(address?.numero ?? '');
  const [complemento, setComplemento] = useState(address?.complemento ?? '');
  const [bairro, setBairro] = useState(address?.bairro ?? '');
  const [cidade, setCidade] = useState(address?.cidade ?? '');
  const [uf, setUf] = useState(address?.uf ?? '');
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);

  const [cepLoading, setCepLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  async function lookupCep() {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setErrors((e) => ({ ...e, cep: 'CEP deve ter 8 dígitos' }));
      return;
    }

    setCepLoading(true);
    setErrors((e) => {
      const { cep: _, ...rest } = e;
      return rest;
    });

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (data.erro) {
        setErrors((e) => ({ ...e, cep: 'CEP não encontrado' }));
      } else {
        setLogradouro(data.logradouro ?? '');
        setBairro(data.bairro ?? '');
        setCidade(data.localidade ?? '');
        setUf(data.uf ?? '');
      }
    } catch (err) {
      console.error('ViaCEP error:', err);
      setErrors((e) => ({ ...e, cep: 'Erro ao buscar CEP. Preencha manualmente.' }));
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const errs: Record<string, string> = {};
    if (cep.replace(/\D/g, '').length !== 8) errs.cep = 'CEP inválido';
    if (!logradouro.trim()) errs.logradouro = 'Logradouro obrigatório';
    if (!numero.trim()) errs.numero = 'Número obrigatório';
    if (!bairro.trim()) errs.bairro = 'Bairro obrigatório';
    if (!cidade.trim()) errs.cidade = 'Cidade obrigatória';
    if (uf.length !== 2) errs.uf = 'UF deve ter 2 letras';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        label,
        cep: cep.trim(),
        logradouro: logradouro.trim(),
        numero: numero.trim(),
        complemento: complemento.trim() || undefined,
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        uf: uf.toUpperCase().trim(),
        isDefault,
      };

      const url = isEdit ? `/api/account/addresses/${address.id}` : '/api/account/addresses';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.issues) {
          const newErrors: Record<string, string> = {};
          for (const iss of data.issues) {
            newErrors[iss.path] = iss.message;
          }
          setErrors(newErrors);
        } else {
          setGeneralError(data.error || 'Erro ao salvar endereço');
        }
        setSaving(false);
        return;
      }

      onSaved();
    } catch (err) {
      console.error(err);
      setGeneralError('Erro inesperado. Tente novamente.');
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => !saving && onClose()}
    >
      <div
        className="bg-brand-white relative my-8 w-full max-w-2xl"
        style={{ borderRadius: 'var(--radius-edge)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="bg-brand-white border-brand-mist sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4"
          style={{
            borderTopLeftRadius: 'var(--radius-edge)',
            borderTopRightRadius: 'var(--radius-edge)',
          }}
        >
          <h2
            className="font-display text-brand-black leading-tight font-black"
            style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)' }}
          >
            {isEdit ? 'Editar endereço' : 'Novo endereço'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-brand-iron hover:text-brand-black inline-flex size-8 items-center justify-center transition disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6" noValidate>
          {generalError && (
            <div
              className="flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
              <div>{generalError}</div>
            </div>
          )}

          {/* Label */}
          <div>
            <label className="text-brand-iron mb-2 block font-mono text-[10px] tracking-[0.22em] uppercase">
              Tipo de endereço
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['principal', 'entrega', 'cobranca'] as const).map((opt) => {
                const config = LABEL_CONFIG[opt];
                const Icon = config.icon;
                const active = label === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setLabel(opt)}
                    className={`inline-flex flex-col items-center gap-1.5 border p-3 transition ${
                      active
                        ? 'bg-brand-yellow/10 border-brand-yellow'
                        : 'bg-brand-white border-brand-mist hover:border-brand-iron'
                    }`}
                    style={{ borderRadius: 'var(--radius-edge)' }}
                  >
                    <Icon
                      className={`size-4 ${active ? 'text-brand-yellow-deep' : 'text-brand-iron'}`}
                      strokeWidth={2}
                    />
                    <span className="font-display text-brand-black text-xs font-bold">
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CEP + busca */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-5">
              <label className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase">
                CEP <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(formatCep(e.target.value))}
                  placeholder="00000-000"
                  className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel flex-1 border bg-white px-3 py-2.5 font-mono text-sm transition-colors outline-none"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                  disabled={saving || cepLoading}
                  maxLength={9}
                  required
                  inputMode="numeric"
                />
                <button
                  type="button"
                  onClick={lookupCep}
                  disabled={cepLoading || saving || cep.replace(/\D/g, '').length !== 8}
                  className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                  title="Buscar CEP"
                >
                  {cepLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Search className="size-3.5" strokeWidth={2.5} />
                  )}
                </button>
              </div>
              {errors.cep && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="size-3" strokeWidth={2} />
                  {errors.cep}
                </div>
              )}
              <div className="text-brand-steel mt-1 font-mono text-[10px] tracking-widest uppercase">
                Auto-preenchimento via ViaCEP
              </div>
            </div>
          </div>

          {/* Logradouro + número */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-9">
              <ModalField
                label="Logradouro"
                value={logradouro}
                onChange={setLogradouro}
                error={errors.logradouro}
                disabled={saving}
                required
              />
            </div>
            <div className="md:col-span-3">
              <ModalField
                label="Número"
                value={numero}
                onChange={setNumero}
                error={errors.numero}
                disabled={saving}
                required
                placeholder="123"
              />
            </div>
          </div>

          {/* Complemento + Bairro */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
              <ModalField
                label="Complemento (opcional)"
                value={complemento}
                onChange={setComplemento}
                disabled={saving}
                placeholder="Apto 42, Sala 3, Galpão"
              />
            </div>
            <div className="md:col-span-6">
              <ModalField
                label="Bairro"
                value={bairro}
                onChange={setBairro}
                error={errors.bairro}
                disabled={saving}
                required
              />
            </div>
          </div>

          {/* Cidade + UF */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-9">
              <ModalField
                label="Cidade"
                value={cidade}
                onChange={setCidade}
                error={errors.cidade}
                disabled={saving}
                required
              />
            </div>
            <div className="md:col-span-3">
              <ModalField
                label="UF"
                value={uf}
                onChange={(v) => setUf(v.toUpperCase().slice(0, 2))}
                error={errors.uf}
                disabled={saving}
                required
                maxLength={2}
                mono
                placeholder="SP"
              />
            </div>
          </div>

          {/* Default toggle */}
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="accent-brand-yellow size-4 cursor-pointer"
              disabled={saving}
            />
            <span className="text-brand-black text-sm">
              <strong>Definir como endereço padrão</strong>
              <span className="text-brand-iron"> (usado por padrão no checkout)</span>
            </span>
          </label>

          {/* Footer */}
          <div className="border-brand-mist flex items-center justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="font-display text-brand-iron hover:text-brand-black border-brand-mist hover:border-brand-iron border px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition disabled:opacity-50"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition disabled:cursor-wait disabled:opacity-50"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" strokeWidth={2.5} />
              )}
              {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Adicionar endereço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalField({
  label,
  value,
  onChange,
  error,
  disabled,
  required,
  placeholder,
  maxLength,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white px-3 py-2.5 text-sm transition-colors outline-none disabled:opacity-50 ${mono ? 'font-mono uppercase' : ''}`}
        style={{ borderRadius: 'var(--radius-edge)' }}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
      />
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="size-3" strokeWidth={2} />
          {error}
        </div>
      )}
    </div>
  );
}
