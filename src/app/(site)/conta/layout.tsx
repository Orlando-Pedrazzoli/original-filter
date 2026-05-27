/* ══════════════════════════════════════════
   /conta/layout.tsx — Layout da área da conta
   ══════════════════════════════════════════
   Estratégia simples:
   - Se NÃO há sessão → renderiza apenas children (login/cadastro/etc cuidam do próprio layout)
   - Se HÁ sessão → renderiza com header + sidebar de conta

   O middleware já protege as rotas privadas (/conta, /conta/perfil, etc),
   então um usuário sem sessão tentando acessar essas rotas é redirecionado
   para /conta/login pelo middleware antes mesmo de chegar aqui.

   IMPORTANTE: admin acessando /conta vê área de conta normalmente. Se
   quisermos forçar admin pra /admin, descomentar o redirect.
   ══════════════════════════════════════════ */

import { auth } from '@/lib/auth';
import { AccountSidebar } from '@/components/account/account-sidebar';
import { AccountHeader } from '@/components/account/account-header';

export default async function ContaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Sem sessão → as próprias páginas (login/cadastro/recuperar/resetar)
  // têm layout próprio. Apenas passa adiante.
  if (!session?.user) {
    return <>{children}</>;
  }

  // Com sessão → área da conta com header + sidebar
  return (
    <div className="bg-brand-snow min-h-[calc(100vh-200px)]">
      <AccountHeader user={session.user} />

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-3">
            <AccountSidebar role={session.user.role} />
          </aside>

          <main className="min-w-0 lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
