import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="text-dark mb-1.5 block text-sm font-medium">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'h-11 w-full appearance-none rounded-lg border bg-white pr-10 pl-4 text-sm transition-all duration-200 outline-none',
              'focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-danger text-danger focus:border-danger focus:ring-danger/20'
                : 'border-surface-alt text-dark focus:border-brand focus:ring-brand/20',
              'disabled:bg-surface disabled:cursor-not-allowed disabled:opacity-60',
              className,
            )}
            aria-invalid={!!error}
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

          {/* Chevron */}
          <svg
            className="text-muted pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {error && (
          <p className="text-danger mt-1.5 text-xs" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && <p className="text-muted mt-1.5 text-xs">{helperText}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
export default Select;
