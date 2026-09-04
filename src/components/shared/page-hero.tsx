// src/components/shared/page-hero.tsx
/* ══════════════════════════════════════════
   PageHero — Original Filter
   ──────────────────────────────────────────
   Hero compacto para páginas internas (catálogo, busca, sobre, etc.).
   Mantém a identidade visual industrial sem ocupar tela inteira.
   ══════════════════════════════════════════ */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { O_PATTERN_DARK, O_PATTERN_LIGHT } from '@/lib/brand-pattern';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  /** Pequeno texto acima do título, em mono uppercase */
  eyebrow?: string;
  /** Título grande (display) */
  title: string;
  /** Texto descritivo opcional */
  description?: string;
  /** Alias retrocompatível para `description` (páginas antigas usavam `subtitle`) */
  subtitle?: string;
  /** Breadcrumbs opcionais */
  breadcrumbs?: Breadcrumb[];
  /** Variant escura (fundo preto) ou clara (fundo snow) */
  variant?: 'dark' | 'light';
  /** Conteúdo customizado à direita (ex: contagem de resultados, botão) */
  right?: React.ReactNode;
  /** Tamanho do hero */
  size?: 'sm' | 'md' | 'lg';
}

export function PageHero({
  eyebrow,
  title,
  description,
  subtitle,
  breadcrumbs,
  variant = 'light',
  right,
  size = 'md',
}: PageHeroProps) {
  // Usa subtitle como fallback de description para compatibilidade com páginas antigas
  const effectiveDescription = description ?? subtitle;
  const isDark = variant === 'dark';

  const padding = {
    sm: 'py-10 md:py-14',
    md: 'py-14 md:py-20',
    lg: 'py-20 md:py-28',
  }[size];

  return (
    <section
      className={`relative overflow-hidden ${
        isDark ? 'bg-brand-black text-white' : 'bg-brand-snow text-brand-black'
      } ${padding}`}
    >
      {/* Padrão de "O"s do logotipo (fonte única em lib/brand-pattern) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={isDark ? O_PATTERN_DARK : O_PATTERN_LIGHT}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-12">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-5 flex flex-wrap items-center gap-1 font-mono text-xs tracking-widest uppercase">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight
                    className={`size-3 ${isDark ? 'text-white/30' : 'text-brand-steel'}`}
                    strokeWidth={2}
                  />
                )}
                {b.href ? (
                  <Link
                    href={b.href}
                    className={
                      isDark
                        ? 'hover:text-brand-yellow text-white/50 transition'
                        : 'text-brand-steel hover:text-brand-yellow-deep transition'
                    }
                  >
                    {b.label}
                  </Link>
                ) : (
                  <span className={isDark ? 'text-brand-yellow' : 'text-brand-yellow-deep'}>
                    {b.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            {eyebrow && (
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-brand-yellow h-px w-8" />
                <span
                  className={`font-mono text-[11px] tracking-[0.25em] uppercase ${
                    isDark ? 'text-brand-yellow' : 'text-brand-yellow-deep'
                  }`}
                >
                  {eyebrow}
                </span>
              </div>
            )}
            <h1
              className="font-display leading-[0.95] font-black tracking-tight"
              style={{
                fontSize:
                  size === 'lg' ? 'clamp(2.5rem, 6vw, 4.5rem)' : 'clamp(2rem, 4.5vw, 3.25rem)',
                letterSpacing: '-0.035em',
              }}
            >
              {title}
            </h1>
            {effectiveDescription && (
              <p
                className={`mt-4 max-w-2xl text-base leading-relaxed md:text-lg ${
                  isDark ? 'text-white/70' : 'text-brand-iron'
                }`}
              >
                {effectiveDescription}
              </p>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      </div>
    </section>
  );
}

/**
 * Alias retrocompatível para páginas antigas que importam `PageHeader`.
 * Exporta o mesmo componente com nome antigo via default export.
 */
export default PageHero;
