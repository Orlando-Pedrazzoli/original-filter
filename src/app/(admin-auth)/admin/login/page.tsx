// src/app/(admin-auth)/admin/login/page.tsx
/* ══════════════════════════════════════════
   /admin/login — Login do painel administrativo
   ──────────────────────────────────────────
   Tela dedicada do admin (diferente do /conta/login do cliente).

   Visual industrial dark com:
   - Fundo preto com grid blueprint
   - Card central de login amarelo
   - Tipografia industrial-editorial

   Se já está logado como admin, redireciona automaticamente para /admin.
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import Image from 'next/image';
import { auth } from '@/lib/auth';
import { LoginForm } from './login-form';
import { O_PATTERN_DARK } from '@/lib/brand-pattern';

export const metadata: Metadata = {
  title: 'Painel Administrativo — Original Filter',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  // Se já está autenticado como admin, redireciona
  const session = await auth();
  if (session?.user?.role === 'admin') {
    redirect('/admin');
  }

  const sp = await searchParams;
  const callbackUrl =
    sp.callbackUrl && sp.callbackUrl.startsWith('/admin') ? sp.callbackUrl : '/admin';
  const error = sp.error;

  return (
    <main className="bg-brand-black relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 text-white">
      {/* Grid blueprint sutil */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={O_PATTERN_DARK} />

      {/* Faixa amarela vertical no canto esquerdo */}
      <div className="bg-brand-yellow absolute top-0 bottom-0 left-0 hidden w-1 lg:block" />

      <div className="relative w-full max-w-md">
        {/* Logo + voltar ao site */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="hover:text-brand-yellow inline-flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/40 uppercase transition"
          >
            <ArrowLeft className="size-3" />
            Voltar ao site
          </Link>
          <Image
            src="/images/logo-originalfilter.png"
            alt="Original Filter"
            width={90}
            height={36}
            className="h-7 w-auto opacity-80"
          />
        </div>

        {/* Card de login */}
        <div
          className="bg-brand-graphite border border-white/10 p-8 md:p-10"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-brand-yellow text-brand-black flex size-10 items-center justify-center">
                <ShieldCheck className="size-5" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-brand-yellow font-mono text-[10px] tracking-[0.22em] uppercase">
                  Acesso restrito
                </div>
                <div className="mt-0.5 font-mono text-[9px] tracking-widest text-white/40 uppercase">
                  Painel administrativo
                </div>
              </div>
            </div>

            <h1
              className="font-display leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(1.875rem, 4vw, 2.5rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Entrar no
              <br />
              <span className="text-brand-yellow">painel.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Identifique-se com suas credenciais administrativas.
            </p>
          </div>

          {/* Erro vindo do NextAuth (callback) */}
          {error && (
            <div
              className="mb-5 border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-200"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <strong>Erro no login:</strong>{' '}
              {error === 'CredentialsSignin' ? 'Email ou senha incorretos.' : error}
            </div>
          )}

          {/* Form */}
          <LoginForm callbackUrl={callbackUrl} />
        </div>

        {/* Footer info */}
        <div className="mt-6 flex items-center justify-center gap-2 font-mono text-[10px] tracking-widest text-white/30 uppercase">
          <Lock className="size-3" strokeWidth={2} />
          Conexão segura · sessão JWT 7 dias
        </div>
      </div>
    </main>
  );
}
