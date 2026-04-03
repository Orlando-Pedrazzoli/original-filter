import { useState, useEffect } from 'react';

/**
 * Debounce a value — delays updating until the user stops changing it.
 * Perfect for search inputs to avoid firing API calls on every keystroke.
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 400);
 *
 * useEffect(() => {
 *   if (debouncedSearch) fetchProducts(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
