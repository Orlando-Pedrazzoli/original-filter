'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Brand */}
      <div className="bg-dark relative hidden w-1/2 flex-col items-center justify-center p-12 lg:flex">
        <div className="bg-brand absolute top-0 left-0 h-1 w-full" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,215,0,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-md text-center">
          <Image
            src="/images/logo-originalfilter.png"
            alt="Original Filter"
            width={200}
            height={80}
            className="mx-auto h-16"
            style={{ width: 'auto' }}
            priority
          />
          <h1 className="text-brand mt-8 text-3xl font-bold">Filtrando o futuro.</h1>
          <p className="mt-4 text-sm text-gray-500">
            Painel administrativo para gerenciamento de produtos, pedidos, contatos e conteúdo do
            site.
          </p>

          <div className="mt-10 flex justify-center gap-3">
            {['IATF 16949:2016', 'QS 9000', 'ISO 9001'].map((cert) => (
              <span
                key={cert}
                className="rounded border border-gray-700 px-3 py-1.5 text-xs text-gray-500"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>

        <p className="absolute bottom-8 text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Original Filter. Acesso restrito.
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex w-full items-center justify-center bg-white px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Image
              src="/images/logo-originalfilter.png"
              alt="Original Filter"
              width={160}
              height={64}
              className="h-12"
              style={{ width: 'auto' }}
              priority
            />
          </div>

          <h2 className="text-dark text-center text-2xl font-bold">Acesso Administrativo</h2>
          <p className="text-muted-dark mt-2 text-center text-sm">
            Insira suas credenciais para acessar o painel.
          </p>

          {/* Error message */}
          {error && (
            <div className="bg-danger/5 border-danger/20 text-danger mt-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ══════ FORM — corrigido com <form> ══════ */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="text-dark mb-1.5 block text-sm font-medium">
                E-mail
              </label>
              <div className="relative">
                <Mail className="text-muted pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@originalfilter.com"
                  required
                  autoComplete="email"
                  className="border-surface-alt text-dark placeholder:text-muted focus:border-brand focus:ring-brand/20 h-11 w-full rounded-lg border bg-white pr-4 pl-10 text-sm transition-all outline-none focus:ring-2"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="text-dark mb-1.5 block text-sm font-medium"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="text-muted pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="border-surface-alt text-dark placeholder:text-muted focus:border-brand focus:ring-brand/20 h-11 w-full rounded-lg border bg-white pr-11 pl-10 text-sm transition-all outline-none focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted hover:text-dark absolute top-1/2 right-3.5 -translate-y-1/2 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit — type="submit" dentro do <form> */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="bg-brand text-dark hover:bg-brand-hover flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>

          {/* Back to site */}
          <p className="mt-8 text-center text-xs text-gray-400">
            <a href="/" className="hover:text-brand transition-colors">
              ← Voltar ao site
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
