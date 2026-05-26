/* ══════════════════════════════════════════
   SearchHub
   ──────────────────────────────────────────
   Componente unificado de busca com 3 abas:
   - Pelo veículo (cascata: linha → marca → modelo → motor → ano)
   - Por código (cross-reference: OEM, concorrência, ou nosso SKU)
   - Pela linha (atalho visual para as 4 linhas)

   Usado em:
   - Homepage (variant="hero" — versão grande)
   - Páginas de busca dedicadas (variant="page" — compacto)
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Hash, Layers, ArrowRight, Loader2 } from 'lucide-react';
import type {
  VehicleLine,
  VehicleBrandOption,
  VehicleModelOption,
  VehicleEngineOption,
} from '@/lib/search-types';

type Tab = 'vehicle' | 'code' | 'line';

interface SearchHubProps {
  variant?: 'hero' | 'page';
  defaultTab?: Tab;
}

export function SearchHub({ variant = 'hero', defaultTab = 'vehicle' }: SearchHubProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  const isHero = variant === 'hero';

  return (
    <div
      className={`relative bg-white shadow-2xl ${
        isHero ? 'border border-white/10' : 'border-brand-mist border'
      }`}
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {/* Faixa amarela superior — marcação técnica */}
      <div className="bg-brand-yellow h-1 w-full" />

      {/* Abas */}
      <div className="border-brand-mist flex border-b">
        <TabButton
          icon={<Truck className="size-4" strokeWidth={2.25} />}
          label="Pelo veículo"
          active={tab === 'vehicle'}
          onClick={() => setTab('vehicle')}
        />
        <TabButton
          icon={<Hash className="size-4" strokeWidth={2.25} />}
          label="Por código"
          active={tab === 'code'}
          onClick={() => setTab('code')}
        />
        <TabButton
          icon={<Layers className="size-4" strokeWidth={2.25} />}
          label="Pela linha"
          active={tab === 'line'}
          onClick={() => setTab('line')}
        />
      </div>

      {/* Conteúdo */}
      <div className={`${isHero ? 'p-6 md:p-8' : 'p-5'}`}>
        <AnimatePresence mode="wait">
          {tab === 'vehicle' && (
            <motion.div
              key="vehicle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <VehiclePanel />
            </motion.div>
          )}
          {tab === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CodePanel />
            </motion.div>
          )}
          {tab === 'line' && (
            <motion.div
              key="line"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <LinePanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Aba botão ───
function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-1 items-center justify-center gap-2 px-4 py-4 transition ${
        active ? 'text-brand-black' : 'text-brand-steel hover:text-brand-black'
      }`}
      style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
    >
      {icon}
      <span className="hidden text-sm tracking-wide uppercase sm:inline">{label}</span>
      {active && (
        <motion.div
          layoutId="active-tab"
          className="bg-brand-yellow absolute right-0 -bottom-px left-0 h-0.5"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );
}

// ══════════════════════════════════════════
//   PAINEL 1 — POR VEÍCULO (cascata)
// ══════════════════════════════════════════
function VehiclePanel() {
  const router = useRouter();
  const [lines, setLines] = useState<VehicleLine[]>([]);
  const [brands, setBrands] = useState<VehicleBrandOption[]>([]);
  const [models, setModels] = useState<VehicleModelOption[]>([]);
  const [engines, setEngines] = useState<VehicleEngineOption[]>([]);

  const [selectedLine, setSelectedLine] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');

  const [loadingLines, setLoadingLines] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingEngines, setLoadingEngines] = useState(false);

  // Carregar linhas
  useEffect(() => {
    fetch('/api/vehicle-selector/lines')
      .then((r) => r.json())
      .then((d: { lines: VehicleLine[] }) => {
        setLines(d.lines ?? []);
        setLoadingLines(false);
      })
      .catch(() => setLoadingLines(false));
  }, []);

  // Carregar marcas quando linha muda
  useEffect(() => {
    if (!selectedLine) {
      setBrands([]);
      setSelectedBrand('');
      return;
    }
    setLoadingBrands(true);
    fetch(`/api/vehicle-selector/brands?linha=${selectedLine}`)
      .then((r) => r.json())
      .then((d: { brands: VehicleBrandOption[] }) => {
        setBrands(d.brands ?? []);
        setLoadingBrands(false);
      })
      .catch(() => setLoadingBrands(false));
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedEngine('');
  }, [selectedLine]);

  // Carregar modelos quando marca muda
  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      setSelectedModel('');
      return;
    }
    setLoadingModels(true);
    fetch(`/api/vehicle-selector/models?brand=${encodeURIComponent(selectedBrand)}`)
      .then((r) => r.json())
      .then((d: { models: VehicleModelOption[] }) => {
        setModels(d.models ?? []);
        setLoadingModels(false);
      })
      .catch(() => setLoadingModels(false));
    setSelectedModel('');
    setSelectedEngine('');
  }, [selectedBrand]);

  // Carregar motores quando modelo muda
  useEffect(() => {
    if (!selectedBrand || !selectedModel) {
      setEngines([]);
      setSelectedEngine('');
      return;
    }
    setLoadingEngines(true);
    fetch(
      `/api/vehicle-selector/engines?brand=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(selectedModel)}`,
    )
      .then((r) => r.json())
      .then((d: { engines: VehicleEngineOption[] }) => {
        setEngines(d.engines ?? []);
        setLoadingEngines(false);
      })
      .catch(() => setLoadingEngines(false));
    setSelectedEngine('');
  }, [selectedBrand, selectedModel]);

  const canSearch = !!selectedBrand;

  function handleSearch() {
    if (!canSearch) return;
    const params = new URLSearchParams();
    params.set('brand', selectedBrand);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedEngine) params.set('engine', selectedEngine);
    router.push(`/buscar-por-veiculo?${params.toString()}`);
  }

  return (
    <div className="space-y-3">
      <p className="text-brand-steel text-xs tracking-widest uppercase">
        Encontre o filtro certo para o seu veículo
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Cascade
          label="Linha"
          value={selectedLine}
          onChange={setSelectedLine}
          options={lines.map((l) => ({
            value: l.slug,
            label: l.label,
            hint: `${l.brandCount ?? 0} marcas`,
          }))}
          placeholder="Escolha a linha"
          loading={loadingLines}
          disabled={false}
        />

        <Cascade
          label="Montadora"
          value={selectedBrand}
          onChange={setSelectedBrand}
          options={brands.map((b) => ({
            value: b.name,
            label: b.name,
            hint: `${b.productCount} produtos`,
          }))}
          placeholder={selectedLine ? 'Escolha a montadora' : 'Escolha a linha primeiro'}
          loading={loadingBrands}
          disabled={!selectedLine}
        />

        <Cascade
          label="Modelo"
          value={selectedModel}
          onChange={setSelectedModel}
          options={models.map((m) => ({
            value: m.model,
            label: m.model,
            hint: `${m.productCount} produtos`,
          }))}
          placeholder={selectedBrand ? 'Escolha o modelo (opcional)' : '—'}
          loading={loadingModels}
          disabled={!selectedBrand}
        />

        <Cascade
          label="Motor"
          value={selectedEngine}
          onChange={setSelectedEngine}
          options={engines.map((e) => ({
            value: e.engine,
            label: e.engine,
            hint: `${e.productCount} produtos`,
          }))}
          placeholder={
            selectedModel
              ? engines.length === 0
                ? 'Sem motor cadastrado'
                : 'Escolha o motor (opcional)'
              : '—'
          }
          loading={loadingEngines}
          disabled={!selectedModel || engines.length === 0}
        />
      </div>

      <button
        type="button"
        onClick={handleSearch}
        disabled={!canSearch}
        className="btn-primary mt-2 w-full"
      >
        Ver produtos compatíveis
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

// Select customizado
function Cascade({
  label,
  value,
  onChange,
  options,
  placeholder,
  loading,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string; hint?: string }>;
  placeholder: string;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <label className="block">
      <span className="text-brand-steel mb-1 block font-mono text-[10px] tracking-widest uppercase">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className="border-brand-mist hover:border-brand-iron w-full cursor-pointer appearance-none border bg-white px-4 py-3 pr-10 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
              {o.hint ? ` · ${o.hint}` : ''}
            </option>
          ))}
        </select>
        {loading ? (
          <Loader2 className="text-brand-steel absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin" />
        ) : (
          <svg
            className="text-brand-steel pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </label>
  );
}

// ══════════════════════════════════════════
//   PAINEL 2 — POR CÓDIGO (cross-reference)
// ══════════════════════════════════════════
function CodePanel() {
  const router = useRouter();
  const [code, setCode] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 3) return;
    router.push(`/cross-reference?code=${encodeURIComponent(code.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-brand-steel text-xs tracking-widest uppercase">
        Já compra outra marca? Digite o código e encontre o equivalente.
      </p>

      <div className="relative">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ex: W1170, OFA2023C, 21380475"
          autoComplete="off"
          spellCheck={false}
          className="border-brand-mist focus:border-brand-yellow w-full border-2 bg-white px-5 py-4 pr-32 font-mono text-base font-medium tracking-wider uppercase transition"
          style={{ borderRadius: 'var(--radius-edge)' }}
        />
        <button
          type="submit"
          disabled={code.trim().length < 3}
          className="btn-primary absolute top-1/2 right-2 -translate-y-1/2 px-4 py-2 text-xs"
        >
          Buscar
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <span className="text-brand-steel font-mono text-[10px] tracking-widest uppercase">
          Aceita códigos de:
        </span>
        {[
          'Original Filter',
          'Mann',
          'Donaldson',
          'Tecfil',
          'Wega',
          'Mahle',
          'Volvo',
          'Scania',
          'MB',
        ].map((b) => (
          <span
            key={b}
            className="text-brand-iron border-brand-mist border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase"
          >
            {b}
          </span>
        ))}
      </div>
    </form>
  );
}

// ══════════════════════════════════════════
//   PAINEL 3 — PELA LINHA (atalho visual)
// ══════════════════════════════════════════
function LinePanel() {
  const router = useRouter();
  const [lines, setLines] = useState<VehicleLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vehicle-selector/lines')
      .then((r) => r.json())
      .then((d: { lines: VehicleLine[] }) => {
        setLines(d.lines ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-brand-steel size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-brand-steel text-xs tracking-widest uppercase">
        Explore por linha de aplicação
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
        {lines.map((line) => (
          <button
            key={line.slug}
            type="button"
            onClick={() => router.push(`/produtos?linha=${line.slug}`)}
            className="group of-mark border-brand-mist hover:border-brand-black hover:bg-brand-snow border p-4 text-left transition"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display text-brand-black font-bold tracking-tight uppercase">
                  {line.label}
                </div>
                <div className="text-brand-steel mt-1 text-xs leading-snug">{line.description}</div>
                <div className="text-brand-iron mt-2 font-mono text-[10px] tracking-widest uppercase">
                  {line.brandCount ?? 0} marcas
                </div>
              </div>
              <ArrowRight className="text-brand-steel group-hover:text-brand-yellow size-4 transition group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
