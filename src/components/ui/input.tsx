import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="text-dark mb-1.5 block text-sm font-medium">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span className="text-muted pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-11 w-full rounded-lg border bg-white text-sm transition-all duration-200 outline-none',
              'placeholder:text-muted',
              'focus:ring-2 focus:ring-offset-0',
              icon ? 'pr-4 pl-10' : 'px-4',
              error
                ? 'border-danger text-danger focus:border-danger focus:ring-danger/20'
                : 'border-surface-alt text-dark focus:border-brand focus:ring-brand/20',
              'disabled:bg-surface disabled:cursor-not-allowed disabled:opacity-60',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-danger mt-1.5 text-xs" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-muted mt-1.5 text-xs">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
