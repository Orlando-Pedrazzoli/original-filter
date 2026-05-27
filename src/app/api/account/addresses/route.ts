/* ══════════════════════════════════════════
   /api/account/addresses
   ══════════════════════════════════════════
   GET   → lista endereços do usuário
   POST  → adiciona novo endereço

   Limite: 10 endereços por usuário (boa prática para frotas
   com múltiplos depósitos sem permitir abuso).
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MAX_ADDRESSES = 10;

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
// GET — Lista de endereços
// ══════════════════════════════════════════
export async function GET() {
  const guard = await requireLogin();
  if ('error' in guard) return guard.error;

  try {
    await dbConnect();

    const user = (await User.findById(guard.session.user.id)
      .select('addresses')
      .lean()) as unknown as {
      addresses?: Array<{
        label: string;
        cep: string;
        logradouro: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        uf: string;
        isDefault: boolean;
      }>;
    } | null;

    const addresses = (user?.addresses ?? []).map((a, i) => ({
      id: i,
      ...a,
    }));

    return NextResponse.json({
      addresses,
      limit: MAX_ADDRESSES,
      canAddMore: addresses.length < MAX_ADDRESSES,
    });
  } catch (err) {
    console.error('[account/addresses GET] error:', err);
    return NextResponse.json({ error: 'Erro ao buscar endereços' }, { status: 500 });
  }
}

// ══════════════════════════════════════════
// POST — Adicionar endereço
// ══════════════════════════════════════════
const AddressSchema = z.object({
  label: z.enum(['principal', 'cobranca', 'entrega']),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido (formato: 00000-000)'),
  logradouro: z.string().min(2).max(200),
  numero: z.string().min(1).max(20),
  complemento: z.string().max(100).optional(),
  bairro: z.string().min(2).max(100),
  cidade: z.string().min(2).max(100),
  uf: z.string().length(2, 'UF deve ter 2 letras'),
  isDefault: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const guard = await requireLogin();
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json();
    const parsed = AddressSchema.safeParse(body);

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

    if ((user.addresses?.length ?? 0) >= MAX_ADDRESSES) {
      return NextResponse.json(
        {
          error: `Limite de ${MAX_ADDRESSES} endereços atingido. Remova algum antes de adicionar outro.`,
        },
        { status: 409 },
      );
    }

    const newAddress = {
      ...parsed.data,
      uf: parsed.data.uf.toUpperCase(),
      cep: parsed.data.cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2'),
    };

    // Se marcou como default, desmarca os outros
    if (newAddress.isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }
    // Se é o primeiro endereço, força como default
    if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    console.log(
      `[account/addresses POST] ${user.email} added address (total: ${user.addresses.length})`,
    );

    return NextResponse.json(
      {
        success: true,
        address: { id: user.addresses.length - 1, ...newAddress },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[account/addresses POST] error:', err);
    return NextResponse.json({ error: 'Erro ao adicionar endereço' }, { status: 500 });
  }
}
