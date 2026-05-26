/* ══════════════════════════════════════════
   Script: seed-admin
   ══════════════════════════════════════════
   Cria ou atualiza o usuário admin do painel.

   USO:
   1. Adicionar no .env.local:
      ADMIN_EMAIL=orlando@originalfilter.com
      ADMIN_PASSWORD=SuaSenhaSegura123
      ADMIN_NAME=Orlando Pedrazzoli   (opcional)

   2. Rodar:
      npx tsx scripts/seed-admin.ts

   Se o email já existir, ATUALIZA a senha + garante role=admin + isActive=true.
   Se não existir, CRIA novo admin.

   Após criar, REMOVA ADMIN_PASSWORD do .env.local por segurança.
   ══════════════════════════════════════════ */

import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User';

// Carregar .env.local explicitamente (Next.js carrega automaticamente,
// mas scripts standalone via tsx não)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Administrador';
  const phone = process.env.ADMIN_PHONE || '+5511000000000';

  if (!email || !password) {
    console.error('❌ ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios no .env.local');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ ADMIN_PASSWORD deve ter pelo menos 8 caracteres');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI não configurado no .env.local');
    process.exit(1);
  }

  console.log('🔗 Conectando ao MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Conectado.');

  // IMPORTANTE: não fazer hash aqui. O User model tem um pre('save')
  // que hasheia automaticamente. Hashear aqui causaria hash duplo
  // (bcrypt(bcrypt(senha))) e a comparação nunca bateria.

  const existing = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (existing) {
    existing.password = password; // texto plano — pre('save') vai hashear
    existing.role = 'admin';
    existing.isActive = true;
    if (!existing.name && name) existing.name = name;
    await existing.save();
    console.log(`✅ Admin atualizado: ${email}`);
    console.log('   role: admin');
    console.log('   isActive: true');
    console.log('   senha: atualizada');
  } else {
    await User.create({
      email: email.toLowerCase(),
      password, // texto plano — pre('save') vai hashear
      name,
      phone,
      role: 'admin',
      isActive: true,
      discountTier: 0,
    });
    console.log(`✅ Admin criado: ${email}`);
    console.log(`   name: ${name}`);
    console.log(`   phone: ${phone}`);
    console.log('   role: admin');
  }

  console.log('');
  console.log('🔐 Login em: /admin/login');
  console.log(`   Email: ${email}`);
  console.log('   Senha: (a que você configurou)');
  console.log('');
  console.log('⚠️  REMOVA ADMIN_PASSWORD do .env.local agora por segurança.');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
