/* ══════════════════════════════════════════
   GET /api/admin/reseller-applications
   ══════════════════════════════════════════
   Lista de aplicações de revendedores para o admin.

   Query params:
   - q          (busca em razaoSocial, cnpj, contactName, email)
   - status     (pending | approved | rejected | all) — padrão pending
   - segment    (oficina | distribuidora | atacado | ...)
   - sort       (createdAt | razaoSocial | reviewedAt) — padrão createdAt
   - order      (asc | desc) — padrão desc
   - page       (1..) — padrão 1
   - limit      (1..100) — padrão 25
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import ResellerApplication from '@/models/ResellerApplication';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) };
  }
  if (session.user.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Acesso restrito' }, { status: 403 }) };
  }
  return { session };
}

const VALID_STATUS = ['pending', 'approved', 'rejected', 'all'];
const VALID_SEGMENTS = [
  'oficina',
  'distribuidora',
  'atacado',
  'loja',
  'frota',
  'concessionaria',
  'outro',
];

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get('q')?.trim() || '';
    const status = sp.get('status') || 'pending';
    const segment = sp.get('segment') || '';
    const sort = sp.get('sort') || 'createdAt';
    const order = (sp.get('order') === 'asc' ? 1 : -1) as 1 | -1;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '25', 10)));

    await dbConnect();

    const filter: Record<string, unknown> = {};

    if (VALID_STATUS.includes(status) && status !== 'all') {
      filter.status = status;
    }
    if (VALID_SEGMENTS.includes(segment)) {
      filter.segment = segment;
    }
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { razaoSocial: regex },
        { cnpj: regex },
        { contactName: regex },
        { email: regex },
        { cidade: regex },
      ];
    }

    const validSort = ['createdAt', 'razaoSocial', 'reviewedAt'];
    const sortField = validSort.includes(sort) ? sort : 'createdAt';
    const sortObj: Record<string, 1 | -1> = { [sortField]: order };

    const [items, total, statusCounts] = await Promise.all([
      ResellerApplication.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ResellerApplication.countDocuments(filter),
      ResellerApplication.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const countByStatus = new Map<string, number>(
      (statusCounts as Array<{ _id: string; count: number }>).map((s) => [s._id, s.count]),
    );

    const rows = items.map((a) => ({
      _id: String(a._id),
      razaoSocial: a.razaoSocial,
      cnpj: a.cnpj,
      nomeFantasia: a.nomeFantasia ?? '',
      inscricaoEstadual: a.inscricaoEstadual ?? '',
      contactName: a.contactName,
      email: a.email,
      phone: a.phone,
      whatsapp: a.whatsapp ?? '',
      cidade: a.cidade,
      uf: a.uf,
      segment: a.segment,
      estimatedMonthlyVolume: a.estimatedMonthlyVolume ?? '',
      currentSuppliers: a.currentSuppliers ?? '',
      message: a.message ?? '',
      status: a.status,
      reviewedAt: a.reviewedAt ?? null,
      rejectionReason: a.rejectionReason ?? '',
      approvedDiscountTier: a.approvedDiscountTier ?? null,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({
      items: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      counts: {
        pending: countByStatus.get('pending') ?? 0,
        approved: countByStatus.get('approved') ?? 0,
        rejected: countByStatus.get('rejected') ?? 0,
      },
      filters: { q, status, segment, sort, order: order === 1 ? 'asc' : 'desc' },
    });
  } catch (err) {
    console.error('[admin/reseller-applications GET] error:', err);
    return NextResponse.json({ error: 'Erro ao listar aplicações' }, { status: 500 });
  }
}
