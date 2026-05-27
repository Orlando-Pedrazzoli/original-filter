/* ══════════════════════════════════════════
   AccountSidebar — Original Filter
   ──────────────────────────────────────────
   Menu lateral da área da conta.
   Desktop: stack vertical.
   Mobile: scroll horizontal.
   ══════════════════════════════════════════ */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UserRound, MapPin, ShoppingBag, Briefcase } from 'lucide-react';

interface MenuItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Mostra label "em breve" */
  soon?: boolean;
  /** Mostra apenas para revendedores */
  resellerOnly?: boolean;
}

const MENU: MenuItem[] = [
  { href: '/conta', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/conta/perfil', label: 'Perfil', icon: UserRound },
  { href: '/conta/enderecos', label: 'Endereços', icon: MapPin },
  { href: '/conta/pedidos', label: 'Pedidos', icon: ShoppingBag, soon: true },
  {
    href: '/conta/b2b',
    label: 'Programa B2B',
    icon: Briefcase,
    resellerOnly: true,
    soon: true,
  },
];

export function AccountSidebar({ role }: { role?: string }) {
  const pathname = usePathname();

  const items = MENU.filter((item) => !item.resellerOnly || role === 'reseller');

  return (
    <nav
      className="bg-brand-white border-brand-mist overflow-hidden border"
      style={{ borderRadius: 'var(--radius-edge)' }}
      aria-label="Navegação da conta"
    >
      {/* Header */}
      <div className="border-brand-mist bg-brand-snow border-b px-4 py-3">
        <div className="text-brand-iron font-mono text-[10px] font-bold tracking-[0.22em] uppercase">
          Minha conta
        </div>
      </div>

      {/* Items — mobile: horizontal scroll | desktop: vertical */}
      <div className="flex overflow-x-auto lg:flex-col lg:overflow-visible">
        {items.map((item) => {
          const Icon = item.icon;
          // Visão geral usa match exato. Outras usam startsWith.
          const isActive =
            item.href === '/conta' ? pathname === '/conta' : pathname.startsWith(item.href);

          if (item.soon) {
            return (
              <div
                key={item.href}
                className="text-brand-mist border-brand-mist flex shrink-0 cursor-not-allowed items-center gap-3 px-4 py-3 text-sm last:border-b-0 lg:border-b"
                title="Em breve"
              >
                <Icon className="size-4 shrink-0" strokeWidth={2} />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <span className="text-brand-mist bg-brand-snow hidden px-1.5 py-0.5 font-mono text-[9px] tracking-widest uppercase lg:inline">
                  Em breve
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`border-brand-mist relative flex shrink-0 items-center gap-3 px-4 py-3 text-sm transition last:border-b-0 lg:border-b ${
                isActive
                  ? 'bg-brand-yellow/10 text-brand-black font-display font-bold'
                  : 'text-brand-iron hover:text-brand-black hover:bg-brand-snow'
              }`}
            >
              {/* Faixa amarela à esquerda quando ativo */}
              {isActive && (
                <span className="bg-brand-yellow absolute top-0 bottom-0 left-0 hidden w-1 lg:block" />
              )}
              <Icon
                className={`size-4 shrink-0 ${isActive ? 'text-brand-yellow-deep' : ''}`}
                strokeWidth={2}
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
