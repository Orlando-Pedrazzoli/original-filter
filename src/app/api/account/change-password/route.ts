/* ══════════════════════════════════════════
   POST /api/account/change-password
   ══════════════════════════════════════════
   Troca de senha para usuário JÁ autenticado.
   Diferente de /api/auth/reset-password que usa token de email.

   Requer: { currentPassword, newPassword }
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual obrigatória'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres').max(100),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ChangePasswordSchema.safeParse(body);

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

    await dbConnect();

    // Precisa do +password porque o campo tem select: false no schema
    const user = await User.findById(session.user.id).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json(
        {
          error:
            'Esta conta não tem senha definida. Use "Esqueci minha senha" no login para criar uma.',
        },
        { status: 400 },
      );
    }

    // Valida senha atual
    const isValid = await user.comparePassword(parsed.data.currentPassword);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Senha atual incorreta', conflictField: 'currentPassword' },
        { status: 400 },
      );
    }

    // Nova senha não pode ser igual à atual
    const sameAsOld = await user.comparePassword(parsed.data.newPassword);
    if (sameAsOld) {
      return NextResponse.json(
        {
          error: 'A nova senha deve ser diferente da atual',
          conflictField: 'newPassword',
        },
        { status: 400 },
      );
    }

    // Atribui — pre-save hook hashea
    user.password = parsed.data.newPassword;
    await user.save();

    console.log(`[account/change-password] ${user.email} changed password`);

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso',
    });
  } catch (err) {
    console.error('[account/change-password] error:', err);
    return NextResponse.json({ error: 'Erro ao alterar senha' }, { status: 500 });
  }
}
