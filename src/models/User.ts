/* ══════════════════════════════════════════
   Original Filter — Model User
   ══════════════════════════════════════════
   3 roles: admin | retail | reseller
   - retail: cliente final (PF, CPF) — pode comprar sem conta prévia
   - reseller: distribuidor (PJ, CNPJ) — aprovado via ResellerApplication
   - admin: gestão interna
   
   password é OPCIONAL para suportar guest checkout
   (cliente cria pedido → recebe email com link mágico para criar senha)
   ══════════════════════════════════════════ */

import mongoose, { Schema, type Document, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole, DiscountTier, Address, CompanyData } from '@/types';

export interface IUser extends Document {
  email: string;
  emailVerified: Date | null;
  password: string | null;

  role: UserRole;
  discountTier: DiscountTier;

  name: string;
  cpf?: string;
  company?: CompanyData;

  phone: string;
  whatsapp?: string;

  addresses: Address[];

  image?: string;
  isActive: boolean;
  lastLogin?: Date;

  approvedFromApplication?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema<Address>(
  {
    label: {
      type: String,
      enum: ['principal', 'cobranca', 'entrega'],
      required: true,
      default: 'principal',
    },
    cep: { type: String, required: true, trim: true },
    logradouro: { type: String, required: true, trim: true },
    numero: { type: String, required: true, trim: true },
    complemento: { type: String, trim: true },
    bairro: { type: String, required: true, trim: true },
    cidade: { type: String, required: true, trim: true },
    uf: { type: String, required: true, trim: true, uppercase: true, maxlength: 2 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const CompanySchema = new Schema<CompanyData>(
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
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'E-mail é obrigatório'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido'],
    },
    emailVerified: { type: Date, default: null },
    password: {
      type: String,
      // NÃO required: guest checkout cria user sem senha
      minlength: [8, 'Senha deve ter pelo menos 8 caracteres'],
      select: false,
      default: null,
    },

    role: {
      type: String,
      enum: ['admin', 'retail', 'reseller'],
      default: 'retail',
      required: true,
    },
    discountTier: {
      type: Number,
      enum: [0, 5, 10, 15, 20],
      default: 0,
    },

    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    cpf: {
      type: String,
      trim: true,
      sparse: true,
      match: [/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'],
    },
    company: { type: CompanySchema, default: undefined },

    phone: {
      type: String,
      required: [true, 'Telefone é obrigatório'],
      trim: true,
    },
    whatsapp: { type: String, trim: true },

    addresses: { type: [AddressSchema], default: [] },

    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    approvedFromApplication: {
      type: Schema.Types.ObjectId,
      ref: 'ResellerApplication',
    },
  },
  { timestamps: true },
);

// ─── Hash de senha + validações de negócio ───
UserSchema.pre('save', async function () {
  // Validação: reseller precisa de company (CNPJ)
  if (this.role === 'reseller' && !this.company) {
    throw new Error('Reseller precisa de dados de empresa (CNPJ)');
  }

  // Validação: discountTier > 0 só faz sentido para reseller
  if (this.discountTier > 0 && this.role !== 'reseller') {
    throw new Error('discountTier > 0 só é permitido para role reseller');
  }

  // Hash de senha (apenas se houver password e foi modificada)
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// ─── Compare password (retorna false se não houver senha) ───
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Índices ───
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ 'company.cnpj': 1 }, { sparse: true });
UserSchema.index({ cpf: 1 }, { sparse: true });

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export default User;
