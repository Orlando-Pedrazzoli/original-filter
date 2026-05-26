/* ══════════════════════════════════════════
   LoginForm — /admin/login
   ──────────────────────────────────────────
   Client component que faz signIn via NextAuth com credentials.
   Após sucesso, redireciona para callbackUrl (default: /admin).
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, KeyRound, Loader2, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Preencha email e senha.');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Mensagem mais amigável
        const msg =
          result.error === 'CredentialsSignin' ? 'Email ou senha incorretos.' : result.error;
        setError(msg);
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Sucesso: redirect com refresh (re-roda layout do (admin) e valida role)
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message || 'Erro ao entrar. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Email */}
      <div>
        <label className="mb-2 block font-mono text-[10px] tracking-[0.22em] text-white/60 uppercase">
          Email
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-white/40"
            strokeWidth={2}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-brand-black focus:border-brand-yellow w-full border border-white/10 py-3 pr-4 pl-10 text-sm leading-normal text-white transition-colors outline-none placeholder:text-white/30"
            style={{ borderRadius: 'var(--radius-edge)' }}
            placeholder="admin@originalfilter.com"
            autoComplete="email"
            autoFocus
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Senha */}
      <div>
        <label className="mb-2 block font-mono text-[10px] tracking-[0.22em] text-white/60 uppercase">
          Senha
        </label>
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-white/40"
            strokeWidth={2}
          />
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-brand-black focus:border-brand-yellow w-full border border-white/10 py-3 pr-10 pl-10 font-mono text-sm leading-normal text-white transition-colors outline-none placeholder:text-white/30"
            style={{ borderRadius: 'var(--radius-edge)' }}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={loading}
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="hover:text-brand-yellow absolute top-3 right-3 flex size-6 items-center justify-center text-white/40 transition"
            aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
            tabIndex={-1}
          >
            {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div
          className="flex items-start gap-3 border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-200"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright font-display inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold tracking-wide uppercase transition disabled:cursor-not-allowed disabled:opacity-50"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Autenticando...
          </>
        ) : (
          <>
            Entrar no painel
            <ArrowRight className="size-4" />
          </>
        )}
      </button>

      {/* Disclaimer */}
      <p className="pt-2 text-center font-mono text-[10px] leading-relaxed tracking-widest text-white/30 uppercase">
        Esta área é restrita a administradores.
        <br />
        Acessos são registrados e auditados.
      </p>
    </form>
  );
}
