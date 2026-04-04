export function formatPrice(value: number): string { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); }
export function formatDate(date: Date | string): string { return new Intl.DateTimeFormat('pt-BR').format(new Date(date)); }
export function formatPhone(phone: string): string { return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '(\) \-\'); }