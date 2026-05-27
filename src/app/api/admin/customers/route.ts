/* ══════════════════════════════════════════
   GET /api/admin/customers
   ══════════════════════════════════════════
   Lista paginada de usuários (clientes B2C e revendedores B2B).
   NÃO inclui admins na listagem (para evitar acidentes).

   Query params:
   - q                 (busca por nome, email, CNPJ, CPF, telefone)
   - role              (retail | reseller | all) — padrão all
   - active            (true | false | '')
   - tier              (0 | 5 | 10 | 15 | 20) — para filtrar por tier B2B
   - sort              (createdAt | name | lastLogin | totalSpent)
   - order             (asc | desc) — padrão desc
   - page              (1..) — padrão 1
   - limit             (1..100) — padrão 25

   Resposta inclui counts por role para badges das tabs e
   stats agregados de cada cliente (totalSpent, ordersCount).
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
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

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get('q')?.trim() || '';
    const role = sp.get('role') || 'all';
    const active = sp.get('active') || '';
    const tier = sp.get('tier');
    const sort = sp.get('sort') || 'createdAt';
    const order = (sp.get('order') === 'asc' ? 1 : -1) as 1 | -1;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '25', 10)));

    await dbConnect();

    const filter: Record<string, unknown> = {
      // Nunca lista admins por aqui
      role: { $ne: 'admin' },
    };

    if (role === 'retail' || role === 'reseller') {
      filter.role = role;
    }
    if (active === 'true') filter.isActive = true;
    if (active === 'false') filter.isActive = false;

    if (tier !== null && tier !== '') {
      const tierNum = parseInt(tier, 10);
      if ([0, 5, 10, 15, 20].includes(tierNum)) {
        filter.discountTier = tierNum;
      }
    }

    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { cpf: regex },
        { 'company.cnpj': regex },
        { 'company.razaoSocial': regex },
      ];
    }

    const validSort = ['createdAt', 'name', 'lastLogin', 'email'];
    const sortField = validSort.includes(sort) ? sort : 'createdAt';
    const sortObj: Record<string, 1 | -1> = { [sortField]: order };

    // ─── 3 queries paralelas ───
    const [items, total, roleCounts] = await Promise.all([
      User.find(filter)
        .select(
          'name email phone role discountTier isActive company.razaoSocial company.cnpj lastLogin createdAt',
        )
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
      User.aggregate([
        { $match: { role: { $ne: 'admin' } } },
        {
          $group: {
            _id: { role: '$role', isActive: '$isActive' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // ─── Stats de pedidos por cliente (uma única query agregada) ───
    const userIds = items.map((u) => u._id);
    const orderStats = userIds.length
      ? await Order.aggregate([
          {
            $match: {
              customer: { $in: userIds.map((id) => new Types.ObjectId(String(id))) },
            },
          },
          {
            $group: {
              _id: '$customer',
              ordersCount: { $sum: 1 },
              totalSpent: {
                $sum: {
                  $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0],
                },
              },
              lastOrderAt: { $max: '$createdAt' },
            },
          },
        ])
      : [];

    const statsByUser = new Map<
      string,
      { ordersCount: number; totalSpent: number; lastOrderAt: Date }
    >(
      (
        orderStats as Array<{
          _id: Types.ObjectId;
          ordersCount: number;
          totalSpent: number;
          lastOrderAt: Date;
        }>
      ).map((s) => [
        String(s._id),
        {
          ordersCount: s.ordersCount,
          totalSpent: s.totalSpent,
          lastOrderAt: s.lastOrderAt,
        },
      ]),
    );

    // ─── Process counts agregados ───
    const counts = {
      retail: 0,
      reseller: 0,
      active: 0,
      inactive: 0,
    };
    for (const c of roleCounts as Array<{
      _id: { role: string; isActive: boolean };
      count: number;
    }>) {
      if (c._id.role === 'retail') counts.retail += c.count;
      if (c._id.role === 'reseller') counts.reseller += c.count;
      if (c._id.isActive) counts.active += c.count;
      else counts.inactive += c.count;
    }

    const rows = items.map((u) => {
      const stats = statsByUser.get(String(u._id));
      return {
        _id: String(u._id),
        name: u.name ?? '',
        email: u.email ?? '',
        phone: u.phone ?? '',
        role: u.role,
        discountTier: u.discountTier ?? 0,
        isActive: u.isActive ?? true,
        company: u.company
          ? {
              razaoSocial: u.company.razaoSocial,
              cnpj: u.company.cnpj,
            }
          : null,
        lastLogin: u.lastLogin ?? null,
        createdAt: u.createdAt,
        // Stats
        ordersCount: stats?.ordersCount ?? 0,
        totalSpent: stats?.totalSpent ?? 0,
        lastOrderAt: stats?.lastOrderAt ?? null,
      };
    });

    return NextResponse.json({
      items: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      counts,
      filters: {
        q,
        role,
        active,
        tier: tier ?? '',
        sort,
        order: order === 1 ? 'asc' : 'desc',
      },
    });
  } catch (err) {
    console.error('[admin/customers GET] error:', err);
    return NextResponse.json({ error: 'Erro ao listar clientes' }, { status: 500 });
  }
}
