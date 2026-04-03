import mongoose, { Schema, type Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  repliedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'E-mail é obrigatório'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Assunto é obrigatório'],
      enum: {
        values: ['duvidas', 'orcamento', 'elogios', 'sugestoes', 'reclamacoes'],
        message: 'Assunto inválido',
      },
    },
    message: {
      type: String,
      required: [true, 'Mensagem é obrigatória'],
      trim: true,
      minlength: [10, 'Mensagem deve ter pelo menos 10 caracteres'],
      maxlength: [5000, 'Mensagem deve ter no máximo 5000 caracteres'],
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
    },
    repliedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notas devem ter no máximo 1000 caracteres'],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for admin panel queries
ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ email: 1 });

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
