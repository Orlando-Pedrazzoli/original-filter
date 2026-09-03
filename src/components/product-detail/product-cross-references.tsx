// src/components/product-detail/product-cross-references.tsx
/* ══════════════════════════════════════════
   ProductCrossReferences — Original Filter
   ──────────────────────────────────────────
   Tabela de conversões do produto, agrupada por marca
   (MANN FILTER, FLEETGUARD, VOLVO... e NÚMERO ORIGINAL por último).

   - Cada código é uma pill copiável (clipboard)
   - Filtro local por marca/código quando há muitas marcas
   - Colapso: mostra as primeiras marcas e expande sob demanda
     (há produtos com até 49 marcas / 118 códigos)
   - Fallback 1: sem crossReferences mas com oemCodes → pills planas
   - Fallback 2: sem nada → estado "em atualização"
   ══════════════════════════════════════════ */

'use client';

import { useMemo, useState } from 'react';
import { Hash, Copy, Check, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface CrossReference {
  brand: string;
  code: string;
  codeNormalized: string;
}

interface ProductCrossReferencesProps {
  crossReferences: CrossReference[];
  oemCodes: string[];
  productSku: string;
}

const GENERIC_BRAND = 'NÚMERO ORIGINAL';
const COLLAPSED_GROUPS = 8;
const FILTER_THRESHOLD = 12;

function normalizeLocal(s: string): string {
  return s
    .trim()
    .toUpperCase()
    .replace(/[\s\-_./]+/g, '');
}

export function ProductCrossReferences({
  crossReferences,
  oemCodes,
  productSku,
}: ProductCrossReferencesProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState('');

  async function handleCopy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      // Falha silenciosa em browsers antigos
    }
  }

  // Agrupar por marca: alfabético, NÚMERO ORIGINAL sempre por último
  const groups = useMemo(() => {
    const map = new Map<string, CrossReference[]>();
    for (const ref of crossReferences) {
      if (!map.has(ref.brand)) map.set(ref.brand, []);
      map.get(ref.brand)!.push(ref);
    }
    return [...map.entries()].sort((a, b) => {
      if (a[0] === GENERIC_BRAND) return 1;
      if (b[0] === GENERIC_BRAND) return -1;
      return a[0].localeCompare(b[0]);
    });
  }, [crossReferences]);

  // Filtro local por marca ou código (com normalização)
  const filtered = useMemo(() => {
    const f = normalizeLocal(filter);
    if (!f) return groups;
    return groups
      .map(([brand, refs]) => {
        if (normalizeLocal(brand).includes(f)) return [brand, refs] as const;
        return [brand, refs.filter((r) => r.codeNormalized.includes(f))] as const;
      })
      .filter(([, refs]) => refs.length > 0);
  }, [groups, filter]);

  const isFiltering = filter.trim().length > 0;
  const visibleGroups = expanded || isFiltering ? filtered : filtered.slice(0, COLLAPSED_GROUPS);
  const hiddenCount = filtered.length - visibleGroups.length;
  const totalCodes = crossReferences.length;

  const hasStructured = groups.length > 0;
  const hasFlat = !hasStructured && oemCodes.length > 0;
  const isEmpty = !hasStructured && !hasFlat;

  function renderPill(code: string) {
    const isCopied = copiedCode === code;
    return (
      <button
        key={code}
        type="button"
        onClick={() => handleCopy(code)}
        className={`group inline-flex items-center gap-2 border px-3 py-1.5 transition ${
          isCopied
            ? 'bg-brand-yellow text-brand-black border-brand-yellow'
            : 'bg-brand-white border-brand-mist hover:border-brand-iron text-brand-black'
        }`}
        style={{ borderRadius: 'var(--radius-edge)' }}
        aria-label={`Copiar código ${code}`}
      >
        <span className="font-mono text-sm font-bold tracking-wider">{code}</span>
        {isCopied ? (
          <Check className="size-3.5" strokeWidth={2.5} />
        ) : (
          <Copy className="text-brand-steel group-hover:text-brand-iron size-3.5 transition" />
        )}
      </button>
    );
  }

  return (
    <section className="bg-brand-snow py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        {/* ─── Cabeçalho da seção ─── */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-brand-yellow h-px w-8" />
            <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
              Referências cruzadas
            </span>
          </div>
          <h2
            className="font-display text-brand-black font-black"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              letterSpacing: '-0.025em',
            }}
          >
            Já compra outra marca?
          </h2>
          <p className="text-brand-iron mt-3 max-w-2xl">
            {hasStructured ? (
              <>
                O <span className="text-brand-yellow-deep font-mono font-bold">{productSku}</span>{' '}
                substitui <span className="text-brand-black font-bold">{totalCodes} códigos</span>{' '}
                de <span className="text-brand-black font-bold">{groups.length} fabricantes</span>.
                Clique em um código para copiá-lo.
              </>
            ) : (
              <>
                Estes são os códigos equivalentes ao{' '}
                <span className="text-brand-yellow-deep font-mono font-bold">{productSku}</span> nos
                principais fabricantes do mercado.
              </>
            )}
          </p>
        </div>

        {/* ─── Estado vazio ─── */}
        {isEmpty && (
          <div
            className="bg-brand-white border-brand-mist border p-6 md:p-8"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <div className="flex items-start gap-4">
              <div className="bg-brand-yellow/10 text-brand-yellow-deep flex size-10 shrink-0 items-center justify-center">
                <Hash className="size-4" strokeWidth={2} />
              </div>
              <div>
                <div className="text-brand-iron mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
                  Tabela de equivalência em atualização
                </div>
                <div className="font-display text-brand-black text-lg leading-tight font-bold">
                  Ainda não há referências cadastradas para este produto.
                </div>
                <div className="text-brand-iron mt-2 max-w-xl text-sm leading-relaxed">
                  Para consultar a equivalência deste código, entre em contato com nossa equipe
                  comercial.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Fallback: oemCodes planos (sem marca) ─── */}
        {hasFlat && <div className="flex flex-wrap gap-2">{oemCodes.map(renderPill)}</div>}

        {/* ─── Tabela agrupada por marca ─── */}
        {hasStructured && (
          <>
            {groups.length > FILTER_THRESHOLD && (
              <div className="relative mb-6 max-w-md">
                <Search className="text-brand-steel pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filtrar por marca ou código..."
                  className="bg-brand-white border-brand-mist focus:border-brand-yellow-deep w-full border py-2.5 pr-4 pl-10 font-mono text-sm transition outline-none"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                  aria-label="Filtrar referências por marca ou código"
                />
              </div>
            )}

            {filtered.length === 0 ? (
              <p className="text-brand-iron text-sm">
                Nenhuma referência encontrada para{' '}
                <span className="font-mono font-bold">&quot;{filter}&quot;</span>.
              </p>
            ) : (
              <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2">
                {visibleGroups.map(([brand, refs]) => (
                  <div
                    key={brand}
                    className="bg-brand-white border-brand-mist border p-4"
                    style={{ borderRadius: 'var(--radius-edge)' }}
                  >
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <span className="text-brand-black font-mono text-xs font-bold tracking-[0.18em] uppercase">
                        {brand}
                      </span>
                      <span className="text-brand-steel font-mono text-[10px] tracking-widest">
                        {refs.length} {refs.length === 1 ? 'código' : 'códigos'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {refs.map((ref) => renderPill(ref.code))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isFiltering && hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="border-brand-mist hover:border-brand-iron text-brand-black bg-brand-white mt-6 inline-flex items-center gap-2 border px-5 py-2.5 font-mono text-xs font-bold tracking-widest uppercase transition"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Ver todas as {filtered.length} marcas
                <ChevronDown className="size-4" />
              </button>
            )}
            {!isFiltering && expanded && filtered.length > COLLAPSED_GROUPS && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="border-brand-mist hover:border-brand-iron text-brand-black bg-brand-white mt-6 inline-flex items-center gap-2 border px-5 py-2.5 font-mono text-xs font-bold tracking-widest uppercase transition"
                style={{ borderRadius: 'var(--radius-edge)' }}
              >
                Mostrar menos
                <ChevronUp className="size-4" />
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
