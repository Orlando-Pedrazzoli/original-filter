'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)]',
} as const;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: keyof typeof modalSizes;
  children: ReactNode;
  footer?: ReactNode;
  closeOnOverlay?: boolean;
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnOverlay = true,
}: ModalProps) {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full rounded-xl bg-white shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-200',
          modalSizes[size],
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-dark text-lg font-bold">
                    {title}
                  </h2>
                )}
                {description && <p className="text-muted-dark mt-1 text-sm">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="text-muted hover:text-dark hover:bg-surface -mt-1 -mr-1 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Close button when no header */}
        {!title && !description && (
          <button
            onClick={onClose}
            className="text-muted hover:text-dark hover:bg-surface absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
