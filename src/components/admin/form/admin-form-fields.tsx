/* ══════════════════════════════════════════
   AdminFormField — Original Filter Admin
   ──────────────────────────────────────────
   Wrapper unificado para campos de formulário.
   Estilo Tailwind direto (sem styled-jsx para evitar hydration mismatch).

   Variantes exportadas:
   - FieldWrapper       (label + error + slot)
   - TextField          (input type=text/email/url)
   - NumberField        (input type=number)
   - TextareaField      (textarea)
   - SelectField        (select)
   - CheckboxField      (checkbox com label inline)
   - ToggleField        (switch ON/OFF visual)
   ══════════════════════════════════════════ */

'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

// ─── Classes base ───
const INPUT_BASE =
  'w-full bg-white border border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel px-4 py-2.5 text-sm leading-normal outline-none transition-colors disabled:opacity-50 disabled:bg-brand-snow disabled:cursor-not-allowed';

const RADIUS_STYLE = { borderRadius: 'var(--radius-edge)' };

// ══════════════════════════════════════════
// FieldWrapper
// ══════════════════════════════════════════
interface FieldWrapperProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function FieldWrapper({
  label,
  required,
  error,
  hint,
  htmlFor,
  className = '',
  children,
}: FieldWrapperProps) {
  return (
    <div className={className} data-field-error={error ? 'true' : undefined}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase"
        >
          {label}
          {required && <span className="text-brand-yellow-deep ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">{children}</div>

      {hint && !error && (
        <div className="text-brand-steel mt-1 font-mono text-[10px] tracking-widest uppercase">
          {hint}
        </div>
      )}

      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="size-3" strokeWidth={2} />
          {error}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// TextField
// ══════════════════════════════════════════
interface TextFieldProps extends Omit<FieldWrapperProps, 'children' | 'htmlFor'> {
  id?: string;
  name?: string;
  type?: 'text' | 'email' | 'url' | 'tel' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  mono?: boolean;
}

export function TextField({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
  autoFocus,
  minLength,
  maxLength,
  pattern,
  mono,
  label,
  required,
  error,
  hint,
  className,
}: TextFieldProps) {
  return (
    <FieldWrapper
      label={label}
      required={required}
      error={error}
      hint={hint}
      htmlFor={id}
      className={className}
    >
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} ${mono ? 'font-mono' : ''}`}
        style={RADIUS_STYLE}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        required={required}
      />
    </FieldWrapper>
  );
}

// ══════════════════════════════════════════
// NumberField
// ══════════════════════════════════════════
interface NumberFieldProps extends Omit<FieldWrapperProps, 'children' | 'htmlFor'> {
  id?: string;
  name?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string; // ex: R$
  suffix?: string; // ex: kg
}

export function NumberField({
  id,
  name,
  value,
  onChange,
  placeholder,
  disabled,
  min,
  max,
  step,
  prefix,
  suffix,
  label,
  required,
  error,
  hint,
  className,
}: NumberFieldProps) {
  // State local que permite string vazia temporariamente durante edição.
  // Sincroniza com `value` quando este muda externamente (ex: load do form).
  const [draft, setDraft] = useState<string>(Number.isFinite(value) ? String(value) : '');

  // Sync quando o value externo muda (ex: form carrega novos dados)
  // Só atualiza se a mudança não veio do próprio input (evita loop).
  useEffect(() => {
    const parsed = parseFloat(draft);
    // Só sincroniza se o valor externo é diferente do que o draft representa
    if (parsed !== value && !(Number.isNaN(parsed) && value === 0)) {
      setDraft(Number.isFinite(value) ? String(value) : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(raw: string) {
    // Aceita números, ponto e vírgula (vírgula vira ponto)
    const normalized = raw.replace(',', '.');

    // Permite: vazio, "-", "0.", ".5", "1.", "1.23"
    if (normalized === '' || normalized === '-' || /^-?\d*\.?\d*$/.test(normalized)) {
      setDraft(normalized);

      // Só dispara onChange numérico se for um número completo válido
      const parsed = parseFloat(normalized);
      if (Number.isFinite(parsed)) {
        onChange(parsed);
      } else if (normalized === '' || normalized === '-' || normalized === '.') {
        // Estados intermediários: notifica como 0 mas mantém o draft visual
        onChange(0);
      }
    }
  }

  function handleBlur() {
    // Ao sair do campo, se ficou vazio ou inválido, normaliza para "0"
    const parsed = parseFloat(draft);
    if (!Number.isFinite(parsed)) {
      setDraft('0');
      onChange(0);
    } else {
      // Normaliza visualmente (ex: ".5" vira "0.5")
      setDraft(String(parsed));
    }
  }

  return (
    <FieldWrapper
      label={label}
      required={required}
      error={error}
      hint={hint}
      htmlFor={id}
      className={className}
    >
      <div className="relative flex items-stretch">
        {prefix && (
          <span
            className="bg-brand-snow border-brand-mist text-brand-iron inline-flex items-center border border-r-0 px-3 font-mono text-xs"
            style={{
              borderTopLeftRadius: 'var(--radius-edge)',
              borderBottomLeftRadius: 'var(--radius-edge)',
            }}
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onFocus={(e) => e.target.select()}
          className={`${INPUT_BASE} font-mono`}
          style={{
            borderRadius: 'var(--radius-edge)',
            ...(prefix ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : {}),
            ...(suffix ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 } : {}),
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
        />
        {suffix && (
          <span
            className="bg-brand-snow border-brand-mist text-brand-iron inline-flex items-center border border-l-0 px-3 font-mono text-xs"
            style={{
              borderTopRightRadius: 'var(--radius-edge)',
              borderBottomRightRadius: 'var(--radius-edge)',
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      {/* min/max/step preservados como atributos invisíveis para validação HTML opcional */}
      {(min !== undefined || max !== undefined || step !== undefined) && (
        <input type="hidden" data-min={min} data-max={max} data-step={step} />
      )}
    </FieldWrapper>
  );
}

// ══════════════════════════════════════════
// TextareaField
// ══════════════════════════════════════════
interface TextareaFieldProps extends Omit<FieldWrapperProps, 'children' | 'htmlFor'> {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
}

export function TextareaField({
  id,
  name,
  value,
  onChange,
  placeholder,
  disabled,
  rows = 4,
  maxLength,
  label,
  required,
  error,
  hint,
  className,
}: TextareaFieldProps) {
  const counter = maxLength ? (
    <div className="text-brand-mist absolute right-3 bottom-2 font-mono text-[10px]">
      {value.length}/{maxLength}
    </div>
  ) : null;

  return (
    <FieldWrapper
      label={label}
      required={required}
      error={error}
      hint={hint}
      htmlFor={id}
      className={className}
    >
      <div className="relative">
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT_BASE} resize-y ${maxLength ? 'pb-7' : ''}`}
          style={RADIUS_STYLE}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          required={required}
        />
        {counter}
      </div>
    </FieldWrapper>
  );
}

// ══════════════════════════════════════════
// SelectField
// ══════════════════════════════════════════
interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<FieldWrapperProps, 'children' | 'htmlFor'> {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
}

export function SelectField({
  id,
  name,
  value,
  onChange,
  options,
  disabled,
  placeholder,
  label,
  required,
  error,
  hint,
  className,
}: SelectFieldProps) {
  return (
    <FieldWrapper
      label={label}
      required={required}
      error={error}
      hint={hint}
      htmlFor={id}
      className={className}
    >
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} cursor-pointer appearance-none pr-10`}
        style={RADIUS_STYLE}
        disabled={disabled}
        required={required}
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
      <svg
        className="text-brand-steel pointer-events-none absolute top-3 right-3 size-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </FieldWrapper>
  );
}

// ══════════════════════════════════════════
// ToggleField — switch ON/OFF
// ══════════════════════════════════════════
interface ToggleFieldProps {
  id?: string;
  name?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function ToggleField({
  id,
  name,
  checked,
  onChange,
  label,
  description,
  disabled,
  className = '',
}: ToggleFieldProps) {
  return (
    <label
      htmlFor={id}
      className={`group flex cursor-pointer items-start justify-between gap-3 ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      } ${className}`}
    >
      <div className="min-w-0 flex-1">
        <div className="font-display text-brand-black text-sm leading-tight font-semibold">
          {label}
        </div>
        {description && (
          <div className="text-brand-iron mt-0.5 font-mono text-[10px] tracking-wider uppercase">
            {description}
          </div>
        )}
      </div>

      <span
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center transition-colors duration-200 ${
          checked ? 'bg-brand-yellow' : 'bg-brand-mist'
        }`}
        style={RADIUS_STYLE}
      >
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="absolute h-full w-full cursor-pointer opacity-0"
        />
        <span
          className={`inline-block size-4 bg-white transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
          style={RADIUS_STYLE}
        />
      </span>
    </label>
  );
}

// ══════════════════════════════════════════
// AdminSection — Agrupador de campos
// ══════════════════════════════════════════
interface AdminSectionProps {
  step?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function AdminSection({
  step,
  title,
  description,
  children,
  className = '',
}: AdminSectionProps) {
  return (
    <div
      className={`bg-brand-white border-brand-mist relative border p-5 md:p-6 ${className}`}
      style={RADIUS_STYLE}
    >
      <div className="bg-brand-yellow absolute top-5 bottom-5 left-0 w-1 md:top-6 md:bottom-6" />

      <div className="mb-5 pl-4">
        {step && (
          <div className="text-brand-yellow-deep mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
            Etapa {step}
          </div>
        )}
        <h3
          className="font-display text-brand-black leading-tight font-black"
          style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h3>
        {description && (
          <p className="text-brand-steel mt-1.5 text-sm leading-relaxed">{description}</p>
        )}
      </div>

      <div className="space-y-4 pl-4">{children}</div>
    </div>
  );
}
