/* ══════════════════════════════════════════
   /conta/cadastro — Criar nova conta
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { RegisterForm } from './register-form';
import { AccountAuthLayout } from '@/components/account/account-auth-layout';

export const metadata: Metadata = {
  title: 'Criar conta — Original Filter',
  description: 'Crie sua conta gratuita para acompanhar pedidos e receber benefícios.',
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === 'admin' ? '/admin' : '/conta');
  }

  return (
    <AccountAuthLayout
      title="Criar conta"
      subtitle="Leva menos de 1 minuto. Cadastro gratuito."
      footerText="Já tem conta?"
      footerLinkText="Entrar"
      footerLinkHref="/conta/login"
    >
      <RegisterForm />
    </AccountAuthLayout>
  );
}
