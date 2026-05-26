/* ══════════════════════════════════════════
   PATCH /api/admin/reseller-applications/[id]
   ──────────────────────────────────────────
   Ações de workflow do admin sobre uma aplicação:
   - action: 'approve' → status: approved + cria User com role:reseller + tier
   - action: 'reject'  → status: rejected + rejectionReason
   - action: 'reopen'  → volta para pending (caso tenha aprovado/rejeitado por engano)

   Segurança: NextAuth + role 'admin' obrigatório.
   ══════════════════════════════════════════ */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import ResellerApplication from '@/models/ResellerApplication';
import User from '@/models/User';
import { auth } from '@/lib/auth';
import { Types } from 'mongoose';

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

const ApproveSchema = z.object({
  action: z.literal('approve'),
  discountTier: z.union([z.literal(0), z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
});

const RejectSchema = z.object({
  action: z.literal('reject'),
  rejectionReason: z.string().min(3).max(500),
});

const ReopenSchema = z.object({
  action: z.literal('reopen'),
});

const ActionSchema = z.discriminatedUnion('action', [ApproveSchema, RejectSchema, ReopenSchema]);

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  try {
    const { id } = await ctx.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);

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

    const application = await ResellerApplication.findById(id);
    if (!application) {
      return NextResponse.json({ error: 'Aplicação não encontrada' }, { status: 404 });
    }

    const action = parsed.data.action;

    // ─── REOPEN ───
    if (action === 'reopen') {
      application.status = 'pending';
      application.rejectionReason = undefined;
      application.approvedDiscountTier = undefined;
      application.reviewedBy = undefined;
      application.reviewedAt = undefined;
      // NÃO desfaz o createdUserId — o User pode continuar existindo, só não é mais "aprovado"
      await application.save();

      console.log(
        `[admin/reseller-applications REOPEN] ${guard.session.user.email} reopened ${application.cnpj}`,
      );

      return NextResponse.json({
        success: true,
        application: {
          _id: String(application._id),
          status: application.status,
        },
      });
    }

    // ─── REJECT ───
    if (action === 'reject') {
      if (application.status === 'rejected') {
        return NextResponse.json({ error: 'Aplicação já estava rejeitada' }, { status: 409 });
      }

      application.status = 'rejected';
      application.rejectionReason = parsed.data.rejectionReason;
      application.reviewedBy = new Types.ObjectId(String(guard.session.user.id));
      application.reviewedAt = new Date();
      await application.save();

      console.log(
        `[admin/reseller-applications REJECT] ${guard.session.user.email} rejected ${application.cnpj}`,
      );

      return NextResponse.json({
        success: true,
        application: {
          _id: String(application._id),
          status: application.status,
          rejectionReason: application.rejectionReason,
        },
      });
    }

    // ─── APPROVE ───
    if (application.status === 'approved') {
      return NextResponse.json({ error: 'Aplicação já estava aprovada' }, { status: 409 });
    }

    const tier = parsed.data.discountTier;

    // Tier 0 com role reseller não faz sentido (model do User bloqueia)
    // Aceitamos mas trataremos como "aprovado sem desconto"

    // Cria User caso não exista
    let userId = application.createdUserId;
    let userCreated = false;

    if (!userId) {
      const existingUser = await User.findOne({
        email: application.email.toLowerCase(),
      });

      if (existingUser) {
        // Já tem usuário com esse email → promove para reseller
        existingUser.role = 'reseller';
        if (tier > 0) existingUser.discountTier = tier;
        if (!existingUser.company) {
          existingUser.company = {
            razaoSocial: application.razaoSocial,
            cnpj: application.cnpj,
            nomeFantasia: application.nomeFantasia,
            inscricaoEstadual: application.inscricaoEstadual,
          };
        }
        await existingUser.save();
        userId = existingUser._id as Types.ObjectId;
      } else {
        // Cria novo user SEM senha (modelo permite — guest checkout pattern).
        // Cliente vai usar "esqueci senha" para definir senha no primeiro acesso.
        const newUser = await User.create({
          email: application.email.toLowerCase(),
          name: application.contactName,
          phone: application.phone,
          whatsapp: application.whatsapp || undefined,
          role: 'reseller',
          discountTier: tier > 0 ? tier : 0,
          isActive: true,
          company: {
            razaoSocial: application.razaoSocial,
            cnpj: application.cnpj,
            nomeFantasia: application.nomeFantasia,
            inscricaoEstadual: application.inscricaoEstadual,
          },
        });
        userId = newUser._id as Types.ObjectId;
        userCreated = true;
      }
    }

    // Atualiza a aplicação
    application.status = 'approved';
    application.approvedDiscountTier = tier;
    application.createdUserId = userId;
    application.reviewedBy = new Types.ObjectId(String(guard.session.user.id));
    application.reviewedAt = new Date();
    application.rejectionReason = undefined;
    await application.save();

    console.log(
      `[admin/reseller-applications APPROVE] ${guard.session.user.email} approved ${application.cnpj} → tier ${tier}% (user ${userCreated ? 'created' : 'updated'}: ${userId})`,
    );

    return NextResponse.json({
      success: true,
      application: {
        _id: String(application._id),
        status: application.status,
        approvedDiscountTier: application.approvedDiscountTier,
        createdUserId: String(userId),
      },
      userCreated,
    });
  } catch (err) {
    console.error('[admin/reseller-applications PATCH] error:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Erro ao processar aplicação' },
      { status: 500 },
    );
  }
}
