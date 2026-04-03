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
      <div className="bg-dark hidden w-1/2 flex-col items-center justify-center p-12 lg:flex">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
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
          <h1 className="from-brand via-brand-light to-brand mt-8 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
            Filtrando o futuro.
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            Painel administrativo para gerenciamento de produtos, pedidos, contatos e conteúdo do
            site.
          </p>

          <div className="mt-10 flex justify-center gap-3">
            {['IATF 16949:2016', 'QS 9000', 'ISO 9001'].map((cert) => (
              <span
                key={cert}
                className="border-brand/20 bg-brand/5 text-brand/60 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-wider uppercase"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
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

          <h2 className="text-dark text-center text-2xl font-bold">Acesso ao Painel</h2>
          <p className="text-muted-dark mt-2 text-center text-sm">
            Insira suas credenciais para acessar o painel administrativo.
          </p>

          {/* Error message */}
          {error && (
            <div className="bg-danger/10 text-danger mt-6 flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <div className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-dark mb-1.5 block text-sm font-medium">
                E-mail
              </label>
              <div className="relative">
                <Mail className="text-muted absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@originalfilter.com"
                  className="border-surface-alt text-dark placeholder:text-muted focus:border-brand focus:ring-brand/20 h-11 w-full rounded-lg border bg-white pr-4 pl-10 text-sm transition-all outline-none focus:ring-2"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-dark mb-1.5 block text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <Lock className="text-muted absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-surface-alt text-dark placeholder:text-muted focus:border-brand focus:ring-brand/20 h-11 w-full rounded-lg border bg-white pr-11 pl-10 text-sm transition-all outline-none focus:ring-2"
                  required
                  autoComplete="current-password"
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

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="bg-brand text-dark hover:bg-brand-hover hover:shadow-brand/25 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="text-muted mt-8 text-center text-xs">
            &copy; {new Date().getFullYear()} Original Filter — Painel Admin
          </p>
        </div>
      </div>
    </div>
  );
}
