/* ══════════════════════════════════════════
   POST /api/auth/register
   ──────────────────────────────────────────
   Cadastro público de novos clientes (retail).

   Não permite criar admin nem reseller por aqui.
   Revendedores devem usar o formulário /seja-revendedor.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

const RegisterSchema = z.object({
  name: z.string().min(3, 'Nome muito curto').max(120),
  email: z.string().email('Email inválido').max(200),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').max(100),
  acceptedTerms: z.boolean().refine((v) => v === true, {
    message: 'Você precisa aceitar os termos',
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

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

    const { name, email, phone, password } = parsed.data;
    const emailLower = email.toLowerCase().trim();

    await dbConnect();

    // Confere se já existe
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      // Importante: NÃO revelar se a conta tem senha ou não (segurança)
      return NextResponse.json(
        {
          error: 'Já existe uma conta com este email. Tente entrar ou use "Esqueci minha senha".',
          conflictField: 'email',
        },
        { status: 409 },
      );
    }

    // Cria user (o pre-save hook do model faz o hash da senha)
    const user = await User.create({
      email: emailLower,
      name: name.trim(),
      phone: phone.trim(),
      password,
      role: 'retail',
      discountTier: 0,
      isActive: true,
    });

    console.log(`[auth/register] new user: ${emailLower} (id: ${user._id})`);

    return NextResponse.json(
      {
        success: true,
        user: {
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[auth/register] error:', err);
    return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 500 });
  }
}
