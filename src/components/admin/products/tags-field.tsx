/* ══════════════════════════════════════════
   TagsField — Original Filter Admin
   ──────────────────────────────────────────
   Input que vira chip ao apertar Enter (ou vírgula).
   Reutilizado para: códigos OEM, keywords SEO, fornecedores, etc.
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface TagsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Se true, força maiúsculas em cada tag */
  uppercase?: boolean;
  /** Limite de caracteres por tag */
  maxLength?: number;
  /** Validador customizado (retorna true se válido) */
  validate?: (tag: string) => boolean;
  /** Cor do chip */
  variant?: 'default' | 'mono' | 'yellow';
}

export function TagsField({
  value,
  onChange,
  placeholder = 'Digite e pressione Enter',
  disabled,
  uppercase,
  maxLength = 100,
  validate,
  variant = 'default',
}: TagsFieldProps) {
  const [draft, setDraft] = useState('');

  function commit(raw: string) {
    let tag = raw.trim();
    if (!tag) return;
    if (uppercase) tag = tag.toUpperCase();
    if (validate && !validate(tag)) return;
    if (value.includes(tag)) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const chipClass = {
    default: 'bg-brand-snow border border-brand-mist text-brand-black',
    mono: 'bg-brand-black text-brand-yellow font-mono',
    yellow: 'bg-brand-yellow text-brand-black',
  }[variant];

  return (
    <div
      className="border-brand-mist focus-within:border-brand-yellow flex min-h-[44px] flex-wrap items-center gap-1.5 border bg-white px-3 py-2 transition-colors"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs ${chipClass}`}
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeAt(i)}
            disabled={disabled}
            className="opacity-60 transition hover:opacity-100"
            aria-label={`Remover ${tag}`}
          >
            <X className="size-3" strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft && commit(draft)}
        placeholder={value.length === 0 ? placeholder : ''}
        className="text-brand-black placeholder:text-brand-steel min-w-[120px] flex-1 bg-transparent text-sm outline-none"
        disabled={disabled}
        maxLength={maxLength}
      />
    </div>
  );
}
