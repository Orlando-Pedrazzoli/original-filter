/* ══════════════════════════════════════════
   Original Filter — Model ResellerApplication
   ══════════════════════════════════════════
   Formulário público "Seja um Revendedor"
   Admin recebe → aprova/recusa → se aprovar gera User com role:'reseller'
   ══════════════════════════════════════════ */

import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { ApplicationStatus, DiscountTier } from '@/types';

export interface IResellerApplication extends Document {
  // Empresa
  razaoSocial: string;
  cnpj: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;

  // Contato
  contactName: string;
  email: string;
  phone: string;
  whatsapp?: string;

  // Endereço (mínimo cidade/UF)
  cidade: string;
  uf: string;

  // Negócio
  segment: 'oficina' | 'distribuidora' | 'atacado' | 'loja' | 'frota' | 'concessionaria' | 'outro';
  estimatedMonthlyVolume?: string;
  currentSuppliers?: string;
  message?: string;

  // Workflow
  status: ApplicationStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;

  // Se aprovado
  approvedDiscountTier?: DiscountTier;
  createdUserId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ResellerApplicationSchema = new Schema<IResellerApplication>(
  {
    razaoSocial: { type: String, required: true, trim: true },
    cnpj: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido'],
    },
    nomeFantasia: { type: String, trim: true },
    inscricaoEstadual: { type: String, trim: true },

    contactName: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido'],
    },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },

    cidade: { type: String, required: true, trim: true },
    uf: { type: String, required: true, trim: true, uppercase: true, maxlength: 2 },

    segment: {
      type: String,
      enum: ['oficina', 'distribuidora', 'atacado', 'loja', 'frota', 'concessionaria', 'outro'],
      required: true,
    },
    estimatedMonthlyVolume: { type: String, trim: true },
    currentSuppliers: { type: String, trim: true },
    message: { type: String, trim: true, maxlength: 2000 },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true, maxlength: 500 },

    approvedDiscountTier: {
      type: Number,
      enum: [0, 5, 10, 15, 20],
    },
    createdUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

ResellerApplicationSchema.index({ status: 1, createdAt: -1 });
ResellerApplicationSchema.index({ cnpj: 1 });
ResellerApplicationSchema.index({ email: 1 });

const ResellerApplication: Model<IResellerApplication> =
  (mongoose.models.ResellerApplication as Model<IResellerApplication>) ||
  mongoose.model<IResellerApplication>('ResellerApplication', ResellerApplicationSchema);

export default ResellerApplication;
