/* ══════════════════════════════════════════
   ProductsSearchBar — Original Filter
   ──────────────────────────────────────────
   Campo de busca da página /produtos.
   Sincroniza com URL ?q= e dispara navegação ao submeter.
   ══════════════════════════════════════════ */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function ProductsSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get('q') ?? '');

  // Sincroniza se a URL mudar externamente
  useEffect(() => {
    setValue(sp.get('q') ?? '');
  }, [sp]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(sp.toString());
    const trimmed = value.trim();
    if (trimmed) {
      params.set('q', trimmed);
    } else {
      params.delete('q');
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function clear() {
    setValue('');
    const params = new URLSearchParams(sp.toString());
    params.delete('q');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-md">
      <Search
        className="text-brand-steel pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        strokeWidth={2}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar por código, título ou aplicação..."
        spellCheck={false}
        autoComplete="off"
        className="border-brand-mist focus:border-brand-yellow placeholder:text-brand-steel w-full border bg-white py-2.5 pr-10 pl-10 text-sm font-medium transition outline-none placeholder:font-normal"
        style={{ borderRadius: 'var(--radius-edge)' }}
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="text-brand-steel hover:text-brand-black absolute top-1/2 right-2 -translate-y-1/2 p-1 transition"
          aria-label="Limpar busca"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}
