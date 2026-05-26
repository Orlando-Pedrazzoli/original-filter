/* ══════════════════════════════════════════
   AdminToast — Sistema de notificações
   ──────────────────────────────────────────
   Toast inline com context + provider.
   Zero dependências, controle visual industrial.

   Uso:
   ```
   const { toast } = useAdminToast();
   toast.success('Produto salvo');
   toast.error('Erro ao deletar');
   toast.info('Algo informativo');
   ```
   ══════════════════════════════════════════ */

'use client';

import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastContextValue {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    // Auto-remove
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: ToastContextValue = {
    toast: {
      success: (m, d) => push('success', m, d),
      error: (m, d) => push('error', m, d ?? 6000),
      info: (m, d) => push('info', m, d),
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useAdminToast deve ser usado dentro de AdminToastProvider');
  }
  return ctx;
}

// ─── Viewport ───
function ToastViewport({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-6 bottom-6 z-[100] flex max-w-md flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Entrada animada
    const t = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(t);
  }, []);

  const config = {
    success: {
      bg: 'bg-brand-black',
      accent: 'bg-brand-yellow',
      icon: <CheckCircle2 className="text-brand-yellow size-4" strokeWidth={2.5} />,
      label: 'Sucesso',
    },
    error: {
      bg: 'bg-red-950',
      accent: 'bg-red-500',
      icon: <AlertCircle className="size-4 text-red-400" strokeWidth={2.5} />,
      label: 'Erro',
    },
    info: {
      bg: 'bg-brand-graphite',
      accent: 'bg-white/40',
      icon: <Info className="size-4 text-white/80" strokeWidth={2.5} />,
      label: 'Aviso',
    },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden ${config.bg} text-white shadow-lg transition-all duration-300 ${
        show ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      }`}
      style={{ borderRadius: 'var(--radius-edge)' }}
      role="status"
    >
      <div className={`absolute top-0 bottom-0 left-0 w-1 ${config.accent}`} />
      <div className="flex items-start gap-3 px-5 py-4 pr-10 pl-6">
        <div className="mt-0.5 shrink-0">{config.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">
            {config.label}
          </div>
          <div className="text-sm leading-relaxed">{toast.message}</div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(toast.id)}
          className="absolute top-2 right-2 flex size-6 items-center justify-center text-white/40 transition hover:text-white"
          aria-label="Fechar"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
