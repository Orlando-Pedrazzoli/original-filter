/* ══════════════════════════════════════════
   Original Filter — Utilitários de Formatação
   ══════════════════════════════════════════ */

/** Formata número como moeda BRL (R$ 0,00) */
export function formatBRL(value: number | null | undefined): string {
  if (value == null || value === 0) return 'Sob consulta';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/** Formata número com separador de milhar (1.234) */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/** Remove o SKU repetido do título (ex: "OFA2023C - Filtro de Ar" → "Filtro de Ar") */
export function cleanProductTitle(title: string, sku: string): string {
  return title
    .replace(sku, '')
    .replace(/^\s*[-–—]\s*/, '')
    .trim();
}

/** Converte productType para label em português */
export function productTypeLabel(type: string): string {
  switch (type) {
    case 'filter':
      return 'Filtro';
    case 'sensor':
      return 'Sensor';
    case 'accessory':
      return 'Acessório';
    default:
      return type;
  }
}

/** Pluralização simples */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}
