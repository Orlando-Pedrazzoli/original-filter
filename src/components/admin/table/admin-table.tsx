/* ══════════════════════════════════════════
   AdminTable — Original Filter Admin
   ──────────────────────────────────────────
   Tabela genérica com:
   - Colunas customizáveis (label, render, sortable)
   - Estado vazio
   - Estado de loading
   - Seleção de linhas (opcional)
   - Sort por coluna (controlado externamente)
   - Click na linha (opcional)

   Estilo industrial: linhas densas, mono uppercase em headers,
   faixa amarela no hover, sem cantos arredondados em excesso.
   ══════════════════════════════════════════ */

'use client';

import { ChevronDown, ChevronUp, ChevronsUpDown, Loader2 } from 'lucide-react';

export interface AdminTableColumn<T> {
  key: string;
  label: string;
  /** Função que recebe o item e retorna o conteúdo da célula */
  render: (item: T) => React.ReactNode;
  /** Se essa coluna é sortable. Se sim, key deve bater com o param de sort da API */
  sortable?: boolean;
  /** Alinhamento do conteúdo (default: left) */
  align?: 'left' | 'center' | 'right';
  /** Largura sugerida (CSS) */
  width?: string;
  /** Esconde em mobile */
  hideOnMobile?: boolean;
}

interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  items: T[];
  /** Função que retorna a chave única do item (default: index) */
  rowKey?: (item: T, index: number) => string;
  /** Estado de loading */
  loading?: boolean;
  /** Mensagem custom para estado vazio */
  emptyMessage?: string;
  emptyHint?: React.ReactNode;

  // Sort
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (key: string) => void;

  // Seleção
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;

  // Click
  onRowClick?: (item: T) => void;
}

export function AdminTable<T>({
  columns,
  items,
  rowKey,
  loading,
  emptyMessage = 'Nenhum registro encontrado',
  emptyHint,
  sortKey,
  sortOrder,
  onSortChange,
  selectable,
  selectedKeys,
  onSelectionChange,
  onRowClick,
}: AdminTableProps<T>) {
  const getKey = (item: T, index: number): string => (rowKey ? rowKey(item, index) : String(index));

  const allSelected =
    selectable && items.length > 0 && items.every((item, i) => selectedKeys?.has(getKey(item, i)));
  const someSelected =
    selectable && items.some((item, i) => selectedKeys?.has(getKey(item, i))) && !allSelected;

  function toggleAll() {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (allSelected) {
      // Desmarca apenas os atuais
      items.forEach((item, i) => next.delete(getKey(item, i)));
    } else {
      items.forEach((item, i) => next.add(getKey(item, i)));
    }
    onSelectionChange(next);
  }

  function toggleRow(key: string) {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  }

  return (
    <div
      className="bg-brand-white border-brand-mist overflow-hidden border"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-brand-mist bg-brand-snow border-b">
              {selectable && (
                <th className="w-12 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = !!someSelected;
                    }}
                    onChange={toggleAll}
                    className="accent-brand-yellow size-4 cursor-pointer"
                    aria-label="Selecionar todos"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const align =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                      ? 'text-center'
                      : 'text-left';
                return (
                  <th
                    key={col.key}
                    className={`text-brand-iron px-4 py-3 font-mono text-[10px] font-bold tracking-[0.22em] uppercase ${align} ${
                      col.hideOnMobile ? 'hidden md:table-cell' : ''
                    } ${col.sortable && onSortChange ? 'hover:text-brand-black cursor-pointer transition select-none' : ''}`}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => {
                      if (col.sortable && onSortChange) onSortChange(col.key);
                    }}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {col.label}
                      {col.sortable && (
                        <span className="text-brand-mist">
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="size-3" />
                            ) : (
                              <ChevronDown className="size-3" />
                            )
                          ) : (
                            <ChevronsUpDown className="size-3 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-16 text-center"
                >
                  <Loader2 className="text-brand-iron mx-auto mb-3 size-6 animate-spin" />
                  <div className="text-brand-iron text-sm">Carregando...</div>
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-16 text-center"
                >
                  <div className="font-display text-brand-black mb-2 font-bold">{emptyMessage}</div>
                  {emptyHint && <div className="text-brand-iron text-sm">{emptyHint}</div>}
                </td>
              </tr>
            )}

            {items.map((item, i) => {
              const key = getKey(item, i);
              const isSelected = selectedKeys?.has(key);
              return (
                <tr
                  key={key}
                  className={`border-brand-mist border-b transition-colors last:border-0 ${
                    isSelected ? 'bg-brand-yellow/5' : 'hover:bg-brand-snow'
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <td className="w-12 px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={() => toggleRow(key)}
                        className="accent-brand-yellow size-4 cursor-pointer"
                        aria-label={`Selecionar linha ${i + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const align =
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left';
                    return (
                      <td
                        key={col.key}
                        className={`text-brand-black px-4 py-3 text-sm ${align} ${
                          col.hideOnMobile ? 'hidden md:table-cell' : ''
                        }`}
                      >
                        {col.render(item)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
