/* ══════════════════════════════════════════
   Original Filter — Middleware
   ══════════════════════════════════════════
   Proteção de rotas baseada em role:
   - /admin/*         → requer role 'admin'    (redireciona para /admin/login)
   - /conta/*         → requer logado          (redireciona para /conta/login)
   - /admin/login     → público
   - /conta/login     → público
   - /conta/registrar → público
   
   NOTA: o middleware usa NextAuth v5 `auth()` que decodifica o JWT
   sem ir ao banco — é rápido e adequado para Edge Runtime.
   ══════════════════════════════════════════ */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const pathname = nextUrl.pathname;

  // ─── Rotas públicas dentro de áreas protegidas ───
  const isAdminLogin = pathname === '/admin/login';
  const isAccountLogin = pathname === '/conta/login' || pathname === '/conta/registrar';

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
    if (isAccountLogin) {
      // Se já está logado, redireciona conforme role
      if (isLoggedIn) {
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
