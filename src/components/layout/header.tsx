'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, Globe, ChevronDown } from 'lucide-react';
import { NAVIGATION, LANGUAGES } from '@/lib/constants';
import { cn } from '@/utils/cn';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
              className="h-12 w-auto sm:h-14"
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
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/produtos"
              className="hover:bg-dark-mid flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              aria-label="Buscar produtos"
            >
              <Search className="h-5 w-5" />
            </Link>

            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
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

            <Link
              href="/contato"
              className="bg-brand text-dark hover:bg-brand-hover rounded-lg px-5 py-2 text-sm font-bold transition-colors"
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

            <div className="border-dark-mid mt-4 border-t pt-4">
              <Link
                href="/contato"
                onClick={() => setMobileOpen(false)}
                className="bg-brand text-dark block w-full rounded-lg py-3 text-center text-sm font-bold"
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
