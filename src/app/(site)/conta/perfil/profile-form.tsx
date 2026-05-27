/* ══════════════════════════════════════════
   ProfileForm — Original Filter
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Lock,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

type CompanyData = {
  razaoSocial?: string;
  cnpj?: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
};

interface ProfileFormProps {
  initial: {
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    cpf: string;
    company: CompanyData | null;
  };
  role: string;
}

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatCnpj(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function ProfileForm({ initial, role }: ProfileFormProps) {
  const router = useRouter();
  const isReseller = role === 'reseller';

  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [cpf, setCpf] = useState(initial.cpf);

  const [razaoSocial, setRazaoSocial] = useState(initial.company?.razaoSocial ?? '');
  const [cnpj, setCnpj] = useState(initial.company?.cnpj ?? '');
  const [nomeFantasia, setNomeFantasia] = useState(initial.company?.nomeFantasia ?? '');
  const [inscricaoEstadual, setInscricaoEstadual] = useState(
    initial.company?.inscricaoEstadual ?? '',
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setSuccess(false);

    // Validação client mínima
    const errs: Record<string, string> = {};
    if (!name.trim() || name.length < 3) errs.name = 'Nome muito curto';
    if (!email.trim()) errs.email = 'Email obrigatório';
    if (phone.replace(/\D/g, '').length < 10) errs.phone = 'Telefone inválido';

    if (isReseller) {
      if (!razaoSocial.trim()) errs['company.razaoSocial'] = 'Razão social obrigatória';
      if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
        errs['company.cnpj'] = 'CNPJ inválido';
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        cpf: cpf.trim(),
      };

      if (isReseller) {
        payload.company = {
          razaoSocial: razaoSocial.trim(),
          cnpj: cnpj.trim(),
          nomeFantasia: nomeFantasia.trim() || undefined,
          inscricaoEstadual: inscricaoEstadual.trim() || undefined,
        };
      }

      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
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
        } else if (data.conflictField === 'email') {
          setErrors({ email: data.error });
        } else {
          setGeneralError(data.error || 'Erro ao salvar');
        }
        setSaving(false);
        return;
      }

      setSuccess(true);
      setSaving(false);
      // Atualiza dados do server component (atualiza header com novo nome)
      router.refresh();

      // Some o toast em 3s
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setGeneralError('Erro inesperado. Tente novamente.');
      setSaving(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toast */}
        {success && (
          <div
            className="flex items-center gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <CheckCircle2 className="size-4 shrink-0" strokeWidth={2} />
            Perfil atualizado com sucesso.
          </div>
        )}

        {generalError && (
          <div
            className="flex items-start gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <div>{generalError}</div>
          </div>
        )}

        {/* SEÇÃO 01: Dados pessoais */}
        <Section step="01" title="Dados pessoais">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Nome completo"
              icon={<UserIcon className="size-4" />}
              value={name}
              onChange={setName}
              error={errors.name}
              disabled={saving}
              required
              className="md:col-span-2"
            />
            <Field
              label="Email"
              type="email"
              icon={<Mail className="size-4" />}
              value={email}
              onChange={setEmail}
              error={errors.email}
              disabled={saving}
              required
              className="md:col-span-2"
              hint="Troca de email não exige confirmação"
            />
            <Field
              label="Telefone com DDD"
              type="tel"
              icon={<Phone className="size-4" />}
              value={phone}
              onChange={(v) => setPhone(formatPhone(v))}
              error={errors.phone}
              disabled={saving}
              required
              maxLength={16}
            />
            <Field
              label="WhatsApp (opcional)"
              type="tel"
              icon={<Phone className="size-4" />}
              value={whatsapp}
              onChange={(v) => setWhatsapp(formatPhone(v))}
              error={errors.whatsapp}
              disabled={saving}
              maxLength={16}
            />
            <Field
              label="CPF (opcional)"
              value={cpf}
              onChange={(v) => setCpf(formatCpf(v))}
              error={errors.cpf}
              disabled={saving}
              mono
              maxLength={14}
              className="md:col-span-2"
            />
          </div>
        </Section>

        {/* SEÇÃO 02: Empresa (só reseller) */}
        {isReseller && (
          <Section step="02" title="Dados da empresa">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Razão social"
                icon={<Building2 className="size-4" />}
                value={razaoSocial}
                onChange={setRazaoSocial}
                error={errors['company.razaoSocial']}
                disabled={saving}
                required
                className="md:col-span-2"
              />
              <Field
                label="CNPJ"
                value={cnpj}
                onChange={(v) => setCnpj(formatCnpj(v))}
                error={errors['company.cnpj']}
                disabled={saving}
                required
                mono
                maxLength={18}
              />
              <Field
                label="Inscrição estadual"
                value={inscricaoEstadual}
                onChange={setInscricaoEstadual}
                disabled={saving}
                mono
              />
              <Field
                label="Nome fantasia (opcional)"
                value={nomeFantasia}
                onChange={setNomeFantasia}
                disabled={saving}
                className="md:col-span-2"
              />
            </div>
          </Section>
        )}

        {/* SEÇÃO 03: Segurança */}
        <Section step={isReseller ? '03' : '02'} title="Segurança">
          <button
            type="button"
            onClick={() => setPasswordModalOpen(true)}
            className="font-display text-brand-iron hover:text-brand-black border-brand-mist hover:border-brand-iron inline-flex items-center gap-2 border px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <Lock className="size-3.5" />
            Trocar senha
          </button>
        </Section>

        {/* Footer */}
        <div className="bg-brand-snow border-brand-mist sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t px-4 py-4 lg:-mx-6 lg:px-6">
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
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>

      {/* Modal trocar senha */}
      {passwordModalOpen && <ChangePasswordModal onClose={() => setPasswordModalOpen(false)} />}
    </>
  );
}

