/* ══════════════════════════════════════════
   /api/account/profile
   ══════════════════════════════════════════
   GET   → retorna perfil completo do user logado
   PATCH → atualiza dados pessoais (nome, email, telefone, etc)

   NOTA: troca de email é permitida sem validação por email.
   Atenção: pode causar inconsistência se o user usar o email antigo.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function requireLogin() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
    };
  }
  return { session };
}

// ══════════════════════════════════════════
// GET — Perfil completo
// ══════════════════════════════════════════
export async function GET() {
  const guard = await requireLogin();
  if ('error' in guard) return guard.error;

  try {
    await dbConnect();

    const user = (await User.findById(guard.session.user.id)
      .select('name email phone whatsapp cpf company role discountTier image isActive createdAt')
      .lean()) as unknown as {
      name?: string;
      email?: string;
      phone?: string;
      whatsapp?: string;
      cpf?: string;
      company?: {
        razaoSocial?: string;
        cnpj?: string;
        nomeFantasia?: string;
        inscricaoEstadual?: string;
      };
      role?: string;
      discountTier?: number;
      image?: string;
      isActive?: boolean;
      createdAt?: Date;
    } | null;

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        whatsapp: user.whatsapp ?? '',
        cpf: user.cpf ?? '',
        company: user.company ?? null,
        role: user.role ?? 'retail',
        discountTier: user.discountTier ?? 0,
        image: user.image ?? '',
        isActive: user.isActive ?? true,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[account/profile GET] error:', err);
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 });
  }
}

// ══════════════════════════════════════════
// PATCH — Atualizar perfil
// ══════════════════════════════════════════
const UpdateProfileSchema = z
  .object({
    name: z.string().min(3, 'Nome muito curto').max(120).optional(),
    email: z.string().email('Email inválido').max(200).optional(),
    phone: z.string().min(10, 'Telefone inválido').max(20).optional(),
    whatsapp: z.string().max(20).optional(),
    cpf: z.string().max(20).optional().or(z.literal('')),
    company: z
      .object({
        razaoSocial: z.string().max(200),
        cnpj: z.string().regex(/^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido'),
        nomeFantasia: z.string().max(200).optional(),
        inscricaoEstadual: z.string().max(50).optional(),
      })
      .optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });

export async function PATCH(req: NextRequest) {
  const guard = await requireLogin();
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json();
    const parsed = UpdateProfileSchema.safeParse(body);

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

    const user = await User.findById(guard.session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const data = parsed.data;

    // Troca de email: validar unicidade
    if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
      const conflict = await User.findOne({
        email: data.email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (conflict) {
        return NextResponse.json(
          { error: 'Email já está em uso', conflictField: 'email' },
          { status: 409 },
        );
      }
      user.email = data.email.toLowerCase();
    }

    if (data.name !== undefined) user.name = data.name.trim();
    if (data.phone !== undefined) user.phone = data.phone.trim();
    if (data.whatsapp !== undefined) user.whatsapp = data.whatsapp.trim() || undefined;
    if (data.cpf !== undefined) user.cpf = data.cpf.trim() || undefined;

    // Company só pode ser editado por reseller
    if (data.company && user.role === 'reseller') {
      user.company = {
        razaoSocial: data.company.razaoSocial.trim(),
        cnpj: data.company.cnpj.trim(),
        nomeFantasia: data.company.nomeFantasia?.trim() || undefined,
        inscricaoEstadual: data.company.inscricaoEstadual?.trim() || undefined,
      };
    }

    await user.save();

    console.log(`[account/profile PATCH] ${user.email} updated profile`);

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('[account/profile PATCH] error:', err);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
