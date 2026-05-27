/* ══════════════════════════════════════════
   ResetPasswordForm — Original Filter
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface ResetPasswordFormProps {
  token: string;
  email: string;
}

export function ResetPasswordForm({ token, email }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao redefinir senha');
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Após 2.5s redireciona pro login
      setTimeout(() => {
        router.push('/conta/login');
      }, 2500);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Erro inesperado. Tente novamente.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 py-4 text-center">
        <div className="inline-flex size-14 items-center justify-center bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-7" strokeWidth={2} />
        </div>
        <h3
          className="font-display text-brand-black leading-tight font-black"
          style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)' }}
        >
          Senha redefinida!
        </h3>
        <p className="text-brand-iron text-sm leading-relaxed">
          Sua nova senha foi salva com sucesso. Redirecionando para o login...
        </p>
        <div className="flex justify-center pt-2">
          <Loader2 className="text-brand-yellow-deep size-5 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div
          className="flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <div>{error}</div>
        </div>
      )}

      {/* Nova senha */}
      <div>
        <label
          htmlFor="password"
          className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase"
        >
          Nova senha
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
            autoFocus
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
      </div>

      {/* Confirmar */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase"
        >
          Confirmar senha
        </label>
        <div className="relative">
          <Lock className="text-brand-steel pointer-events-none absolute top-3 left-3.5 size-4" />
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Digite a senha novamente"
            className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-2.5 pr-3 pl-10 text-sm transition-colors outline-none"
            style={{ borderRadius: 'var(--radius-edge)' }}
            disabled={loading}
            required
            minLength={8}
          />
        </div>
        {confirmPassword && password !== confirmPassword && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="size-3" strokeWidth={2} />
            As senhas não coincidem
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !password || password !== confirmPassword}
        className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-xs font-bold tracking-wide uppercase transition disabled:cursor-wait disabled:opacity-50"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        {loading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            Redefinir senha
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </>
        )}
      </button>
    </form>
  );
}
