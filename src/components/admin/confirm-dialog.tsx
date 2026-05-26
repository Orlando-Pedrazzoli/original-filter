/* ══════════════════════════════════════════
   ConfirmDialog — Original Filter Admin
   ──────────────────────────────────────────
   Modal de confirmação reutilizável para ações destrutivas.
   ══════════════════════════════════════════ */

'use client';

import { useEffect } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading,
}: ConfirmDialogProps) {
  // Fecha com ESC
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose, loading]);

  if (!open) return null;

  const confirmClass = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-brand-yellow hover:bg-brand-yellow-bright text-brand-black',
    default: 'bg-brand-black hover:bg-brand-graphite text-brand-yellow',
  }[variant];

  const iconBgClass = {
    danger: 'bg-red-50 text-red-600',
    warning: 'bg-brand-yellow/10 text-brand-yellow-deep',
    default: 'bg-brand-snow text-brand-iron',
  }[variant];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-brand-white relative w-full max-w-md p-6"
        style={{ borderRadius: 'var(--radius-edge)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="text-brand-iron hover:text-brand-black absolute top-3 right-3 inline-flex size-7 items-center justify-center transition disabled:opacity-50"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`flex size-12 shrink-0 items-center justify-center ${iconBgClass}`}>
            <AlertTriangle className="size-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              className="font-display text-brand-black mb-2 leading-tight font-black"
              style={{
                fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
                letterSpacing: '-0.025em',
              }}
            >
              {title}
            </h2>
            {description && (
              <div className="text-brand-iron text-sm leading-relaxed">{description}</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="font-display text-brand-iron hover:text-brand-black border-brand-mist hover:border-brand-iron border px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition disabled:opacity-50"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`font-display inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide uppercase transition disabled:cursor-wait disabled:opacity-50 ${confirmClass}`}
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
