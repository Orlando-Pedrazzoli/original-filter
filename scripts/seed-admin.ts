/**
 * Seed script — Create the first admin user
 *
 * Usage: npx tsx scripts/seed-admin.ts
 *
 * Environment variables (set in .env.local):
 *   MONGODB_URI        — MongoDB connection string (required)
 *   ADMIN_EMAIL        — Admin email (optional, default: admin@originalfilter.com)
 *   ADMIN_PASSWORD     — Admin password (optional, default: OriginalFilter@2026)
 *   ADMIN_NAME         — Admin name (optional, default: Admin Original Filter)
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Load .env.local manually (no dotenv needed) ──
function loadEnvLocal() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local not found
  }
}

loadEnvLocal();

// ── User Schema (inline to avoid path alias issues in scripts) ──
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);

// Mongoose 9: async pre-save without next()
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ── Main ──
async function seedAdmin() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('');
    console.error('❌ MONGODB_URI não encontrada!');
    console.error('   Verifica o teu .env.local');
    console.error('');
    process.exit(1);
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@originalfilter.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'OriginalFilter@2026';
  const adminName = process.env.ADMIN_NAME || 'Admin Original Filter';

  try {
    console.log('');
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Conectado!');

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('');
      console.log(`⚠️  Admin já existe: ${existing.email}`);
      console.log('   Nenhuma alteração feita.');
      console.log('');
      await mongoose.disconnect();
      process.exit(0);
    }

    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isActive: true,
    });

    console.log('');
    console.log('✅ Admin criado com sucesso!');
    console.log('┌──────────────────────────────────────');
    console.log(`│  Nome:  ${admin.name}`);
    console.log(`│  Email: ${admin.email}`);
    console.log(`│  Senha: ${adminPassword}`);
    console.log(`│  Role:  admin`);
    console.log('└──────────────────────────────────────');
    console.log('');
    console.log('⚠️  IMPORTANTE: Mude a senha após o primeiro login!');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Erro ao criar admin:', error);
    console.error('');
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
