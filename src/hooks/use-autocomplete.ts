/* ══════════════════════════════════════════
   useAutocomplete
   ──────────────────────────────────────────
   Hook para o autocomplete da navbar:
   - debounce de 200ms (não chama API a cada tecla)
   - cancela requests anteriores quando o usuário digita rápido
   - retorna { suggestions, loading, error }
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { AutocompleteResponse, AutocompleteSuggestion } from '@/lib/search-types';

const DEBOUNCE_MS = 200;
const MIN_QUERY = 2;

interface AutocompleteState {
  suggestions: AutocompleteSuggestion[];
  loading: boolean;
  error: string | null;
}

export function useAutocomplete(query: string): AutocompleteState {
  const [state, setState] = useState<AutocompleteState>({
    suggestions: [],
    loading: false,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Limpa timer anterior
    if (timerRef.current) clearTimeout(timerRef.current);
    // Cancela request anterior
    if (abortRef.current) abortRef.current.abort();

    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY) {
      setState({ suggestions: [], loading: false, error: null });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Erro de rede');

        const data: AutocompleteResponse = await res.json();
        setState({
          suggestions: data.suggestions ?? [],
          loading: false,
          error: null,
        });
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setState({
          suggestions: [],
          loading: false,
          error: (err as Error).message,
        });
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query]);

  return state;
}
