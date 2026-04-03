import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="text-dark mb-1.5 block text-sm font-medium">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'text-dark flex h-11 w-full appearance-none rounded-lg border bg-white px-4 pr-10 text-sm outline-none',
              'transition-all duration-200',
              'focus:border-brand focus:ring-brand/20 focus:ring-2',
              'disabled:bg-surface disabled:cursor-not-allowed disabled:opacity-60',
              !props.value && placeholder ? 'text-muted' : '',
              error
                ? 'border-danger focus:border-danger focus:ring-danger/20'
                : 'border-surface-alt',
              className,
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="text-muted pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2" />
        </div>

        {error && (
          <p id={`${selectId}-error`} className="text-danger mt-1 text-xs" role="alert">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${selectId}-hint`} className="text-muted mt-1 text-xs">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export { Select };
