import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="text-dark mb-1.5 block text-sm font-medium">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'text-dark flex min-h-[120px] w-full resize-y rounded-lg border bg-white px-4 py-3 text-sm outline-none',
            'transition-all duration-200',
            'placeholder:text-muted',
            'focus:border-brand focus:ring-brand/20 focus:ring-2',
            'disabled:bg-surface disabled:cursor-not-allowed disabled:opacity-60',
            error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-surface-alt',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />

        {error && (
          <p id={`${textareaId}-error`} className="text-danger mt-1 text-xs" role="alert">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${textareaId}-hint`} className="text-muted mt-1 text-xs">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
