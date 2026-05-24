/* ══════════════════════════════════════════
   Original Filter — Tipos Centrais
   ══════════════════════════════════════════ */

// ─── Navegação ───────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

// ─── Usuário ─────────────────────────────────────────────
export type UserRole = 'admin' | 'retail' | 'reseller';
export type DiscountTier = 0 | 5 | 10 | 15 | 20;

export interface Address {
  label: 'principal' | 'cobranca' | 'entrega';
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  isDefault: boolean;
}

export interface CompanyData {
  razaoSocial: string;
  cnpj: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
}

// ─── Produto ─────────────────────────────────────────────
export type ProductType = 'filter' | 'sensor' | 'accessory';
export type ProductStatus = 'active' | 'inactive' | 'discontinued';

export interface ProductApplication {
  brand: string;
  model: string;
  engine?: string;
  yearStart?: number;
  yearEnd?: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductDimensions {
  height: number;
  width: number;
  depth: number;
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

// ─── Pedido ──────────────────────────────────────────────
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'chargeback';

export type FulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentMethod = 'credit_card' | 'pix' | 'boleto' | 'bank_transfer';

export type PaymentProvider = 'pagarme' | 'mercadopago';

// ─── Reseller Application ───────────────────────────────
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

// ─── Contato ─────────────────────────────────────────────
export type ContactSubject = 'duvidas' | 'orcamento' | 'elogios' | 'sugestoes' | 'reclamacoes';

// ─── Constantes ──────────────────────────────────────────
export interface ProductLine {
  name: string;
  slug: string;
  count: number;
}

export interface FilterCategory {
  name: string;
  slug: string;
  icon: string;
}

export interface MainBrand {
  name: string;
  slug: string;
}

export interface Language {
  code: string;
  label: string;
  flag: string;
}
