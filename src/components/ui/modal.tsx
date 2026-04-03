'use client';

import { Fragment, type ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showClose?: boolean;
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
}: ModalProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="bg-dark/60 fixed inset-0 backdrop-blur-sm" />
        </TransitionChild>

        {/* Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <DialogPanel
              className={cn(
                'relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl',
                SIZE_CLASSES[size],
              )}
            >
              {/* Brand accent line */}
              <div className="bg-brand h-1 w-full" />

              {/* Header */}
              {(title || showClose) && (
                <div className="flex items-start justify-between gap-4 px-6 pt-6">
                  <div>
                    {title && (
                      <DialogTitle className="font-heading text-dark text-lg font-bold">
                        {title}
                      </DialogTitle>
                    )}
                    {description && <p className="text-muted-dark mt-1 text-sm">{description}</p>}
                  </div>

                  {showClose && (
                    <button
                      onClick={onClose}
                      className="text-muted hover:bg-surface hover:text-dark flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                      aria-label="Fechar"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="px-6 py-6">{children}</div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

// ── Modal Footer ──
export function ModalFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'border-surface-alt bg-surface/50 -mx-6 mt-2 -mb-6 flex items-center justify-end gap-3 border-t px-6 py-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
