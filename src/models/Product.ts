// src/models/Product.ts
/* ══════════════════════════════════════════
   Original Filter — Model Product
   ══════════════════════════════════════════
   Refundação completa.
   
   Diferenças críticas vs versão anterior:
   - productType raiz: filter | sensor | accessory
   - retailPrice (não 'price') — clareza de intenção
   - weight + dimensions (para Melhor Envio)
   - applications estruturadas: brand/model/engine/anos
   - replacedBy + supersedes (Planilha2 do Excel)
   - oemCodes (códigos originais Volvo/Scania/MB...)
   - isPatented (Planilha Patenteado)
   - status enum (active|inactive|discontinued) → suporta os 46 inativos da Planilha5
   - images[] (múltiplas) com isPrimary
   - seo embedded
   - stock + lowStockThreshold
   ══════════════════════════════════════════ */

import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type {
  ProductType,
  ProductStatus,
  ProductApplication,
  ProductCrossReference,
  ProductImage,
  ProductDimensions,
  ProductSEO,
} from '@/types';

export interface IProduct extends Document {
  // Identificação
  sku: string;
  slug: string;
  productType: ProductType;
  category: string;
  brand?: mongoose.Types.ObjectId;

  // Conteúdo
  title: string;
  description: string;
  shortDescription?: string;

  // Preço (single source of truth)
  retailPrice: number;

  // Logística
  weight: number; // kg
  dimensions: ProductDimensions; // cm

  // Aplicações estruturadas
  applications: ProductApplication[];

  // Equivalências
  oemCodes: string[];
  crossReferences: ProductCrossReference[];
  replacedBy?: mongoose.Types.ObjectId;
  supersedes: mongoose.Types.ObjectId[];

  // Status
  status: ProductStatus;
  isPatented: boolean;
  isNewRelease: boolean;
  isFeatured: boolean;

  // Mídia
  images: ProductImage[];

  // Estoque (informativo — Original Filter pode operar contra estoque externo)
  stock: number;
  lowStockThreshold: number;
  manageStock: boolean;

  // SEO
  seo: ProductSEO;

  // Métricas
  viewCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<ProductApplication>(
  {
    brand: { type: String, required: true, trim: true, uppercase: true },
    model: { type: String, required: true, trim: true },
    engine: { type: String, trim: true },
    yearStart: { type: Number, min: 1950, max: 2100 },
    yearEnd: { type: Number, min: 1950, max: 2100 },
  },
  { _id: false },
);

const CrossReferenceSchema = new Schema<ProductCrossReference>(
  {
    // Marca do fabricante da referência (ex: MANN FILTER, FLEETGUARD, VOLVO)
    // 'NÚMERO ORIGINAL' = código OEM sem marca atribuída (era 'Part Number' na planilha)
    brand: { type: String, required: true, trim: true, uppercase: true },
    // Código como exibido ao usuário (preserva formato original: W 1170, PU10022Z...)
    code: { type: String, required: true, trim: true },
    // Código normalizado para busca: uppercase, sem espaços/hífens/pontos/barras
    codeNormalized: { type: String, required: true, trim: true, uppercase: true },
  },
  { _id: false },
);

const ImageSchema = new Schema<ProductImage>(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, required: true, trim: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false },
);

const DimensionsSchema = new Schema<ProductDimensions>(
  {
    height: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    depth: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const SEOSchema = new Schema<ProductSEO>(
  {
    title: { type: String, trim: true, maxlength: 70 },
    description: { type: String, trim: true, maxlength: 160 },
    keywords: { type: [String], default: [] },
  },
  { _id: false },
);

const ProductSchema = new Schema<IProduct>(
  {
    sku: {
      type: String,
      required: [true, 'SKU é obrigatório'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    productType: {
      type: String,
      enum: ['filter', 'sensor', 'accessory'],
      required: true,
      default: 'filter',
    },
    category: { type: String, required: true, trim: true },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand' },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true },
    shortDescription: { type: String, trim: true, maxlength: 300 },

    retailPrice: {
      type: Number,
      required: true,
      min: [0, 'Preço não pode ser negativo'],
      default: 0,
    },

    weight: {
      type: Number,
      required: true,
      min: [0, 'Peso não pode ser negativo'],
      default: 0,
    },
    dimensions: { type: DimensionsSchema, required: true },

    applications: { type: [ApplicationSchema], default: [] },

    oemCodes: { type: [String], default: [] },
    crossReferences: { type: [CrossReferenceSchema], default: [] },
    replacedBy: { type: Schema.Types.ObjectId, ref: 'Product' },
    supersedes: { type: [Schema.Types.ObjectId], ref: 'Product', default: [] },

    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued'],
      default: 'active',
      required: true,
    },
    isPatented: { type: Boolean, default: false },
    isNewRelease: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    images: { type: [ImageSchema], default: [] },

    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    manageStock: { type: Boolean, default: false },

    seo: { type: SEOSchema, default: () => ({}) },

    viewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// ─── Hooks: imagem primária + validação anos ───
ProductSchema.pre('save', function () {
  // Garantir uma única imagem isPrimary
  if (this.images && this.images.length > 0) {
    const primaries = this.images.filter((img) => img.isPrimary);
    if (primaries.length === 0) {
      this.images[0].isPrimary = true;
    } else if (primaries.length > 1) {
      let foundFirst = false;
      this.images.forEach((img) => {
        if (img.isPrimary && !foundFirst) {
          foundFirst = true;
        } else if (img.isPrimary) {
          img.isPrimary = false;
        }
      });
    }
  }

  // Validar yearEnd >= yearStart em applications
  for (const app of this.applications) {
    if (app.yearStart && app.yearEnd && app.yearEnd < app.yearStart) {
      throw new Error(
        `Aplicação ${app.brand} ${app.model}: yearEnd (${app.yearEnd}) menor que yearStart (${app.yearStart})`,
      );
    }
  }
});

// ─── Índices ───
ProductSchema.index({ productType: 1, status: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ brand: 1, status: 1 });
ProductSchema.index({ status: 1, isFeatured: 1 });
ProductSchema.index({ status: 1, isNewRelease: 1 });
ProductSchema.index({ oemCodes: 1 });
ProductSchema.index({ 'crossReferences.codeNormalized': 1 });
ProductSchema.index({ 'crossReferences.brand': 1 });
ProductSchema.index({ 'applications.brand': 1, 'applications.model': 1 });

// ─── Text index para busca textual ───
ProductSchema.index(
  {
    sku: 'text',
    title: 'text',
    description: 'text',
    oemCodes: 'text',
  },
  {
    weights: { sku: 10, oemCodes: 8, title: 5, description: 1 },
    name: 'product_text_search',
  },
);

const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
