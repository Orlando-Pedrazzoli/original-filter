/* ══════════════════════════════════════════
   POST /api/auth/reset-password
   ──────────────────────────────────────────
   Conclui o reset de senha.

   Recebe: { email, token, newPassword }

   Valida:
   - Token bate com hash no banco
   - Não expirou
   - User está ativo

   Ao sucesso:
   - Atualiza password (pre-save hook hashea)
   - Invalida token (zera campos)
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

const ResetPasswordSchema = z.object({
  email: z.string().email().max(200),
  token: z.string().min(32).max(100),
  newPassword: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }

    const { email, token, newPassword } = parsed.data;
    const emailLower = email.toLowerCase().trim();

    // Hash do token para comparar com banco
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    await dbConnect();

    // Busca o user com o token + valida expiração
    const user = await User.findOne({
      email: emailLower,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return NextResponse.json(
        {
          error: 'Link inválido ou expirado. Solicite um novo link de recuperação.',
        },
        { status: 400 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Conta desativada. Entre em contato com o suporte.' },
        { status: 403 },
      );
    }

    // Atualiza senha (pre-save hook hashea)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    console.log(`[auth/reset-password] password reset for ${emailLower}`);

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso. Faça login com sua nova senha.',
    });
  } catch (err) {
    console.error('[auth/reset-password] error:', err);
    return NextResponse.json(
      { error: 'Erro ao redefinir senha. Tente novamente.' },
      { status: 500 },
    );
  }
}
