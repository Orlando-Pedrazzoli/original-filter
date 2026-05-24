/* ══════════════════════════════════════════
   Original Filter — NextAuth v5 Config
   ══════════════════════════════════════════
   Mudanças vs versão anterior:
   - Tipos próprios (UserRole, DiscountTier) via types/next-auth.d.ts
   - signIn page para cliente final (/conta/login), middleware redireciona admin
   - Callbacks incluem discountTier no token e session
   - trustHost: true (necessário em Vercel + custom domain)
   - lastLogin assíncrono (fire-and-forget, não atrasa o login)
   - Senha vazia (guest) é rejeitada explicitamente
   ══════════════════════════════════════════ */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import type { UserRole, DiscountTier } from '@/types';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 dias
  },
  pages: {
    signIn: '/conta/login',
    error: '/conta/login',
  },
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.discountTier = user.discountTier;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.discountTier = token.discountTier;
      }
      return session;
    },
  },
});
