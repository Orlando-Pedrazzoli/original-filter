'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Produtos',
    href: '/admin/produtos',
    icon: Package,
  },
  {
    label: 'Pedidos',
    href: '/admin/pedidos',
    icon: ShoppingCart,
  },
  {
    label: 'Contatos',
    href: '/admin/contatos',
    icon: MessageSquare,
  },
  {
    label: 'Blog',
    href: '/admin/blog',
    icon: FileText,
  },
  {
    label: 'Utilizadores',
    href: '/admin/utilizadores',
    icon: Users,
  },
  {
    label: 'Configurações',
    href: '/admin/configuracoes',
    icon: Settings,
  },
];

export default function AdminSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo & Toggle */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <Image
            src="/images/logo-originalfilter.png"
            alt="Original Filter"
            width={120}
            height={48}
            className="h-8"
            style={{ width: 'auto' }}
          />
        )}
        {collapsed && (
          <span className="bg-brand text-dark mx-auto rounded px-1.5 py-0.5 text-xs font-black">
            OF
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/10 hover:text-white lg:flex"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-brand text-dark shadow-brand/20 shadow-md'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white',
                collapsed && 'justify-center px-2',
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  active ? 'text-dark' : 'group-hover:text-brand text-gray-500',
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <div className="mb-3 rounded-lg bg-white/5 px-3 py-2.5">
            <p className="text-sm font-medium text-white">{user.name || 'Admin'}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className={cn(
            'hover:bg-danger/10 hover:text-danger flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-all',
            collapsed && 'justify-center px-2',
          )}
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="bg-dark fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-lg lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'bg-dark-soft fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-3 rounded-lg p-1.5 text-gray-500 hover:text-white"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'bg-dark-soft hidden flex-col transition-all duration-300 lg:flex',
          collapsed ? 'w-[68px]' : 'w-64',
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
