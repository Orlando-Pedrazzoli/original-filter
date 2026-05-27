/* ══════════════════════════════════════════
   AdminSidebar — Original Filter
   ──────────────────────────────────────────
   Sidebar lateral fixa preta (igual o footer).
   Navegação organizada em grupos lógicos.
   Estado ativo destacado com faixa amarela.

   Responsiva: em mobile vira drawer (overlay).
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Sparkles,
  Tags,
  Users,
  ClipboardList,
  ShoppingBag,
  Settings,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: 'soon' | 'beta';
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Visão geral',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Catálogo',
    items: [
      { href: '/admin/produtos', label: 'Produtos', icon: Package },
      { href: '/admin/lancamentos', label: 'Lançamentos', icon: Sparkles },
      { href: '/admin/marcas', label: 'Marcas', icon: Tags },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
      { href: '/admin/clientes', label: 'Clientes', icon: Users, badge: 'soon' },
      { href: '/admin/revendedores', label: 'Revendedores', icon: ClipboardList },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/admin/configuracoes', label: 'Configurações', icon: Settings, badge: 'soon' },
    ],
  },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ─── Mobile menu button (visível só em mobile) ─── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="bg-brand-black text-brand-yellow fixed top-4 left-4 z-40 flex size-10 items-center justify-center lg:hidden"
        style={{ borderRadius: 'var(--radius-edge)' }}
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      {/* ─── Backdrop mobile ─── */}
      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Fechar menu"
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`bg-brand-black fixed top-0 left-0 z-50 flex h-screen w-72 flex-col text-white transition-transform duration-200 lg:sticky lg:z-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header com logo + close (mobile) */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
          <Link
            href="/admin"
            className="group inline-flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <Image
              src="/images/logo-originalfilter.png"
              alt="Original Filter"
              width={100}
              height={40}
              className="h-8 w-auto"
            />
            <div className="leading-none">
              <div className="text-brand-yellow font-mono text-[9px] tracking-[0.22em] uppercase">
                Painel administrativo
              </div>
              <div className="mt-0.5 font-mono text-[10px] tracking-widest text-white/40 uppercase">
                Original Filter
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex size-8 items-center justify-center text-white/60 hover:text-white lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
          {NAV_GROUPS.map((group) => (
            <SidebarGroup key={group.label} group={group} onNavigate={() => setMobileOpen(false)} />
          ))}
        </nav>

        {/* Footer da sidebar: link "ir ao site" + email */}
        <div className="shrink-0 space-y-3 border-t border-white/10 px-4 py-4">
          <Link
            href="/"
            target="_blank"
            className="hover:text-brand-yellow flex items-center gap-2.5 px-3 py-2 text-xs text-white/60 transition"
          >
            <ExternalLink className="size-3.5" strokeWidth={2} />
            Ver site público
          </Link>

          <div className="px-3 py-2">
            <div className="mb-0.5 font-mono text-[9px] tracking-widest text-white/40 uppercase">
              Logado como
            </div>
            <div className="truncate font-mono text-xs text-white/80" title={userEmail}>
              {userEmail}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Grupo de navegação ───
function SidebarGroup({ group, onNavigate }: { group: NavGroup; onNavigate: () => void }) {
  return (
    <div>
      <div className="mb-2 px-3 font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">
        {group.label}
      </div>
      <ul className="space-y-0.5">
        {group.items.map((item) => (
          <li key={item.href}>
            <NavLink item={item} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Link individual ───
function NavLink({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
  const isDisabled = item.badge === 'soon';
  const Icon = item.icon;

  const content = (
    <>
      {/* Faixa amarela à esquerda quando ativo */}
      {isActive && (
        <span className="bg-brand-yellow absolute top-1 bottom-1 left-0 w-1" aria-hidden="true" />
      )}

      <Icon
        className={`size-4 shrink-0 transition ${
          isActive
            ? 'text-brand-yellow'
            : isDisabled
              ? 'text-white/20'
              : 'group-hover:text-brand-yellow text-white/60'
        }`}
        strokeWidth={2}
      />

      <span
        className={`flex-1 truncate transition ${
          isActive
            ? 'font-semibold text-white'
            : isDisabled
              ? 'text-white/30'
              : 'text-white/70 group-hover:text-white'
        }`}
      >
        {item.label}
      </span>

      {item.badge === 'soon' && (
        <span className="bg-white/5 px-1.5 py-0.5 font-mono text-[8px] tracking-widest text-white/30 uppercase">
          em breve
        </span>
      )}
      {item.badge === 'beta' && (
        <span className="text-brand-black bg-brand-yellow px-1.5 py-0.5 font-mono text-[8px] tracking-widest uppercase">
          beta
        </span>
      )}

      {!isDisabled && (
        <ChevronRight
          className={`size-3 shrink-0 transition ${
            isActive ? 'text-brand-yellow' : 'text-white/20'
          }`}
        />
      )}
    </>
  );

  if (isDisabled) {
    return (
      <div
        className="group relative flex cursor-not-allowed items-center gap-3 px-3 py-2.5"
        title="Em construção"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="group relative flex items-center gap-3 px-3 py-2.5 transition hover:bg-white/5"
    >
      {content}
    </Link>
  );
}
