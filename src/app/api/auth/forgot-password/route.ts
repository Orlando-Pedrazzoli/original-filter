/* ══════════════════════════════════════════
   POST /api/auth/forgot-password
   ──────────────────────────────────────────
   Inicia processo de recuperação de senha.

   Como funciona:
   1. Cliente informa email
   2. Geramos um token aleatório de 32 bytes (256 bits de entropia)
   3. Salvamos o HASH SHA-256 do token no banco (não o token cru)
   4. Expira em 1 hora
   5. Enviamos email com o token NA URL

   SEGURANÇA:
   - Resposta SEMPRE 200 (mesmo se email não existir) → previne enumeração de emails
   - Token cru nunca toca o banco — só o hash
   - Validade curta (1h)
   - Cada nova solicitação invalida tokens antigos

   TODO (futuro): integrar Resend para envio real do email.
   Por enquanto, o link aparece no console.log do servidor.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').max(200),
});

const TOKEN_VALIDITY_MS = 60 * 60 * 1000; // 1 hora

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    await dbConnect();

    const user = await User.findOne({ email });

    // ─── SEGURANÇA ───
    // Sempre retornamos 200, mesmo se o user não existir.
    // Isso impede que alguém descubra quais emails estão cadastrados.
    if (!user || !user.isActive) {
      console.log(`[auth/forgot-password] silent ignore for ${email} (not found or inactive)`);
      return NextResponse.json({
        success: true,
        message: 'Se este email estiver cadastrado, você receberá instruções em instantes.',
      });
    }

    // Gera token cru (vai no email) e hash (vai no banco)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + TOKEN_VALIDITY_MS);
    await user.save();

    // Monta a URL completa
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/conta/resetar?token=${rawToken}&email=${encodeURIComponent(email)}`;

    // TODO: integrar Resend
    // Por enquanto, log no console pra você poder testar
    console.log('═════════════════════════════════════════════════');
    console.log('[auth/forgot-password] RESET LINK GENERATED');
    console.log(`   Email: ${email}`);
    console.log(`   URL:   ${resetUrl}`);
    console.log(`   Valid: até ${user.passwordResetExpires?.toISOString()}`);
    console.log('═════════════════════════════════════════════════');

    return NextResponse.json({
      success: true,
      message: 'Se este email estiver cadastrado, você receberá instruções em instantes.',
      // Em produção remover isso. Por enquanto retorna o link para facilitar dev/teste:
      ...(process.env.NODE_ENV === 'development' && {
        devOnly: { resetUrl },
      }),
    });
  } catch (err) {
    console.error('[auth/forgot-password] error:', err);
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
