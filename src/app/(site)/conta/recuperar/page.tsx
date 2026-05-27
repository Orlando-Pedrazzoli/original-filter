/* ══════════════════════════════════════════
   /conta/recuperar — Esqueci minha senha
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { ForgotPasswordForm } from './forgot-password-form';
import { AccountAuthLayout } from '@/components/account/account-auth-layout';

export const metadata: Metadata = {
  title: 'Recuperar senha — Original Filter',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AccountAuthLayout
      title="Recuperar senha"
      subtitle="Informe seu email cadastrado. Enviaremos um link para criar uma nova senha."
      footerText="Lembrou da senha?"
      footerLinkText="Voltar para o login"
      footerLinkHref="/conta/login"
    >
      <ForgotPasswordForm />
    </AccountAuthLayout>
  );
}