// ═══════════════════════════════════════════
//   Sub-componentes
// ═══════════════════════════════════════════

function Section({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-brand-white border-brand-mist relative border p-5 md:p-6"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <div className="bg-brand-yellow absolute top-5 bottom-5 left-0 w-1 md:top-6 md:bottom-6" />
      <div className="mb-5 pl-4">
        <div className="text-brand-yellow-deep mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
          Etapa {step}
        </div>
        <h3
          className="font-display text-brand-black leading-tight font-black"
          style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h3>
      </div>
      <div className="pl-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  type = 'text',
  icon,
  value,
  onChange,
  error,
  disabled,
  required,
  mono,
  maxLength,
  className,
  hint,
}: {
  label: string;
  type?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  mono?: boolean;
  maxLength?: number;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={className}>
      <label className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="text-brand-steel pointer-events-none absolute top-3 left-3.5">{icon}</div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white ${
            icon ? 'pl-10' : 'pl-3'
          } py-2.5 pr-3 text-sm transition-colors outline-none disabled:opacity-50 ${mono ? 'font-mono' : ''}`}
          style={{ borderRadius: 'var(--radius-edge)' }}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
        />
      </div>
      {hint && !error && (
        <div className="text-brand-steel mt-1 font-mono text-[10px] tracking-widest uppercase">
          {hint}
        </div>
      )}
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="size-3" strokeWidth={2} />
          {error}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
//   Modal de trocar senha
// ═══════════════════════════════════════════

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (newPassword === currentPassword) {
      setError('A nova senha deve ser diferente da atual');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao trocar senha');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => onClose(), 1800);
    } catch (err) {
      console.error(err);
      setError('Erro inesperado. Tente novamente.');
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
            <Lock className="size-5" strokeWidth={2} />
          </div>
          <div>
            <h2
              className="font-display text-brand-black leading-tight font-black"
              style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)' }}
            >
              Trocar senha
            </h2>
            <p className="text-brand-iron mt-0.5 text-sm">Mínimo 8 caracteres.</p>
          </div>
        </div>

        {success ? (
          <div
            className="flex items-center gap-3 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <CheckCircle2 className="size-5 shrink-0" strokeWidth={2} />
            <div>
              <strong>Senha alterada!</strong> Fechando...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
                {error}
              </div>
            )}

            <PasswordField
              label="Senha atual"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showPassword}
              disabled={loading}
              required
            />
            <PasswordField
              label="Nova senha"
              value={newPassword}
              onChange={setNewPassword}
              show={showPassword}
              disabled={loading}
              required
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirmar nova senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showPassword}
              disabled={loading}
              required
              autoComplete="new-password"
            />

            <label className="text-brand-iron flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="accent-brand-yellow size-4 cursor-pointer"
              />
              Mostrar senhas
            </label>

            <div className="border-brand-mist flex items-center justify-end gap-2 border-t pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="font-display text-brand-iron hover:text-brand-black px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition disabled:opacity-50"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Lock className="size-3.5" strokeWidth={2.5} />
                )}
                Trocar senha
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  disabled,
  required,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="relative">
        <Lock className="text-brand-steel pointer-events-none absolute top-3 left-3.5 size-4" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="border-brand-mist focus:border-brand-yellow text-brand-black w-full border bg-white py-2.5 pr-3 pl-10 text-sm transition-colors outline-none disabled:opacity-50"
          style={{ borderRadius: 'var(--radius-edge)' }}
          disabled={disabled}
          required={required}
          minLength={8}
        />
      </div>
    </div>
  );
}
