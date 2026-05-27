/* ══════════════════════════════════════════
   /conta/login — Login do cliente
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LoginForm } from './login-form';
import { AccountAuthLayout } from '@/components/account/account-auth-layout';

export const metadata: Metadata = {
  title: 'Entrar — Original Filter',
  description: 'Acesse sua conta para acompanhar pedidos e aproveitar preços B2B.',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await auth();
  const sp = await searchParams;

  // Já logado → redireciona
  if (session?.user) {
    if (session.user.role === 'admin') {
      redirect('/admin');
    }
    redirect(sp.redirect || '/conta');
  }

  return (
    <AccountAuthLayout title="Entrar" subtitle="Acompanhe seus pedidos e desfrute do programa B2B.">
      <LoginForm redirectTo={sp.redirect} initialError={sp.error} />
    </AccountAuthLayout>
  );
}
