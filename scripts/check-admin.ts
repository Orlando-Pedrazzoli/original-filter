/* ══════════════════════════════════════════
   Script: check-admin
   ══════════════════════════════════════════
   Diagnóstico do usuário admin.
   - Verifica se o usuário existe no banco
   - Mostra role, isActive, se tem password
   - Testa a senha do .env.local contra o hash gravado

   USO:
      npx tsx scripts/check-admin.ts
   ══════════════════════════════════════════ */

import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email) {
    console.error('❌ ADMIN_EMAIL não configurado no .env.local');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI não configurado');
    process.exit(1);
  }

  console.log('🔗 Conectando ao MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Conectado.\n');

  console.log(`🔍 Procurando usuário: ${email}\n`);

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    console.log('❌ Usuário NÃO encontrado no banco.');
    console.log('   → Rode: npx tsx scripts/seed-admin.ts');
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log('✅ Usuário encontrado.');
  console.log(`   _id:          ${user._id}`);
  console.log(`   email:        ${user.email}`);
  console.log(`   name:         ${user.name}`);
  console.log(`   role:         ${user.role}`);
  console.log(`   isActive:     ${user.isActive}`);
  console.log(`   has password: ${!!user.password}`);
  if (user.password) {
    console.log(`   pwd hash:     ${user.password.substring(0, 20)}...`);
  }
  console.log('');

  // Diagnóstico
  const problems: string[] = [];
  if (user.role !== 'admin') {
    problems.push(`role é "${user.role}", deveria ser "admin"`);
  }
  if (!user.isActive) {
    problems.push('isActive é false (conta desativada)');
  }
  if (!user.password) {
    problems.push('usuário não tem senha definida');
  }

  if (problems.length > 0) {
    console.log('⚠️  PROBLEMAS DETECTADOS:');
    for (const p of problems) console.log(`   - ${p}`);
    console.log('\n   → Rode: npx tsx scripts/seed-admin.ts para corrigir.');
    await mongoose.disconnect();
    process.exit(1);
  }

  // Testar senha
  if (password && user.password) {
    console.log(`🔐 Testando senha do .env.local...`);
    const directMatch = await bcrypt.compare(password, user.password);
    console.log(`   bcrypt.compare:        ${directMatch ? '✅ BATE' : '❌ NÃO BATE'}`);

    // Também testar via método do model
    if (typeof user.comparePassword === 'function') {
      const methodMatch = await user.comparePassword(password);
      console.log(`   user.comparePassword:  ${methodMatch ? '✅ BATE' : '❌ NÃO BATE'}`);
    }
    console.log('');

    if (directMatch) {
      console.log('🎉 Tudo certo! Senha do .env.local bate com o banco.');
      console.log(`   Acessar: /admin/login`);
      console.log(`   Email:   ${email}`);
      console.log(`   Senha:   ${password}`);
    } else {
      console.log('❌ A senha do .env.local NÃO bate com o hash no banco.');
      console.log('   Possíveis causas:');
      console.log('   1. ADMIN_PASSWORD foi alterado depois do seed');
      console.log('   2. O usuário foi criado com outra senha (manual no Mongo?)');
      console.log('');
      console.log('   → Rode novamente: npx tsx scripts/seed-admin.ts');
      console.log('     (vai regravar a senha com o valor atual do .env.local)');
    }
  } else if (!password) {
    console.log('ℹ️  ADMIN_PASSWORD não está no .env.local — não é possível testar.');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
