import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, type = 'text', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="text-dark mb-1.5 block text-sm font-medium">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="text-muted pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              'text-dark flex h-11 w-full rounded-lg border bg-white px-4 text-sm outline-none',
              'transition-all duration-200',
              'placeholder:text-muted',
              'focus:border-brand focus:ring-brand/20 focus:ring-2',
              'disabled:bg-surface disabled:cursor-not-allowed disabled:opacity-60',
              icon ? 'pl-11' : '',
              error
                ? 'border-danger focus:border-danger focus:ring-danger/20'
                : 'border-surface-alt',
              className,
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-danger mt-1 text-xs" role="alert">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-muted mt-1 text-xs">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
