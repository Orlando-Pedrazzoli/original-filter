/* ══════════════════════════════════════════
   AccountHeader — Original Filter
   ──────────────────────────────────────────
   Header da área /conta autenticada. Mostra:
   - Avatar (inicial do nome)
   - Nome + email
   - Badge de role (retail/reseller)
   - Tier de desconto (se reseller)
   - Botão de logout
   ══════════════════════════════════════════ */

import Link from 'next/link';
import { LogOutButton } from './logout-button';
import { UserRound, Briefcase, ChevronRight, Award } from 'lucide-react';

interface AccountHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
    discountTier?: number;
  };
}

export function AccountHeader({ user }: AccountHeaderProps) {
  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
  const isReseller = user.role === 'reseller';
  const tier = user.discountTier ?? 0;

  return (
    <header className="bg-brand-white border-brand-mist border-b">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-3 flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase">
          <Link href="/" className="text-brand-iron hover:text-brand-yellow-deep transition">
            Início
          </Link>
          <ChevronRight className="text-brand-mist size-3" />
          <span className="text-brand-black">Minha conta</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Avatar + nome + role */}
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="bg-brand-black text-brand-yellow font-display inline-flex size-12 shrink-0 items-center justify-center text-lg font-black md:size-14 md:text-xl"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              {initial}
            </div>

            <div className="min-w-0 flex-1">
              <h1
                className="font-display text-brand-black truncate leading-tight font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                  letterSpacing: '-0.025em',
                }}
              >
                {user.name || 'Bem-vindo'}
              </h1>
              <div className="text-brand-iron mt-0.5 truncate font-mono text-xs">{user.email}</div>

              {/* Badges */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {isReseller ? (
                  <>
                    <span
                      className="bg-brand-yellow text-brand-black inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase"
                      title="Conta de revendedor aprovada"
                    >
                      <Briefcase className="size-2.5" strokeWidth={3} />
                      Revendedor
                    </span>
                    {tier > 0 && (
                      <span className="bg-brand-black text-brand-yellow inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
                        <Award className="size-2.5" strokeWidth={2.5} />
                        {tier}% off B2B
                      </span>
                    )}
                  </>
                ) : (
                  <span className="bg-brand-snow text-brand-iron border-brand-mist inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
                    <UserRound className="size-2.5" strokeWidth={2.5} />
                    Cliente
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <LogOutButton />
        </div>
      </div>
    </header>
  );
}
