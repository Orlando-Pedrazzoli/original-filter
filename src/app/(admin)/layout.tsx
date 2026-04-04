/* ══════════════════════════════════════════
   Original Filter — Admin Layout
   ══════════════════════════════════════════
   IMPORTANTE: A página de login do admin (/admin/login)
   fica FORA deste route group, em src/app/admin/login/page.tsx
   para evitar o loop infinito de redirecionamento.
   ══════════════════════════════════════════ */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from '@/components/admin/sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Sem sessão → redireciona para login (que está FORA deste layout)
  if (!session?.user) {
    redirect('/admin/login');
  }

  // Não é admin → redireciona para home
  if ((session.user as { role?: string }).role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="bg-surface flex min-h-screen">
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
