/* ══════════════════════════════════════════
   /conta — Dashboard do cliente
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ShoppingBag,
  MapPin,
  UserRound,
  Briefcase,
  Search,
  Sparkles,
  ArrowRight,
  Tag,
} from 'lucide-react';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { auth } from '@/lib/auth';
import { CONTACT } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Minha conta — Original Filter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ContaDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/conta/login');
  if (session.user.role === 'admin') redirect('/admin');

  await dbConnect();

  // Busca dados em paralelo
  const [userDoc, ordersStats] = await Promise.all([
    User.findById(session.user.id).select('addresses createdAt').lean() as Promise<{
      addresses?: unknown[];
      createdAt?: Date;
    } | null>,
    // Stats de pedidos (preparado pra quando o Order tiver dados)
    Order.aggregate([
      { $match: { userId: session.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]).catch(() => []),
  ]);

  const addressCount = userDoc?.addresses?.length ?? 0;
  const memberSince = userDoc?.createdAt
    ? new Date(userDoc.createdAt).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  // Stats de pedidos
  const orderCounts = new Map<string, number>(
    (ordersStats as Array<{ _id: string; count: number }>).map((s) => [s._id, s.count]),
  );
  const totalOrders = Array.from(orderCounts.values()).reduce((a, b) => a + b, 0);
  const activeOrders =
    (orderCounts.get('pending') ?? 0) +
    (orderCounts.get('processing') ?? 0) +
    (orderCounts.get('shipped') ?? 0);

  const isReseller = session.user.role === 'reseller';
  const tier = session.user.discountTier ?? 0;
  const firstName = session.user.name?.split(' ')[0] || 'Bem-vindo';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-6">
      {/* Saudação */}
      <div>
        <div className="text-brand-yellow-deep mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
          {greeting}
        </div>
        <h2
          className="font-display text-brand-black leading-tight font-black tracking-tight"
          style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            letterSpacing: '-0.035em',
          }}
        >
          {firstName}
          <span className="text-brand-yellow-deep">.</span>
        </h2>
        {memberSince && (
          <p className="text-brand-iron mt-1.5 text-sm">Cliente desde {memberSince}</p>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard
          icon={isReseller ? <Briefcase className="size-4" /> : <UserRound className="size-4" />}
          label="Status"
          value={isReseller ? 'Revendedor' : 'Cliente'}
          accent={isReseller ? `${tier}% B2B` : null}
        />
        <KpiCard
          icon={<ShoppingBag className="size-4" />}
          label="Pedidos ativos"
          value={String(activeOrders)}
          accent={totalOrders > 0 ? `${totalOrders} no total` : null}
          href="/conta/pedidos"
        />
        <KpiCard
          icon={<MapPin className="size-4" />}
          label="Endereços salvos"
          value={String(addressCount)}
          accent={addressCount === 0 ? 'Adicione o primeiro' : null}
          href="/conta/enderecos"
        />
      </div>

      {/* Faixa B2B (apenas reseller) */}
      {isReseller && tier > 0 && (
        <div
          className="bg-brand-yellow text-brand-black border-brand-yellow-deep relative overflow-hidden border"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, transparent, transparent 16px, #000 16px, #000 17px)',
            }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4 p-5 md:p-6">
            <div className="flex items-start gap-3">
              <Tag className="mt-0.5 size-5 shrink-0" strokeWidth={2.5} />
              <div>
                <div className="mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
                  Programa Revendedor · ativo
                </div>
                <div
                  className="font-display leading-tight font-black"
                  style={{
                    fontSize: 'clamp(1.125rem, 2.2vw, 1.5rem)',
                    letterSpacing: '-0.025em',
                  }}
                >
                  Você economiza {tier}% em todos os produtos.
                </div>
                <div className="text-brand-black/80 mt-1.5 text-sm">
                  Desconto aplicado automaticamente no checkout. Para condições especiais por
                  volume, fale com o time comercial.
                </div>
              </div>
            </div>
            <a
              href={CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide uppercase transition"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              Falar com comercial
              <ArrowRight className="size-3.5" strokeWidth={2.5} />
            </a>
          </div>
        </div>
      )}

      {/* Atalhos rápidos */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-brand-yellow h-px w-8" />
          <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
            Atalhos
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ActionCard
            icon={<Search className="size-5" />}
            title="Continuar comprando"
            description="Explore o catálogo completo"
            href="/produtos"
          />
          <ActionCard
            icon={<Sparkles className="size-5" />}
            title="Cross-reference"
            description="Encontre por código OEM"
            href="/cross-reference"
          />
          <ActionCard
            icon={<Tag className="size-5" />}
            title="Lançamentos"
            description="Produtos novos e exclusivos"
            href="/lancamentos"
          />
          <ActionCard
            icon={<UserRound className="size-5" />}
            title="Editar perfil"
            description="Dados pessoais e empresa"
            href="/conta/perfil"
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//   Sub-componentes
// ═══════════════════════════════════════════

function KpiCard({
  icon,
  label,
  value,
  accent,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string | null;
  href?: string;
}) {
  const content = (
    <>
      <div className="text-brand-iron mb-2 flex items-center gap-2">
        {icon}
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase">{label}</span>
      </div>
      <div
        className="font-display text-brand-black leading-none font-black tracking-tight"
        style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          letterSpacing: '-0.025em',
        }}
      >
        {value}
      </div>
      {accent && (
        <div className="text-brand-yellow-deep mt-2 font-mono text-[10px] tracking-widest uppercase">
          {accent}
        </div>
      )}
    </>
  );

  const baseClass = 'bg-brand-white border border-brand-mist p-4 block';
  const radiusStyle = { borderRadius: 'var(--radius-edge)' };

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClass} hover:border-brand-iron group transition`}
        style={radiusStyle}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={baseClass} style={radiusStyle}>
      {content}
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-brand-white border-brand-mist hover:border-brand-iron relative flex items-center gap-4 border p-4 transition"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <span className="bg-brand-yellow absolute top-0 bottom-0 left-0 w-1 origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />

      <div className="bg-brand-snow text-brand-iron group-hover:bg-brand-yellow group-hover:text-brand-black inline-flex size-10 shrink-0 items-center justify-center transition">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-brand-black leading-tight font-bold">{title}</div>
        <div className="text-brand-iron mt-1 font-mono text-[11px] tracking-widest uppercase">
          {description}
        </div>
      </div>
      <ArrowRight
        className="text-brand-mist group-hover:text-brand-yellow-deep size-4 shrink-0 transition"
        strokeWidth={2}
      />
    </Link>
  );
}
