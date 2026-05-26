/* ══════════════════════════════════════════
   Navbar — Original Filter
   ──────────────────────────────────────────
   - Topbar técnica fina (institucional: localização, atendimento)
   - Faixa principal: logo + search inline + ações (login, revendedor)
   - Faixa de navegação: 6 links principais
   - Mobile: hamburger + drawer
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Menu,
  X,
  User,
  ShoppingCart,
  MapPin,
  Phone,
  Loader2,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import { useAutocomplete } from '@/hooks/use-autocomplete';
import type { AutocompleteSuggestion } from '@/lib/search-types';

const NAV_LINKS = [
  { label: 'Catálogo', href: '/produtos' },
  { label: 'Por veículo', href: '/buscar-por-veiculo' },
  { label: 'Cross-Reference', href: '/cross-reference' },
  { label: 'Lançamentos', href: '/lancamentos' },
  { label: 'Quem somos', href: '/sobre' },
  { label: 'Seja revendedor', href: '/seja-revendedor', highlight: true },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha menu ao mudar de rota
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Bloqueia scroll quando menu mobile aberto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* ─── Topbar institucional ─── */}
      <TopbarStrip />

      {/* ─── Faixa principal ─── */}
      <div className="border-brand-mist border-b">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-20 items-center gap-4 lg:gap-8">
            {/* Logo */}
            <Link href="/" className="group flex shrink-0 items-center gap-3">
              <div className="relative size-10 lg:size-12">
                <Image
                  src="/images/logo-originalfilter.png"
                  alt="Original Filter"
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden leading-none sm:block">
                <div
                  className="font-display text-brand-black font-black tracking-tight"
                  style={{ fontSize: '1.05rem', letterSpacing: '-0.02em' }}
                >
                  ORIGINAL FILTER
                </div>
                <div className="text-brand-yellow-deep font-display mt-0.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                  Especialista em Filtros e Sensores
                </div>
              </div>
            </Link>

            {/* Search inline — preenche o espaço central */}
            <div className="hidden min-w-0 flex-1 md:block">
              <SearchInline />
            </div>

            {/* Ações à direita */}
            <div className="flex shrink-0 items-center gap-1 lg:gap-2">
              <Link
                href="/conta"
                className="btn-ghost text-brand-iron hover:text-brand-black"
                aria-label="Minha conta"
              >
                <User className="size-5" strokeWidth={1.75} />
                <span className="hidden lg:inline">Conta</span>
              </Link>

              <Link
                href="/carrinho"
                className="btn-ghost text-brand-iron hover:text-brand-black relative"
                aria-label="Carrinho"
              >
                <ShoppingCart className="size-5" strokeWidth={1.75} />
                <span className="hidden lg:inline">Carrinho</span>
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="text-brand-black -mr-2 p-2 md:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="size-6" />
              </button>
            </div>
          </div>

          {/* Search visível em mobile (linha extra) */}
          <div className="pb-3 md:hidden">
            <SearchInline />
          </div>
        </div>
      </div>

      {/* ─── Faixa de navegação ─── */}
      <nav className="border-brand-mist bg-brand-snow hidden border-b md:block">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <ul className="flex h-11 items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`font-display relative inline-flex h-11 items-center px-3 text-xs font-semibold tracking-widest uppercase transition lg:px-4 ${
                      link.highlight
                        ? 'text-brand-black hover:text-brand-yellow-deep'
                        : active
                          ? 'text-brand-black'
                          : 'text-brand-iron hover:text-brand-black'
                    }`}
                  >
                    {link.highlight && (
                      <span className="bg-brand-yellow animate-pulse-yellow mr-2 size-1.5" />
                    )}
                    {link.label}
                    {active && (
                      <motion.div
                        layoutId="nav-active"
                        className="bg-brand-yellow absolute right-2 bottom-0 left-2 h-0.5"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* ─── Drawer mobile ─── */}
      <AnimatePresence>
        {mobileOpen && <MobileDrawer onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}

// ══════════════════════════════════════════
//   Topbar institucional
// ══════════════════════════════════════════
function TopbarStrip() {
  return (
    <div className="bg-brand-black text-xs text-white">
      <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-6">
          <span className="text-brand-mist hidden items-center gap-1.5 sm:inline-flex">
            <MapPin className="size-3" strokeWidth={2} />
            Cotia · São Paulo
          </span>
          <a
            href="tel:+551146133454"
            className="text-brand-mist hover:text-brand-yellow inline-flex items-center gap-1.5 transition"
          >
            <Phone className="size-3" strokeWidth={2} />
            Atendimento comercial
          </a>
        </div>
        <Link
          href="/seja-revendedor"
          className="text-brand-yellow hover:text-brand-yellow-bright hidden items-center gap-1 font-mono tracking-wide sm:inline-flex"
        >
          Programa de revendedores
          <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//   Search inline com autocomplete
// ══════════════════════════════════════════
function SearchInline() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions, loading } = useAutocomplete(query);

  // Fecha ao clicar fora
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/produtos?q=${encodeURIComponent(q)}`);
  }

  function handleSelect(sug: AutocompleteSuggestion) {
    setQuery('');
    setOpen(false);
    router.push(sug.href);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && selectedIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            className="text-brand-steel pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            strokeWidth={2}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setSelectedIdx(-1);
            }}
            onFocus={() => query.length >= 2 && setOpen(true)}
            onKeyDown={handleKey}
            placeholder="Busque por código (OFA2023C), produto ou marca..."
            spellCheck={false}
            autoComplete="off"
            className="bg-brand-snow border-brand-mist focus:border-brand-yellow placeholder:text-brand-steel w-full border py-2.5 pr-4 pl-10 text-sm font-medium transition placeholder:font-normal focus:bg-white"
            style={{ borderRadius: 'var(--radius-edge)' }}
          />
          {loading && (
            <Loader2 className="text-brand-steel absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin" />
          )}
        </div>
      </form>

      {/* Dropdown de sugestões */}
      <AnimatePresence>
        {open && query.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="border-brand-mist of-scroll absolute top-full right-0 left-0 z-50 mt-1 max-h-[28rem] overflow-y-auto border bg-white shadow-2xl"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            {suggestions.length === 0 && !loading ? (
              <div className="text-brand-steel p-4 text-sm">
                Nenhum resultado para <span className="font-mono">{query}</span>.
                <button
                  type="button"
                  onClick={() => router.push(`/produtos?q=${encodeURIComponent(query)}`)}
                  className="text-brand-black hover:text-brand-yellow-deep mt-2 block underline underline-offset-2"
                >
                  Ver busca completa →
                </button>
              </div>
            ) : (
              <ul>
                {suggestions.map((sug, i) => (
                  <li key={`${sug.kind}-${sug.label}-${i}`}>
                    <button
                      type="button"
                      onClick={() => handleSelect(sug)}
                      onMouseEnter={() => setSelectedIdx(i)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                        selectedIdx === i ? 'bg-brand-snow' : ''
                      }`}
                    >
                      <KindBadge kind={sug.kind} />
                      <div className="min-w-0 flex-1">
                        <div className="text-brand-black truncate text-sm font-medium">
                          {sug.kind === 'sku' ? (
                            <span className="font-mono">{sug.label}</span>
                          ) : (
                            sug.label
                          )}
                        </div>
                        {sug.caption && (
                          <div className="text-brand-steel truncate text-xs">{sug.caption}</div>
                        )}
                      </div>
                      <ChevronRight className="text-brand-steel size-4 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KindBadge({ kind }: { kind: AutocompleteSuggestion['kind'] }) {
  const labels: Record<typeof kind, string> = {
    sku: 'SKU',
    product: 'PROD',
    brand: 'MARCA',
    category: 'CAT',
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest ${
        kind === 'sku'
          ? 'bg-brand-yellow text-brand-black'
          : 'bg-brand-snow text-brand-iron border-brand-mist border'
      }`}
    >
      {labels[kind]}
    </span>
  );
}

// ══════════════════════════════════════════
//   Mobile drawer
// ══════════════════════════════════════════
function MobileDrawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 md:hidden"
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="fixed top-0 right-0 bottom-0 z-50 flex w-[85vw] max-w-sm flex-col bg-white md:hidden"
      >
        <div className="border-brand-mist flex items-center justify-between border-b p-5">
          <span className="font-display text-sm font-bold tracking-widest uppercase">Menu</span>
          <button type="button" onClick={onClose} className="-mr-2 p-2" aria-label="Fechar menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`of-mark font-display block px-2 py-3 text-base font-semibold tracking-wide uppercase transition ${
                link.highlight
                  ? 'text-brand-yellow-deep'
                  : 'text-brand-black hover:text-brand-yellow-deep'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-brand-mist bg-brand-snow space-y-3 border-t p-5">
          <Link href="/conta" className="text-brand-iron flex items-center gap-3 text-sm">
            <User className="size-4" />
            Minha conta
          </Link>
          <Link href="/carrinho" className="text-brand-iron flex items-center gap-3 text-sm">
            <ShoppingCart className="size-4" />
            Carrinho
          </Link>
          <div className="border-brand-mist border-t pt-3">
            <div className="text-brand-steel mb-1 text-[10px] tracking-widest uppercase">
              Atendimento
            </div>
            <a
              href="tel:+551146133454"
              className="text-brand-black flex items-center gap-2 font-mono text-sm"
            >
              <Phone className="size-3.5" />
              +55 11 4613-3454
            </a>
            <div className="text-brand-steel mt-1 flex items-center gap-2 text-xs">
              <MapPin className="size-3" />
              Cotia · São Paulo
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
