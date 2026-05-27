/* ══════════════════════════════════════════
   Original Filter — Auth Config (Edge-safe)
   ══════════════════════════════════════════
   Esta é a configuração mínima do NextAuth que roda no Edge Runtime
   (middleware). NÃO importa Mongoose, dbConnect, ou qualquer coisa
   que dependa de Node.js APIs.

   O auth.ts completo (com Credentials provider que usa MongoDB)
   roda apenas em Node.js — usado pelas API routes via `auth()`.

   Referência: https://authjs.dev/guides/edge-compatibility
   ══════════════════════════════════════════ */

import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 dias
  },
  pages: {
    signIn: '/conta/login',
    error: '/conta/login',
  },
  // ⚠️ Providers ficam vazios aqui porque o Credentials provider usa
  // Mongoose (não edge-compatible). Eles são adicionados no auth.ts.
  providers: [],
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
};
