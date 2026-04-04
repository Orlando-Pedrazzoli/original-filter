import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helperText, showCount, maxLength, className, id, value, ...props },
    ref,
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-dark mb-1.5 block text-sm font-medium"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full min-h-[120px] rounded-lg border bg-white px-4 py-3 text-sm outline-none transition-all duration-200 resize-y',
            'placeholder:text-muted',
            'focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-danger text-danger focus:border-danger focus:ring-danger/20'
              : 'border-surface-alt text-dark focus:border-brand focus:ring-brand/20',
            'disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60',
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />

        <div className="mt-1.5 flex items-center justify-between">
          <div>
            {error && (
              <p className="text-danger text-xs" role="alert">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-muted text-xs">{helperText}</p>
            )}
          </div>

          {showCount && maxLength && (
            <p
              className={cn(
                'text-xs',
                charCount >= maxLength ? 'text-danger' : 'text-muted',
              )}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
export default Textarea;