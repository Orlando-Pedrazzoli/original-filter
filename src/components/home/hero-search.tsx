// src/components/home/hero-search.tsx
/* ══════════════════════════════════════════
   HeroSearch — Original Filter
   ──────────────────────────────────────────
   Hero busca-primeiro (referência: proposta Showlub, executada
   com identidade própria). Fundo preto contínuo com o navbar,
   headline Archivo Black, busca gigante com autocomplete e
   atalhos para as duas outras formas de encontrar o filtro.

   O usuário-alvo é o balconista/mecânico com um código na mão:
   OF, de concorrente (MANN, Fleetguard...) ou original da
   montadora. A promessa vai na manchete; a prova (números) vem
   na StatsBand logo abaixo.
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Loader2, Search, Truck } from 'lucide-react';
import { useAutocomplete } from '@/hooks/use-autocomplete';
import { O_PATTERN_DARK } from '@/lib/brand-pattern';
import type { AutocompleteSuggestion } from '@/lib/search-types';

// Códigos reais do catálogo para o usuário experimentar em 1 clique
const EXAMPLE_CODES = ['FF5863', 'W 1170', 'PU10022Z', 'OFA2023C'];

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  function submit(q: string) {
    const clean = q.trim();
    if (!clean) return;
    setOpen(false);
    router.push(`/produtos?q=${encodeURIComponent(clean)}`);
  }

  function handleSelect(sug: AutocompleteSuggestion) {
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
    <section className="bg-brand-black relative overflow-hidden text-white">
      {/* Padrão de fundo: "O"s do logotipo (fonte única em lib/brand-pattern) */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={O_PATTERN_DARK} />
      {/* Brilho amarelo suave atrás da busca */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-[36rem] -translate-x-1/2 -translate-y-1/3"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.10), transparent 65%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Kicker */}
          <div className="mb-5 flex items-center justify-center gap-3">
            <div className="bg-brand-yellow h-px w-10" />
            <span className="text-brand-yellow font-mono text-[11px] tracking-[0.28em] uppercase">
              Referências cruzadas
            </span>
            <div className="bg-brand-yellow h-px w-10" />
          </div>

          {/* Headline */}
          <h1
            className="font-display font-black text-white"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 3.75rem)', letterSpacing: '-0.03em' }}
          >
            Qualquer código.
            <br />
            <span className="text-brand-yellow">O filtro certo.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Digite o código Original Filter, do concorrente ou o número original da montadora — nós
            cruzamos as referências e mostramos o filtro equivalente.
          </p>

          {/* ─── Busca gigante ─── */}
          <div ref={containerRef} className="relative mx-auto mt-9 max-w-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedIdx >= 0 && suggestions[selectedIdx]) {
                  handleSelect(suggestions[selectedIdx]);
                } else {
                  submit(query);
                }
              }}
            >
              <div
                className="focus-within:border-brand-yellow flex items-stretch border-2 border-white/20 bg-white/10 backdrop-blur-sm transition"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                <div className="flex items-center pl-4 md:pl-5">
                  <Search className="size-5 text-white/50" strokeWidth={2} />
                </div>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    setSelectedIdx(-1);
                  }}
                  onFocus={() => query.length >= 2 && setOpen(true)}
                  onKeyDown={handleKey}
                  placeholder="Ex.: FF5863, W 1170, OFA2023C..."
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Buscar por código de filtro"
                  className="h-14 min-w-0 flex-1 bg-transparent px-3 font-mono text-base font-medium text-white outline-none placeholder:font-sans placeholder:font-normal placeholder:text-white/40 md:h-16 md:px-4 md:text-lg"
                />
                {loading && (
                  <div className="flex items-center pr-3">
                    <Loader2 className="size-4 animate-spin text-white/50" />
                  </div>
                )}
                <button
                  type="submit"
                  className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-bright font-display m-1.5 inline-flex shrink-0 items-center gap-2 px-4 text-sm font-bold tracking-widest uppercase transition md:px-6"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  Buscar
                  <ArrowRight className="hidden size-4 sm:block" strokeWidth={2.5} />
                </button>
              </div>
            </form>

            {/* Sugestões de autocomplete */}
            <AnimatePresence>
              {open && query.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="border-brand-mist of-scroll absolute top-full right-0 left-0 z-40 mt-2 max-h-96 overflow-y-auto border bg-white text-left shadow-2xl"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  {suggestions.length === 0 && !loading ? (
                    <div className="text-brand-steel p-4 text-sm">
                      Nenhuma sugestão para <span className="font-mono">{query}</span> — pressione
                      Enter para a busca completa (inclui referências cruzadas).
                    </div>
                  ) : (
                    <ul>
                      {suggestions.map((sug, i) => (
                        <li key={`${sug.kind}-${sug.label}-${i}`}>
                          <button
                            type="button"
                            onClick={() => handleSelect(sug)}
                            onMouseEnter={() => setSelectedIdx(i)}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                              selectedIdx === i ? 'bg-brand-snow' : ''
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-brand-black truncate text-sm font-medium">
                                {sug.kind === 'sku' ? (
                                  <span className="font-mono font-bold">{sug.label}</span>
                                ) : (
                                  sug.label
                                )}
                              </div>
                              {sug.caption && (
                                <div className="text-brand-steel truncate text-xs">
                                  {sug.caption}
                                </div>
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

            {/* Exemplos clicáveis */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-white/45">Experimente:</span>
              {EXAMPLE_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => submit(code)}
                  className="hover:border-brand-yellow hover:text-brand-yellow border border-white/20 px-2.5 py-1 font-mono text-white/70 transition"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Caminhos alternativos ─── */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/buscar-por-veiculo"
              className="hover:border-brand-yellow group inline-flex items-center gap-2.5 border border-white/20 px-5 py-3 text-sm text-white/85 transition hover:text-white"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <Truck className="text-brand-yellow size-4" strokeWidth={2} />
              Não sabe o código? Busque pelo veículo
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
            <Link
              href="/produtos"
              className="hover:text-brand-yellow inline-flex items-center gap-2 px-4 py-3 text-sm text-white/60 transition"
            >
              Ver catálogo completo
              <ArrowRight className="size-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
