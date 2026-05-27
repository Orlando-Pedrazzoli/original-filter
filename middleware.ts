/* ══════════════════════════════════════════
   Original Filter — Middleware
   ══════════════════════════════════════════
   Proteção de rotas baseada em role:
   - /admin/*         → requer role 'admin'    (redireciona para /admin/login)
   - /conta/*         → requer logado          (redireciona para /conta/login)
   - /admin/login     → público
   - /conta/login     → público
   - /conta/cadastro  → público
   - /conta/recuperar → público
   - /conta/resetar   → público

   IMPORTANTE: Usa authConfig (edge-safe) — NÃO o auth.ts completo.
   O middleware roda no Edge Runtime da Vercel, que não suporta
   Mongoose nem outras Node.js APIs. authConfig só contém callbacks
   e tipos, sem providers que dependem do banco.
   ══════════════════════════════════════════ */

import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const pathname = nextUrl.pathname;

  // ─── Rotas públicas dentro de áreas protegidas ───
  const isAdminLogin = pathname === '/admin/login';
  const isAccountPublic =
    pathname === '/conta/login' ||
    pathname === '/conta/cadastro' ||
    pathname === '/conta/recuperar' ||
    pathname === '/conta/resetar';

  // ─── /admin/* ───
  if (pathname.startsWith('/admin')) {
    if (isAdminLogin) {
      // Se já está logado como admin, redireciona para painel
      if (isLoggedIn && userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', nextUrl));
      }
      return NextResponse.next();
    }

    // Restante de /admin/*: só admin
    if (!isLoggedIn) {
      const loginUrl = new URL('/admin/login', nextUrl);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== 'admin') {
      // Logado mas não é admin → joga para área pública
      return NextResponse.redirect(new URL('/', nextUrl));
    }

    return NextResponse.next();
  }

  // ─── /conta/* ───
  if (pathname.startsWith('/conta')) {
    if (isAccountPublic) {
      // Se já está logado e está numa página de entrada (login/cadastro/recuperar),
      // redireciona pro destino. Exceção: /conta/resetar — pode ser que o user
      // tenha sessão antiga e queira definir nova senha via link do email.
      const isEntryPage =
        pathname === '/conta/login' ||
        pathname === '/conta/cadastro' ||
        pathname === '/conta/recuperar';
      if (isLoggedIn && isEntryPage) {
        const dest = userRole === 'admin' ? '/admin' : '/conta';
        return NextResponse.redirect(new URL(dest, nextUrl));
      }
      return NextResponse.next();
    }

    // Restante de /conta/*: requer logado (qualquer role)
    if (!isLoggedIn) {
      const loginUrl = new URL('/conta/login', nextUrl);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  // Matcher: tudo exceto _next, api/auth (NextAuth) e estáticos
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|webp|svg|ico|webmanifest)$).*)',
  ],
};
