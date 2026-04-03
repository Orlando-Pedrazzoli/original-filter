// ══════════════════════════════════════════
// Original Filter — Formatting Utilities
// ══════════════════════════════════════════

/**
 * Format price in Brazilian Real (BRL)
 * formatPrice(149.9) → "R$ 149,90"
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format date in Brazilian format
 * formatDate('2024-03-15') → "15/03/2024"
 * formatDate('2024-03-15', 'long') → "15 de março de 2024"
 */
export function formatDate(
  date: string | Date,
  style: 'short' | 'long' | 'relative' = 'short',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (style === 'relative') {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'agora mesmo';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    if (days < 30) return `${Math.floor(days / 7)} sem atrás`;
    // Fall through to short format
  }

  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: style === 'long' ? 'long' : '2-digit',
    year: 'numeric',
  });
}

/**
 * Format phone number for display
 * formatPhone('+5511461334554') → "(11) 4613-3454"
 * formatPhone('11999887766') → "(11) 99988-7766"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // Remove country code if present
  const local = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;

  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }

  return phone;
}

/**
 * Format product code for display
 * formatProductCode('OFC1003B') → "OFC-1003 B"
 */
export function formatProductCode(code: string): string {
  return code.replace(/([A-Z]+)(\d+)([A-Z]?)/, '$1-$2 $3').trim();
}

/**
 * Truncate text with ellipsis
 * truncate('Lorem ipsum dolor sit amet', 20) → "Lorem ipsum dolor..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Format number with dot separators (Brazilian style)
 * formatNumber(1500) → "1.500"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Slugify a string
 * slugify('Filtro de Ar') → "filtro-de-ar"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
