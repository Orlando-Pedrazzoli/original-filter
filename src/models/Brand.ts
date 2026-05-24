/* ══════════════════════════════════════════
   Original Filter — Model Brand
   ══════════════════════════════════════════
   Ampliado vs versão minimalista:
   - category: separação rodoviário/agrícola/máquinas/automotivo
   - country: origem (Suécia, Brasil, EUA, etc) — para UI/SEO
   - displayOrder: ordenação no carrossel
   - description: texto opcional
   ══════════════════════════════════════════ */

import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type BrandCategory =
  | 'rodoviario'
  | 'agricola'
  | 'maquinas-pesadas'
  | 'automotivo'
  | 'industrial';

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo: string;
  description?: string;
  country?: string;
  category: BrandCategory;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    logo: { type: String, default: '' },
    description: { type: String, trim: true, maxlength: 1000 },
    country: { type: String, trim: true },
    category: {
      type: String,
      enum: ['rodoviario', 'agricola', 'maquinas-pesadas', 'automotivo', 'industrial'],
      required: true,
      default: 'rodoviario',
    },
    displayOrder: { type: Number, default: 999, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

BrandSchema.index({ slug: 1 }, { unique: true });
BrandSchema.index({ category: 1, displayOrder: 1, isActive: 1 });

const Brand: Model<IBrand> =
  (mongoose.models.Brand as Model<IBrand>) || mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;
