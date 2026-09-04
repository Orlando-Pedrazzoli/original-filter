// src/lib/search-types.ts
/* ══════════════════════════════════════════
   Original Filter — Tipos do Sistema de Busca
   ══════════════════════════════════════════
   Tipos compartilhados entre APIs e componentes da homepage:
   - Vehicle Selector (Linha → Marca → Modelo → Motor → Ano)
   - Cross-Reference (busca por código OEM/concorrente)
   - Autocomplete (sugestão instantânea de SKU/título)
   ══════════════════════════════════════════ */

import type { BrandCategory } from '../models/Brand';

// ─── Vehicle Selector ───

/**
 * Linha de veículo. Mapeada para o campo `category` de Brand.
 * "rodoviario" = caminhões/ônibus; "agricola" = tratores;
 * "maquinas-pesadas" = escavadeiras/pás-carregadeiras;
 * "industrial" = motores estacionários (Cummins, MWM, Bosch...).
 */
export type VehicleLineSlug = BrandCategory;

export interface VehicleLine {
  slug: VehicleLineSlug;
  label: string;
  description: string;
  /** Quantas marcas tem nesta linha (calculado dinamicamente). */
  brandCount?: number;
}

export interface VehicleBrandOption {
  /** Slug usado em rotas e queries (ex: "volvo"). */
  slug: string;
  /** Nome de exibição (ex: "VOLVO"). */
  name: string;
  /** Quantos produtos esta marca tem associados (para ordenar). */
  productCount: number;
}

export interface VehicleModelOption {
  /** O nome puro do modelo extraído das aplicações (ex: "FH 440"). */
  model: string;
  /** Quantos produtos servem este modelo. */
  productCount: number;
}

export interface VehicleEngineOption {
  engine: string;
  productCount: number;
}

export interface VehicleYearOption {
  /** Ano (do range yearStart..yearEnd das aplicações). */
  year: number;
  productCount: number;
}

/** Query final para buscar produtos por veículo (todos opcionais). */
export interface VehicleQuery {
  brand?: string; // nome canônico da marca (ex: "VOLVO")
  model?: string; // nome do modelo
  engine?: string;
  year?: number;
}

// ─── Cross-Reference ───

export type CrossRefSource =
  | 'oem' // código original da montadora (ex: Volvo 21380475)
  | 'competitor' // código de concorrente (Mann, Donaldson, Tecfil, etc.)
  | 'original' // já é código Original Filter
  | 'unknown';

export interface CrossRefMatch {
  product: {
    sku: string;
    slug: string;
    title: string;
    image: string | null;
    productType: string;
    category: string;
  };
  source: CrossRefSource;
  matchedCode: string;
  /** Confiança 0..1 (1 = match exato; <1 = similaridade). */
  confidence: number;
}

export interface CrossRefResponse {
  query: string;
  matches: CrossRefMatch[];
  total: number;
  /** Verdadeiro quando o catálogo ainda não tem códigos OEM populados. */
  pendingOemData?: boolean;
}

// ─── Autocomplete ───

export type AutocompleteKind = 'sku' | 'product' | 'brand' | 'category';

export interface AutocompleteSuggestion {
  kind: AutocompleteKind;
  label: string;
  /** Caminho para navegar ao clicar. */
  href: string;
  /** Subtítulo opcional (ex: tipo do filtro). */
  caption?: string;
  /** SKU exato quando aplicável. */
  sku?: string;
}

export interface AutocompleteResponse {
  query: string;
  suggestions: AutocompleteSuggestion[];
  total: number;
}

// ─── Stats (para a home) ───

export interface CatalogStats {
  totalProducts: number;
  activeProducts: number;
  totalApplications: number;
  totalBrands: number;
  patentedProducts: number;
  categoryCount: number;
  productsWithImage: number;
  /** Total de referências cruzadas importadas (planilha Gabriel). */
  totalCrossReferences: number;
  /** Quantidade de marcas distintas nas referências cruzadas. */
  equivalenceBrandCount: number;
  /** Marcas de equivalência mais frequentes (para a home). */
  topEquivalenceBrands: { name: string; count: number }[];
}
