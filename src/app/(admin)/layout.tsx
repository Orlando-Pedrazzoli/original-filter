/* ══════════════════════════════════════════
   Layout — Route Group (admin)
   ──────────────────────────────────────────
   Layout próprio do painel admin, separado do site público.
   - Sidebar lateral fixa
   - Topbar com breadcrumb + user menu
   - Main área com background snow para conteúdo

   Guard de acesso:
   - Não autenticado → redirect /admin/login (também feito pelo middleware)
   - Autenticado mas role !== 'admin' → mostra tela amigável de acesso negado
   - /admin/login NÃO usa este layout (tem layout próprio dentro da pasta)

   IMPORTANTE: este layout aplica para TUDO em (admin) EXCETO /admin/login,
   que tem seu próprio layout sem sidebar.
   ══════════════════════════════════════════ */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { auth } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { AdminToastProvider } from '@/components/admin/admin-toast';

export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Middleware já redireciona não-autenticados.
  // Se chegou aqui sem session, é caso de borda (cache antigo) — redirect defensivo.
  if (!session?.user) {
    redirect('/admin/login');
  }

  // Validação de role no servidor (não confia em token JWT desatualizado)
  if (session.user.role !== 'admin') {
    return (
      <div className="bg-brand-snow flex min-h-screen items-center justify-center px-4 py-20">
        <div
          className="bg-brand-white border-brand-mist w-full max-w-md border p-8 text-center"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <ShieldAlert className="text-brand-yellow-deep mx-auto mb-4 size-12" strokeWidth={1.5} />
          <div className="text-brand-iron mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
            Acesso restrito
          </div>
          <h1
            className="font-display text-brand-black mb-3 font-black"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              letterSpacing: '-0.025em',
            }}
          >
            Você não é administrador.
          </h1>
          <p className="text-brand-iron mb-6 leading-relaxed">
            Sua conta está conectada como{' '}
            <strong className="text-brand-black break-all">{session.user.email}</strong> mas não tem
            permissão para acessar o painel administrativo.
          </p>
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Link
              href="/"
              className="bg-brand-black hover:bg-brand-graphite font-display inline-flex items-center justify-center px-5 py-3 text-xs font-semibold tracking-wide text-white uppercase transition"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              Voltar ao site
            </Link>
            <Link
              href="/conta"
              className="border-brand-mist hover:border-brand-iron font-display text-brand-iron inline-flex items-center justify-center border px-5 py-3 text-xs font-semibold tracking-wide uppercase transition"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              Minha conta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminToastProvider>
      <div className="bg-brand-snow flex min-h-screen">
        <AdminSidebar userEmail={session.user.email ?? ''} />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar
            userEmail={session.user.email ?? ''}
            userName={session.user.name ?? undefined}
          />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminToastProvider>
  );
}
