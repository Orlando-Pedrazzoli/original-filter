/* ══════════════════════════════════════════
   AdminTopbar — Original Filter
   ──────────────────────────────────────────
   Topbar do painel admin com:
   - Breadcrumb dinâmico (deriva do pathname)
   - User menu (avatar, nome, role, logout)

   Visual: branco com border-bottom amarela
   sticky no topo durante scroll.
   ══════════════════════════════════════════ */

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ChevronRight, User, LogOut, Loader2 } from 'lucide-react';

interface AdminTopbarProps {
  userEmail: string;
  userName?: string;
}

// ─── Mapa de labels para breadcrumb ───
const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Admin',
  produtos: 'Produtos',
  lancamentos: 'Lançamentos',
  marcas: 'Marcas',
  pedidos: 'Pedidos',
  clientes: 'Clientes',
  revendedores: 'Revendedores',
  configuracoes: 'Configurações',
  novo: 'Novo',
  editar: 'Editar',
};

export function AdminTopbar({ userEmail, userName }: AdminTopbarProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="bg-brand-white border-brand-mist sticky top-0 z-30 border-b">
      <div className="border-brand-yellow border-b-2" aria-hidden="true" />
      <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-8">
        {/* Breadcrumb */}
        <nav
          className="flex min-w-0 items-center gap-1.5 pl-14 font-mono text-xs tracking-widest uppercase lg:pl-0"
          aria-label="Trilha de navegação"
        >
          {segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            const href = '/' + segments.slice(0, i + 1).join('/');
            const label = SEGMENT_LABELS[seg] ?? seg;

            return (
              <span key={href} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight className="text-brand-mist size-3 shrink-0" aria-hidden="true" />
                )}
                {isLast ? (
                  <span className="text-brand-black truncate font-bold">{label}</span>
                ) : (
                  <Link
                    href={href}
                    className="text-brand-iron hover:text-brand-yellow-deep truncate transition"
                  >
                    {label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>

        {/* User menu */}
        <UserMenu userEmail={userEmail} userName={userName} />
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════
//   User Menu (dropdown)
// ═══════════════════════════════════════════
function UserMenu({ userEmail, userName }: { userEmail: string; userName?: string }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Iniciais para o avatar
  const initials = (userName || userEmail)
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: '/admin/login' });
  }

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hover:bg-brand-snow flex items-center gap-2.5 py-1 pr-3 pl-1 transition"
        style={{ borderRadius: 'var(--radius-edge)' }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="bg-brand-yellow text-brand-black font-display flex size-8 shrink-0 items-center justify-center text-xs font-black">
          {initials || '?'}
        </span>
        <span className="hidden flex-col items-start leading-tight sm:flex">
          {userName && (
            <span className="font-display text-brand-black max-w-[140px] truncate text-xs font-semibold">
              {userName}
            </span>
          )}
          <span className="text-brand-iron font-mono text-[10px] tracking-widest uppercase">
            Admin
          </span>
        </span>
      </button>

      {open && (
        <div
          className="bg-brand-white border-brand-mist absolute top-full right-0 z-40 mt-1 w-64 overflow-hidden border shadow-lg"
          style={{ borderRadius: 'var(--radius-edge)' }}
          role="menu"
        >
          {/* Header com info do usuário */}
          <div className="border-brand-mist bg-brand-snow border-b p-4">
            <div className="flex items-center gap-3">
              <span className="bg-brand-yellow text-brand-black font-display flex size-10 shrink-0 items-center justify-center font-black">
                {initials || '?'}
              </span>
              <div className="min-w-0">
                {userName && (
                  <div className="font-display text-brand-black truncate text-sm font-bold">
                    {userName}
                  </div>
                )}
                <div className="text-brand-iron truncate font-mono text-xs">{userEmail}</div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="py-1">
            <button
              type="button"
              disabled={signingOut}
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
            >
              {signingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" strokeWidth={2} />
              )}
              {signingOut ? 'Saindo...' : 'Sair do painel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
