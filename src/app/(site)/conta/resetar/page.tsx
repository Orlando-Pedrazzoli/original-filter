/* ══════════════════════════════════════════
   /conta/resetar — Definir nova senha
   ──────────────────────────────────────────
   Recebe ?token=...&email=... da URL e renderiza
   o form pra criar nova senha.
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { ResetPasswordForm } from './reset-password-form';
import { AccountAuthLayout } from '@/components/account/account-auth-layout';

export const metadata: Metadata = {
  title: 'Nova senha — Original Filter',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const token = sp.token?.trim();
  const email = sp.email?.trim().toLowerCase();

  // Se faltar token ou email, mostra estado de erro
  if (!token || !email) {
    return (
      <AccountAuthLayout
        title="Link inválido"
        subtitle="Não foi possível identificar a solicitação de recuperação."
      >
        <div className="space-y-5 text-center">
          <div className="inline-flex size-14 items-center justify-center bg-red-100 text-red-700">
            <AlertTriangle className="size-7" strokeWidth={2} />
          </div>
          <div>
            <h3
              className="font-display text-brand-black mb-2 leading-tight font-black"
              style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)' }}
            >
              Link incompleto
            </h3>
            <p className="text-brand-iron text-sm leading-relaxed">
              O link de recuperação parece estar quebrado ou foi alterado. Solicite um novo.
            </p>
          </div>
          <Link
            href="/conta/recuperar"
            className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wide uppercase transition"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <ArrowLeft className="size-3.5" />
            Solicitar novo link
          </Link>
        </div>
      </AccountAuthLayout>
    );
  }

  return (
    <AccountAuthLayout
      title="Nova senha"
      subtitle={`Crie uma nova senha para ${email}. Pelo menos 8 caracteres.`}
      footerText="Mudou de ideia?"
      footerLinkText="Voltar para o login"
      footerLinkHref="/conta/login"
    >
      <ResetPasswordForm token={token} email={email} />
    </AccountAuthLayout>
  );
}
