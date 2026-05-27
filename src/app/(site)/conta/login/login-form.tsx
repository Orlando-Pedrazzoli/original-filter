/* ══════════════════════════════════════════
   LoginForm — Original Filter
   ──────────────────────────────────────────
   Form de login com NextAuth Credentials.

   Erros tratados:
   - Credentials inválidas
   - Conta desativada (isActive: false)
   - Usuário sem senha (foi criado pelo admin, precisa de "recuperar")
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  redirectTo?: string;
  initialError?: string;
}

export function LoginForm({ redirectTo, initialError }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError ? mapInitialError(initialError) : null,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Preencha email e senha');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(mapAuthError(result.error));
        setLoading(false);
        return;
      }

      // Sucesso → redireciona
      router.push(redirectTo || '/conta');
      router.refresh();
    } catch (err) {
      setError('Erro inesperado. Tente novamente em instantes.');
      console.error('Login error:', err);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Erro geral */}
      {error && (
        <div
          className="flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <div>{error}</div>
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="text-brand-steel pointer-events-none absolute top-3 left-3.5 size-4" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-2.5 pr-3 pl-10 text-sm transition-colors outline-none"
            style={{ borderRadius: 'var(--radius-edge)' }}
            disabled={loading}
            required
          />
        </div>
      </div>

      {/* Senha */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-brand-iron font-mono text-[10px] tracking-[0.22em] uppercase"
          >
            Senha
          </label>
          <Link
            href="/conta/recuperar"
            className="text-brand-yellow-deep font-mono text-[10px] tracking-widest uppercase hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>
        <div className="relative">
          <Lock className="text-brand-steel pointer-events-none absolute top-3 left-3.5 size-4" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-xs font-bold tracking-wide uppercase transition disabled:cursor-wait disabled:opacity-50"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        {loading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            Entrar
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </>
        )}
      </button>

      {/* Divider + cadastro */}
      <div className="relative pt-3">
        <div className="absolute inset-0 flex items-center">
          <div className="border-brand-mist w-full border-t" />
        </div>
        <div className="relative flex justify-center font-mono text-[10px] tracking-widest uppercase">
          <span className="bg-brand-white text-brand-steel px-3">Ainda não tem conta?</span>
        </div>
      </div>

      <Link
        href="/conta/cadastro"
        className="border-brand-mist hover:border-brand-iron text-brand-iron hover:text-brand-black font-display inline-flex w-full items-center justify-center gap-2 border px-5 py-3 text-xs font-semibold tracking-wide uppercase transition"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        Criar conta gratuita
      </Link>

      {/* CTA B2B */}
      <div
        className="bg-brand-snow border-brand-mist text-brand-iron border p-3 text-center text-xs"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        Quer ser revendedor?{' '}
        <Link
          href="/seja-revendedor"
          className="font-display text-brand-yellow-deep font-bold hover:underline"
        >
          Solicitar acesso B2B
        </Link>
      </div>
    </form>
  );
}

// ─── Mapeamento de erros NextAuth → mensagens amigáveis ───
function mapAuthError(error: string): string {
  if (error === 'CredentialsSignin') {
    return 'Email ou senha inválidos. Confira e tente novamente.';
  }
  if (error.includes('inativa') || error.includes('Inactive')) {
    return 'Conta desativada. Entre em contato com o suporte.';
  }
  if (error.includes('sem senha') || error.includes('No password')) {
    return 'Esta conta ainda não tem senha definida. Use "Esqueci minha senha" para criar uma.';
  }
  return 'Não foi possível entrar. Verifique seus dados.';
}

function mapInitialError(error: string): string {
  if (error === 'SessionRequired') {
    return 'Você precisa estar logado para acessar essa página.';
  }
  if (error === 'AccessDenied') {
    return 'Acesso negado.';
  }
  return mapAuthError(error);
}
