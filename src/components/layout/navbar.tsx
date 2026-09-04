// src/components/layout/navbar.tsx
/* ══════════════════════════════════════════
   Navbar — Original Filter
   ──────────────────────────────────────────
   Reformulação UX (set/2026, pedido Gabriel):
   - Fundo PRETO como no site institucional original
   - Logo CENTRALIZADO na faixa principal
   - Sem announcement bar
   - Links espelhando a navegação do site atual
     (Original Filter ▾ · Política de Qualidade · Produtos ▾ ·
      Catálogo ▾ · Lançamentos · Sustentabilidade ▾ · Contato)
   - "Seja Revendedor" como CTA amarelo à direita
   - Busca com autocomplete preservada (variante dark),
     à esquerda no desktop e em linha própria no mobile
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  MapPin,
  Menu,
  Phone,
  Search,
  User,
  X,
} from 'lucide-react';
import { useAutocomplete } from '@/hooks/use-autocomplete';
import { LANGUAGES } from '@/lib/constants';
import type { AutocompleteSuggestion } from '@/lib/search-types';

// ─── Estrutura de navegação (espelha o site institucional original) ───
interface NavChild {
  label: string;
  href: string;
}
interface NavEntry {
  label: string;
  href: string;
  children?: NavChild[];
}

const NAV_ENTRIES: NavEntry[] = [
  {
    label: 'Original Filter',
    href: '/sobre',
    children: [
      { label: 'Sobre Nós', href: '/sobre' },
      { label: 'Política de Garantia', href: '/garantia' },
    ],
  },
  { label: 'Política de Qualidade', href: '/qualidade' },
  {
    label: 'Produtos',
    href: '/produtos',
    children: [
      { label: 'Filtro de Ar', href: '/produtos/categoria/filtro-de-ar' },
      { label: 'Filtro de Combustível', href: '/produtos/categoria/filtro-de-combustivel' },
      { label: 'Filtro de Óleo', href: '/produtos/categoria/filtro-de-oleo' },
      { label: 'Filtro Hidráulico', href: '/produtos/categoria/filtro-hidraulico' },
      { label: 'Filtro Separador', href: '/produtos/categoria/filtro-separador' },
      { label: 'Filtro Secador de Ar', href: '/produtos/categoria/filtro-secador-de-ar' },
      { label: 'Filtro de Água', href: '/produtos/categoria/filtro-de-agua' },
      { label: 'Filtro de Ureia (Arla)', href: '/produtos/categoria/filtro-de-ureia' },
      { label: 'Sensores', href: '/produtos?tipo=sensor' },
    ],
  },
  {
    label: 'Catálogo',
    href: '/produtos',
    children: [
      { label: 'Catálogo Completo', href: '/produtos' },
      { label: 'Cross-Reference', href: '/cross-reference' },
      { label: 'Buscar por Veículo', href: '/buscar-por-veiculo' },
    ],
  },
  { label: 'Lançamentos', href: '/lancamentos' },
  {
    label: 'Sustentabilidade',
    href: '/sustentabilidade',
    children: [
      { label: 'Política de Sustentabilidade', href: '/sustentabilidade' },
      { label: 'Logística Reversa', href: '/sustentabilidade#logistica' },
    ],
  },
  { label: 'Contato', href: '/contato' },
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

  // Logo: na home, rola suavemente até o topo (respeitando reduce-motion)
  function handleLogoClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === '/') {
      e.preventDefault();
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  }

  return (
    <header className="bg-brand-black sticky top-0 z-50">
      {/* ─── Faixa principal: busca | LOGO CENTRAL | ações ─── */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid min-h-24 grid-cols-[1fr_auto_1fr] items-center gap-4 py-3">
          {/* Esquerda: busca (desktop) / hambúrguer (mobile) */}
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="-ml-2 p-2 text-white md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-6" />
            </button>
            <div className="hidden w-full max-w-sm md:block">
              <SearchInline dark />
            </div>
          </div>

          {/* Centro: logo */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="group flex flex-col items-center gap-1"
            aria-label="Original Filter — Página inicial"
          >
            <div className="relative h-14 w-36 sm:h-16 sm:w-44 lg:h-[76px] lg:w-52">
              <Image
                src="/images/logo-of-header.png"
                alt="Original Filter"
                fill
                sizes="(min-width: 1024px) 208px, (min-width: 640px) 176px, 144px"
                className="object-contain"
                priority
                // Logo servido como asset estático, fora do otimizador da Vercel:
                // PNG de marca já otimizado + imune a limites de Image Optimization
                unoptimized
              />
            </div>
            <div className="text-brand-yellow font-display hidden text-[9px] leading-tight font-semibold tracking-[0.18em] uppercase transition-colors group-hover:text-white sm:block">
              Especialista em Filtros e Sensores
            </div>
          </Link>

          {/* Direita: idioma + conta */}
          <div className="flex items-center justify-end gap-1 lg:gap-2">
            <LanguageSwitcher />
            <Link
              href="/conta"
              className="hover:text-brand-yellow inline-flex items-center gap-2 p-2 text-sm text-white transition"
              aria-label="Minha conta"
            >
              <User className="size-5" strokeWidth={1.75} />
              <span className="hidden lg:inline">Conta</span>
            </Link>
          </div>
        </div>

        {/* Busca em mobile (linha própria) */}
        <div className="pb-3 md:hidden">
          <SearchInline dark />
        </div>
      </div>

      {/* ─── Faixa de navegação (desktop) ─── */}
      <nav className="hidden border-t border-white/10 md:block">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-12 items-center justify-between gap-2">
            <ul className="flex flex-1 items-center justify-center gap-0.5 lg:gap-1">
              {NAV_ENTRIES.map((entry) =>
                entry.children ? (
                  <li key={entry.label}>
                    <NavDropdown entry={entry} pathname={pathname} />
                  </li>
                ) : (
                  <li key={entry.href}>
                    <NavTopLink entry={entry} pathname={pathname} />
                  </li>
                ),
              )}
            </ul>

            {/* CTA revendedor */}
            <Link
              href="/seja-revendedor"
              className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright font-display inline-flex h-8 shrink-0 items-center px-4 text-[11px] font-bold tracking-widest uppercase transition"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              Seja Revendedor
            </Link>
          </div>
        </div>
      </nav>

      {/* Linha de assinatura amarela */}
      <div className="bg-brand-yellow h-0.5" />

      {/* ─── Drawer mobile ─── */}
      <AnimatePresence>
        {mobileOpen && <MobileDrawer onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}

// ══════════════════════════════════════════
//   Link simples da faixa de navegação
// ══════════════════════════════════════════
function NavTopLink({ entry, pathname }: { entry: NavEntry; pathname: string }) {
  const active = pathname === entry.href || (entry.href !== '/' && pathname.startsWith(entry.href));
  return (
    <Link
      href={entry.href}
      className={`font-display relative inline-flex h-12 items-center px-2.5 text-[11px] font-semibold tracking-widest uppercase transition lg:px-3 lg:text-xs ${
        active ? 'text-brand-yellow' : 'hover:text-brand-yellow text-white/85'
      }`}
    >
      {entry.label}
      {active && (
        <motion.div
          layoutId="nav-active"
          className="bg-brand-yellow absolute right-1 bottom-0 left-1 h-0.5"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
    </Link>
  );
}

// ══════════════════════════════════════════
//   Dropdown genérico (desktop)
// ══════════════════════════════════════════
function NavDropdown({ entry, pathname }: { entry: NavEntry; pathname: string }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (entry.children ?? []).some(
    (l) => pathname === l.href.split('#')[0] || pathname.startsWith(`${l.href.split('#')[0]}/`),
  );

  function handleEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`font-display relative inline-flex h-12 items-center gap-1 px-2.5 text-[11px] font-semibold tracking-widest uppercase transition lg:px-3 lg:text-xs ${
          isActive || open ? 'text-brand-yellow' : 'hover:text-brand-yellow text-white/85'
        }`}
      >
        {entry.label}
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2.5}
        />
        {isActive && (
          <motion.div
            layoutId="nav-active"
            className="bg-brand-yellow absolute right-1 bottom-0 left-1 h-0.5"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="border-brand-yellow bg-brand-black absolute top-full left-0 z-50 min-w-56 border-t-2 py-2 shadow-2xl"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <ul>
              {(entry.children ?? []).map((link) => {
                const active = pathname === link.href.split('#')[0];
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm transition ${
                        active
                          ? 'text-brand-yellow bg-white/5'
                          : 'hover:text-brand-yellow text-white/85 hover:bg-white/5'
                      }`}
                    >
                      {active && <span className="bg-brand-yellow size-1.5" />}
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════
//   Seletor de idioma (visual — troca de língua em breve)
// ══════════════════════════════════════════
//   Bandeiras em SVG inline: emojis de bandeira não renderizam
//   no Windows, e SVG dispensa dependências externas.

function FlagIcon({ code }: { code: string }) {
  const common = {
    width: 20,
    height: 14,
    viewBox: '0 0 20 14',
    'aria-hidden': true as const,
    style: { borderRadius: '2px', display: 'block' },
  };
  switch (code) {
    case 'pt': // Brasil
      return (
        <svg {...common}>
          <rect width="20" height="14" fill="#009C3B" />
          <path d="M10 1.5 18 7l-8 5.5L2 7z" fill="#FFDF00" />
          <circle cx="10" cy="7" r="3" fill="#002776" />
        </svg>
      );
    case 'en': // Estados Unidos
      return (
        <svg {...common}>
          <rect width="20" height="14" fill="#fff" />
          {[0, 2, 4, 6, 8, 10, 12].map((y) => (
            <rect key={y} y={y} width="20" height="1" fill="#B22234" />
          ))}
          <rect width="9" height="7" fill="#3C3B6E" />
        </svg>
      );
    case 'es': // Espanha
      return (
        <svg {...common}>
          <rect width="20" height="14" fill="#AA151B" />
          <rect y="3.5" width="20" height="7" fill="#F1BF00" />
        </svg>
      );
    case 'zh': // China
      return (
        <svg {...common}>
          <rect width="20" height="14" fill="#DE2910" />
          <path d="m4 2.2 1 3-2.6-1.9h3.2L3 5.2z" fill="#FFDE00" />
        </svg>
      );
    default:
      return null;
  }
}

function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('pt');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const active = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Idioma: ${active.label}. Alterar idioma`}
        className="hover:text-brand-yellow inline-flex items-center gap-2 p-2 text-sm text-white transition"
      >
        <FlagIcon code={active.code} />
        <span className="hidden font-mono text-xs font-bold tracking-widest uppercase sm:inline">
          {active.code}
        </span>
        <ChevronDown
          className={`hidden size-3.5 transition-transform duration-200 sm:block ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={2.5}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="border-brand-yellow bg-brand-black absolute top-full right-0 z-50 min-w-44 border-t-2 py-2 shadow-2xl"
            style={{ borderRadius: 'var(--radius-edge)' }}
            role="listbox"
            aria-label="Idiomas disponíveis"
          >
            {LANGUAGES.map((lang) => {
              const isActive = lang.code === current;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setCurrent(lang.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                    isActive
                      ? 'text-brand-yellow bg-white/5'
                      : 'hover:text-brand-yellow text-white/85 hover:bg-white/5'
                  }`}
                >
                  <FlagIcon code={lang.code} />
                  <span className="flex-1">{lang.label}</span>
                  {isActive && <span className="bg-brand-yellow size-1.5" />}
                </button>
              );
            })}
            <div className="mt-1 border-t border-white/10 px-4 pt-2 pb-1 text-[10px] tracking-wide text-white/40">
              Tradução do site em breve
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════
//   Busca inline com autocomplete (dark/light)
// ══════════════════════════════════════════
export function SearchInline({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions, loading } = useAutocomplete(query);

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
            className={`pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 ${
              dark ? 'text-white/50' : 'text-brand-steel'
            }`}
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
            placeholder="Código OF, concorrente ou original..."
            spellCheck={false}
            autoComplete="off"
            className={`w-full border py-2.5 pr-4 pl-10 text-sm font-medium transition placeholder:font-normal ${
              dark
                ? 'focus:border-brand-yellow border-white/15 bg-white/10 text-white placeholder:text-white/45 focus:bg-white/15'
                : 'bg-brand-snow border-brand-mist focus:border-brand-yellow placeholder:text-brand-steel focus:bg-white'
            }`}
            style={{ borderRadius: 'var(--radius-edge)' }}
          />
          {loading && (
            <Loader2
              className={`absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin ${
                dark ? 'text-white/50' : 'text-brand-steel'
              }`}
            />
          )}
        </div>
      </form>

      {/* Dropdown de sugestões (sempre claro, para leitura) */}
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
//   Mobile drawer (fundo preto, espelha NAV_ENTRIES)
// ══════════════════════════════════════════
function MobileDrawer({ onClose }: { onClose: () => void }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

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
        className="bg-brand-black fixed top-0 right-0 bottom-0 z-50 flex w-[85vw] max-w-sm flex-col text-white md:hidden"
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <span className="font-display text-sm font-bold tracking-widest uppercase">Menu</span>
          <button type="button" onClick={onClose} className="-mr-2 p-2" aria-label="Fechar menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-5">
          {NAV_ENTRIES.map((entry) =>
            entry.children ? (
              <div key={entry.label}>
                <button
                  type="button"
                  onClick={() => setOpenGroup((g) => (g === entry.label ? null : entry.label))}
                  aria-expanded={openGroup === entry.label}
                  className="font-display hover:text-brand-yellow flex w-full items-center justify-between px-2 py-3 text-base font-semibold tracking-wide text-white uppercase transition"
                >
                  {entry.label}
                  <ChevronDown
                    className={`size-4 transition-transform duration-200 ${
                      openGroup === entry.label ? 'rotate-180' : ''
                    }`}
                    strokeWidth={2.5}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openGroup === entry.label && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <ul className="ml-2 space-y-1 border-l border-white/15 py-1 pl-3">
                        {entry.children.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              onClick={onClose}
                              className="hover:text-brand-yellow block py-2 text-sm font-medium text-white/75 transition"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={onClose}
                className="font-display hover:text-brand-yellow block px-2 py-3 text-base font-semibold tracking-wide text-white uppercase transition"
              >
                {entry.label}
              </Link>
            ),
          )}

          <Link
            href="/seja-revendedor"
            onClick={onClose}
            className="bg-brand-yellow text-brand-black font-display mt-3 block px-4 py-3 text-center text-sm font-bold tracking-widest uppercase"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            Seja Revendedor
          </Link>
        </nav>

        <div className="space-y-3 border-t border-white/10 bg-white/5 p-5">
          <Link
            href="/conta"
            onClick={onClose}
            className="flex items-center gap-3 text-sm text-white/85"
          >
            <User className="size-4" />
            Minha conta
          </Link>
          <div className="border-t border-white/10 pt-3">
            <div className="mb-1 text-[10px] tracking-widest text-white/50 uppercase">
              Atendimento
            </div>
            <a href="tel:+551146133454" className="flex items-center gap-2 font-mono text-sm">
              <Phone className="size-3.5" />
              +55 11 4613-3454
            </a>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
              <MapPin className="size-3" />
              Cotia · São Paulo
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
