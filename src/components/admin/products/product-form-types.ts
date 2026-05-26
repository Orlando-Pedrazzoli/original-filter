/* ══════════════════════════════════════════
   Product Form Types — Original Filter Admin
   ──────────────────────────────────────────
   Tipos compartilhados entre o ProductFormClient,
   sub-componentes e callbacks.
   ══════════════════════════════════════════ */

export type ProductType = 'filter' | 'sensor' | 'accessory';
export type ProductStatus = 'active' | 'inactive' | 'discontinued';

export interface ProductApplicationForm {
  brand: string;
  model: string;
  engine?: string;
  yearStart?: number;
  yearEnd?: number;
}

export interface ProductDimensionsForm {
  height: number;
  width: number;
  depth: number;
}

export interface ProductImageForm {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductSEOForm {
  title?: string;
  description?: string;
  keywords?: string[];
}

/** Forma "achatada" usada pelo state do form */
export interface ProductFormState {
  // Identificação
  sku: string;
  slug: string;
  title: string;
  productType: ProductType;
  category: string;

  // Conteúdo
  description: string;
  shortDescription: string;

  // Preço e estoque
  retailPrice: number;
  stock: number;
  lowStockThreshold: number;
  manageStock: boolean;

  // Logística
  weight: number;
  dimensions: ProductDimensionsForm;

  // Aplicações
  applications: ProductApplicationForm[];

  // Códigos OEM
  oemCodes: string[];

  // Status & Flags
  status: ProductStatus;
  isNewRelease: boolean;
  isPatented: boolean;
  isFeatured: boolean;

  // Mídia
  images: ProductImageForm[];

  // SEO
  seo: ProductSEOForm;
}

export function createEmptyProductFormState(): ProductFormState {
  return {
    sku: '',
    slug: '',
    title: '',
    productType: 'filter',
    category: '',
    description: '',
    shortDescription: '',
    retailPrice: 0,
    stock: 0,
    lowStockThreshold: 5,
    manageStock: false,
    weight: 1,
    dimensions: { height: 1, width: 1, depth: 1 },
    applications: [],
    oemCodes: [],
    status: 'active',
    isNewRelease: false,
    isPatented: false,
    isFeatured: false,
    images: [],
    seo: { title: '', description: '', keywords: [] },
  };
}
