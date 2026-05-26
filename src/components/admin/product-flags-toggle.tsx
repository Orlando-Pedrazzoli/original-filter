/* ══════════════════════════════════════════
   ProductFlagsToggle — Original Filter
   ──────────────────────────────────────────
   Toggle reutilizável para alternar flags de um produto.
   Usado em:
   - Página /admin/lancamentos (gestão em massa)
   - (Futuro) ProductCard inline para admin logado
   - (Futuro) Detalhe do produto em modo admin

   Faz PATCH em /api/admin/products/[slug]/flags em tempo real.
   Optimistic update: atualiza a UI imediatamente, reverte em caso de erro.
   ══════════════════════════════════════════ */

'use client';

import { useState, useTransition } from 'react';
import { Sparkles, Award, Star, Loader2, Check, AlertCircle } from 'lucide-react';

export type ProductFlags = {
  isNewRelease: boolean;
  isPatented: boolean;
  isFeatured: boolean;
};

interface ProductFlagsToggleProps {
  slug: string;
  sku: string;
  initialFlags: ProductFlags;
  /** Se true, mostra apenas a flag isNewRelease (modo compacto) */
  compact?: boolean;
  /** Callback chamado após cada atualização bem-sucedida */
  onUpdate?: (flags: ProductFlags) => void;
}

type ToggleStatus = 'idle' | 'saving' | 'saved' | 'error';

export function ProductFlagsToggle({
  slug,
  sku,
  initialFlags,
  compact = false,
  onUpdate,
}: ProductFlagsToggleProps) {
  const [flags, setFlags] = useState<ProductFlags>(initialFlags);
  const [status, setStatus] = useState<ToggleStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  async function updateFlag(key: keyof ProductFlags, value: boolean) {
    // Optimistic update
    const previous = flags;
    const next = { ...flags, [key]: value };
    setFlags(next);
    setStatus('saving');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/admin/products/${slug}/flags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Erro ${res.status}: falha ao atualizar`);
      }

      const data = await res.json();
      const updatedFlags: ProductFlags = {
        isNewRelease: data.product.isNewRelease,
        isPatented: data.product.isPatented,
        isFeatured: data.product.isFeatured,
      };

      setFlags(updatedFlags);
      setStatus('saved');
      onUpdate?.(updatedFlags);

      // Limpa status "saved" após 1.5s
      setTimeout(() => setStatus('idle'), 1500);

      // Revalida páginas que mostram esses flags (em background)
      startTransition(() => {
        // ISR de /lancamentos será revalidada na próxima requisição
      });
    } catch (err) {
      // Reverte
      setFlags(previous);
      setStatus('error');
      setErrorMsg((err as Error).message);
      setTimeout(() => {
        setStatus('idle');
        setErrorMsg('');
      }, 3000);
    }
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <ToggleSwitch
          checked={flags.isNewRelease}
          onChange={(v) => updateFlag('isNewRelease', v)}
          label="Lançamento"
          icon={<Sparkles className="size-3" strokeWidth={2.5} />}
          color="yellow"
          disabled={status === 'saving' || isPending}
        />
        <StatusIndicator status={status} errorMsg={errorMsg} />
      </div>
    );
  }

  return (
    <div
      className="bg-brand-white border-brand-mist border p-4 md:p-5"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-brand-iron mb-0.5 font-mono text-[10px] tracking-widest uppercase">
            Flags do produto
          </div>
          <div className="text-brand-black font-mono text-sm font-bold">{sku}</div>
        </div>
        <StatusIndicator status={status} errorMsg={errorMsg} />
      </div>

      <div className="space-y-2.5">
        <ToggleSwitch
          checked={flags.isNewRelease}
          onChange={(v) => updateFlag('isNewRelease', v)}
          label="Lançamento"
          description="Aparece em /lancamentos"
          icon={<Sparkles className="size-3.5" strokeWidth={2} />}
          color="yellow"
          disabled={status === 'saving' || isPending}
        />
        <ToggleSwitch
          checked={flags.isPatented}
          onChange={(v) => updateFlag('isPatented', v)}
          label="Patenteado"
          description="Mostra badge no card"
          icon={<Award className="size-3.5" strokeWidth={2} />}
          color="dark"
          disabled={status === 'saving' || isPending}
        />
        <ToggleSwitch
          checked={flags.isFeatured}
          onChange={(v) => updateFlag('isFeatured', v)}
          label="Em destaque"
          description="Aparece na home"
          icon={<Star className="size-3.5" strokeWidth={2} />}
          color="iron"
          disabled={status === 'saving' || isPending}
        />
      </div>
    </div>
  );
}

// ═══ ToggleSwitch ═══
function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  icon,
  color = 'yellow',
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  icon: React.ReactNode;
  color?: 'yellow' | 'dark' | 'iron';
  disabled?: boolean;
}) {
  const activeBg =
    color === 'yellow' ? 'bg-brand-yellow' : color === 'dark' ? 'bg-brand-black' : 'bg-brand-iron';

  return (
    <label
      className={`group flex cursor-pointer items-center justify-between gap-3 ${
        disabled ? 'cursor-wait opacity-60' : ''
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className={`flex size-7 shrink-0 items-center justify-center transition ${
            checked
              ? `${activeBg} ${color === 'yellow' ? 'text-brand-black' : 'text-brand-yellow'}`
              : 'bg-brand-snow text-brand-iron'
          }`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <div className="font-display text-brand-black text-sm leading-tight font-semibold">
            {label}
          </div>
          {description && (
            <div className="text-brand-iron mt-0.5 font-mono text-[10px] tracking-wider uppercase">
              {description}
            </div>
          )}
        </div>
      </div>

      {/* Switch visual */}
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center transition-colors duration-200 ${
          checked ? activeBg : 'bg-brand-mist'
        }`}
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="absolute h-full w-full cursor-pointer opacity-0 disabled:cursor-wait"
          aria-label={label}
        />
        <span
          className={`inline-block size-4 bg-white transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
          style={{ borderRadius: 'var(--radius-edge)' }}
        />
      </span>
    </label>
  );
}

// ═══ StatusIndicator ═══
function StatusIndicator({ status, errorMsg }: { status: ToggleStatus; errorMsg: string }) {
  if (status === 'idle') return null;

  if (status === 'saving') {
    return (
      <div className="text-brand-iron flex items-center gap-1.5 font-mono text-xs tracking-widest uppercase">
        <Loader2 className="size-3 animate-spin" />
        Salvando
      </div>
    );
  }

  if (status === 'saved') {
    return (
      <div className="text-brand-yellow-deep flex items-center gap-1.5 font-mono text-xs tracking-widest uppercase">
        <Check className="size-3" strokeWidth={3} />
        Salvo
      </div>
    );
  }

  return (
    <div
      className="flex max-w-[200px] items-center gap-1.5 font-mono text-xs tracking-widest text-red-600 uppercase"
      title={errorMsg}
    >
      <AlertCircle className="size-3" strokeWidth={2.5} />
      <span className="truncate">{errorMsg || 'Erro'}</span>
    </div>
  );
}
