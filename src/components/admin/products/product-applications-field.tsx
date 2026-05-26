/* ══════════════════════════════════════════
   ProductApplicationsField — Original Filter Admin
   ──────────────────────────────────────────
   Lista dinâmica de aplicações do produto.
   Cada item: brand, model, engine?, yearStart?, yearEnd?.
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { Plus, X, Car } from 'lucide-react';
import type { ProductApplicationForm } from './product-form-types';

interface ProductApplicationsFieldProps {
  value: ProductApplicationForm[];
  onChange: (value: ProductApplicationForm[]) => void;
  disabled?: boolean;
}

export function ProductApplicationsField({
  value,
  onChange,
  disabled,
}: ProductApplicationsFieldProps) {
  const [draft, setDraft] = useState<ProductApplicationForm>({
    brand: '',
    model: '',
    engine: '',
    yearStart: undefined,
    yearEnd: undefined,
  });

  function addApplication() {
    if (!draft.brand.trim() || !draft.model.trim()) return;
    const cleaned: ProductApplicationForm = {
      brand: draft.brand.trim().toUpperCase(),
      model: draft.model.trim(),
    };
    if (draft.engine?.trim()) cleaned.engine = draft.engine.trim();
    if (draft.yearStart) cleaned.yearStart = draft.yearStart;
    if (draft.yearEnd) cleaned.yearEnd = draft.yearEnd;

    onChange([...value, cleaned]);
    setDraft({
      brand: '',
      model: '',
      engine: '',
      yearStart: undefined,
      yearEnd: undefined,
    });
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {/* Lista de aplicações já adicionadas */}
      {value.length > 0 && (
        <div className="space-y-1.5">
          {value.map((app, i) => (
            <div
              key={i}
              className="bg-brand-snow group flex items-center gap-3 px-3 py-2"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <Car className="text-brand-iron size-3.5 shrink-0" strokeWidth={2} />
              <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0 text-sm">
                <span className="font-display text-brand-black font-bold">{app.brand}</span>
                <span className="text-brand-iron">·</span>
                <span className="text-brand-black">{app.model}</span>
                {app.engine && (
                  <>
                    <span className="text-brand-iron">·</span>
                    <span className="text-brand-iron font-mono text-xs">{app.engine}</span>
                  </>
                )}
                {(app.yearStart || app.yearEnd) && (
                  <>
                    <span className="text-brand-iron">·</span>
                    <span className="text-brand-steel font-mono text-xs">
                      {app.yearStart ?? '...'}–{app.yearEnd ?? '...'}
                    </span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeAt(i)}
                disabled={disabled}
                className="text-brand-iron inline-flex size-6 items-center justify-center opacity-0 transition group-hover:opacity-100 hover:text-red-600"
                title="Remover aplicação"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Form de nova aplicação */}
      <div
        className="border-brand-mist space-y-2 border border-dashed p-3"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        <div className="text-brand-iron mb-1 font-mono text-[10px] tracking-widest uppercase">
          Adicionar aplicação
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-6">
          <input
            type="text"
            value={draft.brand}
            onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
            placeholder="Marca (ex: VOLVO)"
            className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel border bg-white px-3 py-2 text-sm transition-colors outline-none md:col-span-2"
            style={{ borderRadius: 'var(--radius-edge)' }}
            disabled={disabled}
            maxLength={50}
          />
          <input
            type="text"
            value={draft.model}
            onChange={(e) => setDraft({ ...draft, model: e.target.value })}
            placeholder="Modelo (ex: FH 540)"
            className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel border bg-white px-3 py-2 text-sm transition-colors outline-none md:col-span-2"
            style={{ borderRadius: 'var(--radius-edge)' }}
            disabled={disabled}
            maxLength={100}
          />
          <input
            type="text"
            value={draft.engine ?? ''}
            onChange={(e) => setDraft({ ...draft, engine: e.target.value })}
            placeholder="Motor (opc)"
            className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel [appearance:textfield] border bg-white px-3 py-2 font-mono text-sm transition-colors outline-none md:col-span-2 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            style={{ borderRadius: 'var(--radius-edge)' }}
            disabled={disabled}
            maxLength={50}
          />
          <input
            type="number"
            value={draft.yearStart ?? ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                yearStart: e.target.value ? parseInt(e.target.value, 10) : undefined,
              })
            }
            placeholder="Ano início"
            className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel [appearance:textfield] border bg-white px-3 py-2 font-mono text-sm transition-colors outline-none md:col-span-2 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            style={{ borderRadius: 'var(--radius-edge)' }}
            disabled={disabled}
            min={1950}
            max={2100}
          />
          <input
            type="number"
            value={draft.yearEnd ?? ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                yearEnd: e.target.value ? parseInt(e.target.value, 10) : undefined,
              })
            }
            placeholder="Ano fim"
            className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel [appearance:textfield] border bg-white px-3 py-2 font-mono text-sm transition-colors outline-none md:col-span-2 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            style={{ borderRadius: 'var(--radius-edge)' }}
            disabled={disabled}
            min={1950}
            max={2100}
          />
          <button
            type="button"
            onClick={addApplication}
            disabled={disabled || !draft.brand.trim() || !draft.model.trim()}
            className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold tracking-wide uppercase transition disabled:cursor-not-allowed disabled:opacity-40 md:col-span-2"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
