/* ══════════════════════════════════════════
   Original Filter — NextAuth v5 (Full)
   ══════════════════════════════════════════
   Importa o authConfig (edge-safe) e adiciona o Credentials provider
   que usa Mongoose. Este arquivo NUNCA é importado pelo middleware —
   só pelas API routes.

   Para o middleware Edge-safe, use auth.config.ts diretamente.
   ══════════════════════════════════════════ */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import type { UserRole, DiscountTier } from '@/types';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          throw new Error('E-mail e senha são obrigatórios.');
        }

        await dbConnect();

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
          throw new Error('E-mail ou senha incorretos.');
        }

        if (!user.isActive) {
          throw new Error('Conta desativada. Entre em contato com o suporte.');
        }

        // Guest checkout cria user SEM senha — não pode logar com credentials
        if (!user.password) {
          throw new Error('Esta conta ainda não tem senha. Verifique seu e-mail para definir uma.');
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
          throw new Error('E-mail ou senha incorretos.');
        }

        // Fire-and-forget: não bloqueia o login
        User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch((err) =>
          console.error('Falha ao atualizar lastLogin:', err),
        );

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || null,
          role: user.role as UserRole,
          discountTier: user.discountTier as DiscountTier,
        };
      },
    }),
  ],
});
