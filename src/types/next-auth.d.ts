/* ══════════════════════════════════════════
   Original Filter — NextAuth Type Augmentation
   ══════════════════════════════════════════
   Estende os tipos do NextAuth v5 para incluir role e discountTier
   na sessão. Sem este arquivo, o TypeScript não reconhece
   session.user.role e força casts feios.
   ══════════════════════════════════════════ */

import type { DefaultSession } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';

export type UserRole = 'admin' | 'retail' | 'reseller';
export type DiscountTier = 0 | 5 | 10 | 15 | 20;

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      discountTier: DiscountTier;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    role: UserRole;
    discountTier: DiscountTier;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    discountTier: DiscountTier;
  }
}
