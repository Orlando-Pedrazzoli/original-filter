'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import {
  Menu,
  X,
  Search,
  Globe,
  ChevronDown,
  User,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  ShoppingCart,
  ClipboardList,
  Heart,
  UserCog,
} from 'lucide-react';
import { NAVIGATION, LANGUAGES } from '@/lib/constants';
import { cn } from '@/utils/cn';

// Close dropdown when clicking outside
function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function listener(e: MouseEvent) {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    }
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

export default function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useClickOutside(langRef, () => setLangOpen(false));
  useClickOutside(userRef, () => setUserOpen(false));

  const isLoggedIn = !!session?.user;
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';

  return (
    <header className="bg-dark sticky top-0 z-50 w-full text-white">
      <div className="bg-brand h-1 w-full" />

      <div className="container-custom">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/logo-originalfilter.png"
              alt="Original Filter"
              width={140}
              height={56}
              className="h-12 sm:h-14"
              style={{ width: 'auto' }}
              priority
            />
          </Link>

          {/* Nav — Desktop */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAVIGATION.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'hover:text-brand flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors',
                    activeDropdown === item.label && 'text-brand',
                  )}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        activeDropdown === item.label && 'rotate-180',
                      )}
                    />
                  )}
                </Link>

                {item.children && activeDropdown === item.label && (
                  <div className="border-dark-mid bg-dark-soft absolute top-full left-0 z-50 min-w-[240px] rounded-b-lg border py-2 shadow-2xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="hover:bg-dark-mid hover:text-brand block px-4 py-2.5 text-sm text-gray-300 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions — Desktop */}
          <div className="hidden items-center gap-2 lg:flex">
            {/* Search */}
            <Link
              href="/produtos"
              className="hover:bg-dark-mid flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              aria-label="Buscar produtos"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Language */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => {
                  setLangOpen(!langOpen);
                  setUserOpen(false);
                }}
                className="hover:bg-dark-mid flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                aria-label="Selecionar idioma"
              >
                <Globe className="h-5 w-5" />
              </button>

              {langOpen && (
                <div className="border-dark-mid bg-dark-soft absolute top-full right-0 z-50 mt-2 min-w-[160px] rounded-lg border py-2 shadow-2xl">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLangOpen(false)}
                      className="hover:bg-dark-mid hover:text-brand flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-300 transition-colors"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account (Customer) */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => {
                  setUserOpen(!userOpen);
                  setLangOpen(false);
                }}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                  isLoggedIn ? 'bg-white/10 text-white hover:bg-white/20' : 'hover:bg-dark-mid',
                )}
                aria-label={isLoggedIn ? 'Minha conta' : 'Entrar'}
              >
                <User className="h-5 w-5" />
              </button>

              {userOpen && (
                <div className="border-dark-mid bg-dark-soft absolute top-full right-0 z-50 mt-2 min-w-[220px] rounded-lg border shadow-2xl">
                  {isLoggedIn ? (
                    <>
                      {/* User info */}
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="text-sm font-medium text-white">{session.user?.name}</p>
                        <p className="truncate text-xs text-gray-500">{session.user?.email}</p>
                      </div>

                      {/* Customer links */}
                      <div className="py-1">
                        <Link
                          href="/minha-conta"
                          onClick={() => setUserOpen(false)}
                          className="hover:bg-dark-mid hover:text-brand flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 transition-colors"
                        >
                          <UserCog className="h-4 w-4" />
                          Minha Conta
                        </Link>
                        <Link
                          href="/meus-pedidos"
                          onClick={() => setUserOpen(false)}
                          className="hover:bg-dark-mid hover:text-brand flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 transition-colors"
                        >
                          <ClipboardList className="h-4 w-4" />
                          Meus Pedidos
                        </Link>
                        <Link
                          href="/favoritos"
                          onClick={() => setUserOpen(false)}
                          className="hover:bg-dark-mid hover:text-brand flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                          Favoritos
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-white/10 py-1">
                        <button
                          onClick={() => {
                            setUserOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="hover:bg-danger/10 hover:text-danger flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sair
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4">
                      <p className="mb-3 text-sm text-gray-400">
                        Acesse sua conta para ver pedidos e favoritos.
                      </p>
                      <Link
                        href="/admin/login"
                        onClick={() => setUserOpen(false)}
                        className="bg-brand text-dark hover:bg-brand-hover block w-full rounded-lg py-2.5 text-center text-sm font-bold transition-colors"
                      >
                        Entrar
                      </Link>
                      <p className="mt-3 text-center text-xs text-gray-500">
                        Novo cliente?{' '}
                        <Link
                          href="/registrar"
                          onClick={() => setUserOpen(false)}
                          className="text-brand hover:underline"
                        >
                          Criar conta
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin Panel (only visible for admins) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="bg-brand/15 text-brand hover:bg-brand/25 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                aria-label="Painel Admin"
                title="Painel Admin"
              >
                <ShieldCheck className="h-5 w-5" />
              </Link>
            )}

            {/* Cart (future) */}
            <Link
              href="/carrinho"
              className="hover:bg-dark-mid relative flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              aria-label="Carrinho"
            >
              <ShoppingCart className="h-5 w-5" />
              {/* Badge - uncomment when cart has items */}
              {/* <span className="bg-brand text-dark absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">3</span> */}
            </Link>

            {/* CTA */}
            <Link
              href="/contato"
              className="bg-brand text-dark hover:bg-brand-hover ml-1 rounded-lg px-5 py-2 text-sm font-bold transition-colors"
            >
              Orçamento
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-dark-mid bg-dark-soft border-t lg:hidden">
          <nav className="container-custom py-4">
            {NAVIGATION.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => !item.children && setMobileOpen(false)}
                  className="hover:text-brand block py-3 text-base font-medium text-white transition-colors"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="border-dark-mid mb-2 ml-4 border-l pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="hover:text-brand block py-2 text-sm text-gray-400 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile: User & Admin section */}
            <div className="border-dark-mid mt-4 space-y-2 border-t pt-4">
              {isLoggedIn ? (
                <>
                  <p className="px-1 text-xs text-gray-500">{session.user?.name}</p>

                  <Link
                    href="/minha-conta"
                    onClick={() => setMobileOpen(false)}
                    className="hover:text-brand flex items-center gap-2 py-2 text-sm text-gray-300"
                  >
                    <User className="h-4 w-4" />
                    Minha Conta
                  </Link>

                  <Link
                    href="/meus-pedidos"
                    onClick={() => setMobileOpen(false)}
                    className="hover:text-brand flex items-center gap-2 py-2 text-sm text-gray-300"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Meus Pedidos
                  </Link>

                  <Link
                    href="/carrinho"
                    onClick={() => setMobileOpen(false)}
                    className="hover:text-brand flex items-center gap-2 py-2 text-sm text-gray-300"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Carrinho
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="text-brand flex items-center gap-2 py-2 text-sm font-medium"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Painel Admin
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="hover:text-danger flex items-center gap-2 py-2 text-sm text-gray-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm text-gray-300 hover:text-white"
                >
                  <User className="h-4 w-4" />
                  Entrar
                </Link>
              )}

              <Link
                href="/contato"
                onClick={() => setMobileOpen(false)}
                className="bg-brand text-dark mt-3 block w-full rounded-lg py-3 text-center text-sm font-bold"
              >
                Solicitar Orçamento
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
