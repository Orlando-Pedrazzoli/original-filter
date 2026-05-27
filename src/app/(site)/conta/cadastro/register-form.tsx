/* ══════════════════════════════════════════
   RegisterForm — Original Filter
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  Check,
} from 'lucide-react';

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Força de senha
  const passwordStrength = computePasswordStrength(password);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 3) {
      errs.name = 'Informe seu nome completo';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Email inválido';
    }
    if (!phone.replace(/\D/g, '') || phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Telefone inválido (mín. 10 dígitos)';
    }
    if (password.length < 8) {
      errs.password = 'Senha deve ter pelo menos 8 caracteres';
    }
    if (!acceptedTerms) {
      errs.acceptedTerms = 'Você precisa aceitar os termos';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          acceptedTerms: true,
        }),
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
          setGeneralError(data.error || 'Erro ao criar conta');
        }
        setLoading(false);
        return;
      }

      // Sucesso: auto-login
      const signInResult = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Conta foi criada mas auto-login falhou (improvável)
        router.push('/conta/login?error=auto_login_failed');
      } else {
        router.push('/conta');
        router.refresh();
      }
    } catch (err) {
      console.error('Register error:', err);
      setGeneralError('Erro inesperado. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {generalError && (
        <div
          className="flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <div>{generalError}</div>
        </div>
      )}

      {/* Nome */}
      <Field
        id="name"
        label="Nome completo"
        icon={<UserIcon className="size-4" />}
        value={name}
        onChange={setName}
        placeholder="João da Silva"
        autoComplete="name"
        error={errors.name}
        disabled={loading}
        required
        maxLength={120}
      />

      {/* Email */}
      <Field
        id="email"
        label="Email"
        type="email"
        icon={<Mail className="size-4" />}
        value={email}
        onChange={setEmail}
        placeholder="voce@email.com"
        autoComplete="email"
        error={errors.email}
        disabled={loading}
        required
      />

      {/* Telefone */}
      <Field
        id="phone"
        label="Telefone com DDD"
        type="tel"
        icon={<Phone className="size-4" />}
        value={phone}
        onChange={(v) => setPhone(formatPhone(v))}
        placeholder="(11) 99999-9999"
        autoComplete="tel"
        error={errors.phone}
        disabled={loading}
        required
        maxLength={16}
      />

      {/* Senha */}
      <div>
        <label
          htmlFor="password"
          className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase"
        >
          Senha <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <Lock className="text-brand-steel pointer-events-none absolute top-3 left-3.5 size-4" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-2.5 pr-10 pl-10 text-sm transition-colors outline-none"
            style={{ borderRadius: 'var(--radius-edge)' }}
            disabled={loading}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-brand-steel hover:text-brand-black absolute top-2.5 right-3"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {/* Indicador de força */}
        {password.length > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="grid flex-1 grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 transition-colors ${
                    i < passwordStrength.score
                      ? passwordStrength.score <= 1
                        ? 'bg-red-500'
                        : passwordStrength.score <= 2
                          ? 'bg-amber-500'
                          : passwordStrength.score === 3
                            ? 'bg-emerald-400'
                            : 'bg-emerald-600'
                      : 'bg-brand-mist'
                  }`}
                />
              ))}
            </div>
            <span className="text-brand-iron min-w-[60px] text-right font-mono text-[10px] tracking-widest uppercase">
              {passwordStrength.label}
            </span>
          </div>
        )}
        {errors.password && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="size-3" strokeWidth={2} />
            {errors.password}
          </div>
        )}
      </div>

      {/* Termos */}
      <label htmlFor="terms" className="group flex cursor-pointer items-start gap-2.5">
        <input
          id="terms"
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => {
            setAcceptedTerms(e.target.checked);
            if (errors.acceptedTerms) {
              setErrors((er) => {
                const { acceptedTerms: _, ...rest } = er;
                return rest;
              });
            }
          }}
          className="accent-brand-yellow mt-0.5 size-4 shrink-0 cursor-pointer"
          disabled={loading}
        />
        <span className="text-brand-iron text-xs leading-relaxed">
          Li e concordo com os{' '}
          <a
            href="/termos"
            target="_blank"
            className="font-display text-brand-yellow-deep font-bold hover:underline"
          >
            Termos de Uso
          </a>{' '}
          e a{' '}
          <a
            href="/privacidade"
            target="_blank"
            className="font-display text-brand-yellow-deep font-bold hover:underline"
          >
            Política de Privacidade
          </a>
          .
        </span>
      </label>
      {errors.acceptedTerms && (
        <div className="-mt-3 ml-7 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="size-3" strokeWidth={2} />
          {errors.acceptedTerms}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-xs font-bold tracking-wide uppercase transition disabled:cursor-wait disabled:opacity-50"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        {loading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Criando conta...
          </>
        ) : (
          <>
            Criar conta
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </>
        )}
      </button>
    </form>
  );
}

// ─── Helper component ───
function Field({
  id,
  label,
  type = 'text',
  icon,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  disabled,
  required,
  maxLength,
}: {
  id: string;
  label: string;
  type?: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase"
      >
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="relative">
        <div className="text-brand-steel pointer-events-none absolute top-3 left-3.5">{icon}</div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-2.5 pr-3 pl-10 text-sm transition-colors outline-none"
          style={{ borderRadius: 'var(--radius-edge)' }}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
        />
      </div>
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="size-3" strokeWidth={2} />
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Força de senha (simples) ───
function computePasswordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (pw.length === 0) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;

  const labels = ['Fraca', 'Fraca', 'Média', 'Boa', 'Forte'];
  return { score: score as 0 | 1 | 2 | 3 | 4, label: labels[score] };
}
