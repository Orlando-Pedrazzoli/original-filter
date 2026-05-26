/* ══════════════════════════════════════════
   ProductApplications — Original Filter
   ──────────────────────────────────────────
   Tabela de aplicações compatíveis: marca · modelo · motor · anos.
   - Filtro por marca (pills clicáveis no topo)
   - Agrupada por marca com header sticky
   - Estado vazio com convite a contatar
   ══════════════════════════════════════════ */

'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Check, ChevronRight } from 'lucide-react';

interface Application {
  brand: string;
  model: string;
  engine?: string;
  yearStart?: number;
  yearEnd?: number;
}

interface ProductApplicationsProps {
  applications: Application[];
  productSku: string;
}

export function ProductApplications({ applications, productSku }: ProductApplicationsProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  // Agrupa por marca
  const grouped = useMemo(() => {
    const map = new Map<string, Application[]>();
    for (const app of applications) {
      const brand = app.brand.toUpperCase();
      if (!map.has(brand)) map.set(brand, []);
      map.get(brand)!.push(app);
    }
    // Ordena marcas por número de aplicações
    return Array.from(map.entries()).sort(([, a], [, b]) => b.length - a.length);
  }, [applications]);

  // Estado vazio
  if (applications.length === 0) {
    return (
      <section className="py-12 md:py-16">
        <SectionHeader eyebrow="Onde este produto serve" title="Aplicações compatíveis" />
        <div
          className="bg-brand-snow border-brand-mist border p-8 text-center"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <Truck className="text-brand-mist mx-auto mb-3 size-10" strokeWidth={1.25} />
          <div className="text-brand-iron mx-auto max-w-md text-sm">
            Aplicações em cadastro. Para consultar compatibilidade do {productSku} com seu veículo,
            entre em contato com nossa equipe técnica.
          </div>
        </div>
      </section>
    );
  }

  // Filtra pela marca selecionada
  const visibleGroups = selectedBrand
    ? grouped.filter(([brand]) => brand === selectedBrand)
    : grouped;

  return (
    <section className="py-12 md:py-16">
      <SectionHeader
        eyebrow="Onde este produto serve"
        title="Aplicações compatíveis"
        count={applications.length}
      />

      {/* Filtro por marca */}
      {grouped.length > 1 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-brand-iron mr-2 font-mono text-[10px] tracking-[0.22em] uppercase">
            Filtrar por marca:
          </span>
          <BrandPill
            label="Todas"
            count={applications.length}
            active={selectedBrand === null}
            onClick={() => setSelectedBrand(null)}
          />
          {grouped.map(([brand, apps]) => (
            <BrandPill
              key={brand}
              label={brand}
              count={apps.length}
              active={selectedBrand === brand}
              onClick={() => setSelectedBrand(brand)}
            />
          ))}
        </div>
      )}

      {/* Tabela */}
      <div
        className="border-brand-mist overflow-hidden border"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedBrand ?? 'all'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {visibleGroups.map(([brand, apps]) => (
              <BrandGroup key={brand} brand={brand} apps={apps} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer técnico */}
      <div className="text-brand-steel mt-4 flex items-start gap-2 text-xs">
        <Check className="text-brand-yellow-deep mt-0.5 size-3.5 shrink-0" strokeWidth={2.5} />
        <span>
          Lista de aplicações homologadas pela Original Filter. Para casos não listados, consulte
          nossa equipe técnica para validação.
        </span>
      </div>
    </section>
  );
}

// ─── Header da seção ───
function SectionHeader({
  eyebrow,
  title,
  count,
}: {
  eyebrow: string;
  title: string;
  count?: number;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-brand-yellow h-px w-8" />
          <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
            {eyebrow}
          </span>
        </div>
        <h2
          className="font-display text-brand-black font-black"
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            letterSpacing: '-0.025em',
          }}
        >
          {title}
        </h2>
      </div>
      {count != null && (
        <div className="text-brand-iron font-mono text-xs tracking-widest uppercase">
          <span className="text-brand-yellow-deep text-lg font-bold">{count}</span>{' '}
          {count === 1 ? 'aplicação' : 'aplicações'}
        </div>
      )}
    </div>
  );
}

// ─── Pill de marca ───
function BrandPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium transition ${
        active
          ? 'bg-brand-black border-brand-black text-white'
          : 'bg-brand-white text-brand-iron border-brand-mist hover:border-brand-iron hover:text-brand-black'
      }`}
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {label}
      <span className={`font-mono text-[10px] ${active ? 'text-white/60' : 'text-brand-steel'}`}>
        {count}
      </span>
    </button>
  );
}

// ─── Grupo de aplicações por marca ───
function BrandGroup({ brand, apps }: { brand: string; apps: Application[] }) {
  return (
    <div className="border-brand-mist border-b last:border-b-0">
      {/* Header da marca */}
      <div className="bg-brand-black flex items-center justify-between px-4 py-3 text-white md:px-6">
        <div className="flex items-center gap-3">
          <Truck className="text-brand-yellow size-4" strokeWidth={2} />
          <span className="font-display text-sm font-bold tracking-wide uppercase md:text-base">
            {brand}
          </span>
        </div>
        <span className="text-brand-yellow font-mono text-[10px] tracking-widest uppercase">
          {apps.length} {apps.length === 1 ? 'aplicação' : 'aplicações'}
        </span>
      </div>

      {/* Tabela de aplicações */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-brand-snow">
            <tr>
              <Th>Modelo</Th>
              <Th>Motor</Th>
              <Th>Anos</Th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app, i) => (
              <tr
                key={`${app.model}-${app.engine}-${i}`}
                className="border-brand-mist hover:bg-brand-snow/70 border-t transition"
              >
                <Td>
                  <span className="font-display text-brand-black font-semibold">{app.model}</span>
                </Td>
                <Td>
                  {app.engine ? (
                    <span className="text-brand-iron font-mono text-sm">{app.engine}</span>
                  ) : (
                    <span className="text-brand-steel text-xs italic">—</span>
                  )}
                </Td>
                <Td>
                  <YearRange yearStart={app.yearStart} yearEnd={app.yearEnd} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Versão mobile: cards */}
      <div className="divide-brand-mist divide-y md:hidden">
        {apps.map((app, i) => (
          <div key={`${app.model}-${i}`} className="bg-white p-4">
            <div className="font-display text-brand-black mb-1 font-semibold">{app.model}</div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {app.engine && (
                <span className="text-brand-iron font-mono">
                  <span className="text-brand-steel mr-1 text-[10px] tracking-wider uppercase">
                    Motor
                  </span>
                  {app.engine}
                </span>
              )}
              <YearRange yearStart={app.yearStart} yearEnd={app.yearEnd} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-brand-iron px-4 py-3 text-left font-mono text-[10px] font-semibold tracking-[0.22em] uppercase md:px-6">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-sm md:px-6">{children}</td>;
}

function YearRange({ yearStart, yearEnd }: { yearStart?: number; yearEnd?: number }) {
  if (!yearStart && !yearEnd) {
    return <span className="text-brand-steel text-xs italic">Não informado</span>;
  }

  const start = yearStart ?? '?';
  const end = yearEnd ?? 'hoje';

  return (
    <span className="text-brand-iron inline-flex items-center gap-1.5 font-mono text-sm">
      <span>{start}</span>
      <ChevronRight className="text-brand-steel size-3" />
      <span>{end}</span>
    </span>
  );
}
