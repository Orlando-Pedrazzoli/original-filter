/* ══════════════════════════════════════════
   Original Filter — API /api/reseller-application
   ══════════════════════════════════════════
   POST: cria solicitação pendente. Admin vê e aprova no painel.
   GET: (admin) lista aplicações com filtros
   
   Validação: Zod
   Rate limit: TODO (delegado ao middleware/edge na Etapa B-rate-limit)
   ══════════════════════════════════════════ */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import ResellerApplication from '@/models/ResellerApplication';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ApplicationSchema = z.object({
  razaoSocial: z.string().min(2, 'Razão social muito curta').max(200),
  cnpj: z
    .string()
    .regex(
      /^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      'CNPJ inválido (use 14 dígitos ou formato XX.XXX.XXX/XXXX-XX)',
    ),
  nomeFantasia: z.string().max(200).optional(),
  inscricaoEstadual: z.string().max(50).optional(),

  contactName: z.string().min(2, 'Nome muito curto').max(100),
  email: z.string().email('E-mail inválido').toLowerCase(),
  phone: z.string().min(8, 'Telefone inválido').max(20),
  whatsapp: z.string().max(20).optional(),

  cidade: z.string().min(2).max(100),
  uf: z.string().length(2).toUpperCase(),

  segment: z.enum([
    'oficina',
    'distribuidora',
    'atacado',
    'loja',
    'frota',
    'concessionaria',
    'outro',
  ]),
  estimatedMonthlyVolume: z.string().max(100).optional(),
  currentSuppliers: z.string().max(300).optional(),
  message: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const parsed = ApplicationSchema.safeParse(body);

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

    const data = parsed.data;

    // Verificar se já existe aplicação pendente com mesmo CNPJ
    const existing = await ResellerApplication.findOne({
      cnpj: data.cnpj,
      status: 'pending',
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            'Já existe uma solicitação em análise para este CNPJ. Aguarde o contato do nosso time.',
        },
        { status: 409 },
      );
    }

    const application = await ResellerApplication.create(data);

    // TODO (Etapa C): disparar email para admin + notificação no painel

    return NextResponse.json(
      {
        success: true,
        id: application._id.toString(),
        message:
          'Solicitação enviada com sucesso. Nosso time entrará em contato em até 2 dias úteis.',
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('POST /api/reseller-application error:', err);
    return NextResponse.json({ error: 'Falha ao processar solicitação' }, { status: 500 });
  }
}

// ─── GET: só admin ───
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    await dbConnect();

    const sp = req.nextUrl.searchParams;
    const status = sp.get('status'); // pending | approved | rejected | all
    const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') ?? '20', 10)));

    const filter: Record<string, unknown> = {};
    if (status && status !== 'all') filter.status = status;

    const [items, total] = await Promise.all([
      ResellerApplication.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ResellerApplication.countDocuments(filter),
    ]);

    return NextResponse.json({
      items: items.map((i) => ({ ...i, id: i._id.toString() })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('GET /api/reseller-application error:', err);
    return NextResponse.json({ error: 'Falha ao listar' }, { status: 500 });
  }
}
