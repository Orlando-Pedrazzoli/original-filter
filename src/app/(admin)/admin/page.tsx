/* ══════════════════════════════════════════
   /admin — Dashboard Home
   ──────────────────────────────────────────
   Visão geral do painel administrativo.

   Estrutura:
   1. Welcome com nome + horário
   2. KPIs principais (catálogo, lançamentos, sensores, pendências)
   3. Atalhos rápidos (cards grandes)
   4. Pendências (revendedores aguardando + alertas)
   5. Status do site (links úteis)
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Package,
  Sparkles,
  Activity,
  ClipboardList,
  ShoppingBag,
  Users,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ExternalLink,
  Tags,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import ResellerApplication from '@/models/ResellerApplication';
import User from '@/models/User';

export const metadata: Metadata = {
  title: 'Dashboard — Admin Original Filter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// ─── Helper para saudação por horário ───
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'admin';

  await dbConnect();

  // KPIs em paralelo
  const [
    totalProducts,
    activeProducts,
    inactiveProducts,
    launchesCount,
    featuredCount,
    patentedCount,
    sensorsTotal,
    sensorsAsLaunch,
    pendingResellers,
    totalCustomers,
    productsWithoutImage,
  ] = await Promise.all([
    Product.countDocuments({}),
    Product.countDocuments({ status: 'active' }),
    Product.countDocuments({ status: 'inactive' }),
    Product.countDocuments({ status: 'active', isNewRelease: true }),
    Product.countDocuments({ status: 'active', isFeatured: true }),
    Product.countDocuments({ status: 'active', isPatented: true }),
    Product.countDocuments({ status: 'active', productType: 'sensor' }),
    Product.countDocuments({
      status: 'active',
      productType: 'sensor',
      isNewRelease: true,
    }),
    ResellerApplication.countDocuments({ status: 'pending' }),
    User.countDocuments({ role: 'retail' }),
    Product.countDocuments({
      status: 'active',
      $or: [{ images: { $size: 0 } }, { images: { $exists: false } }],
    }),
  ]);

  // Pendências relevantes (até 5 mais recentes)
  const recentPendingResellers =
    pendingResellers > 0
      ? ((await ResellerApplication.find({ status: 'pending' })
          .select('razaoSocial cnpj segment cidade uf createdAt')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()) as unknown as Array<{
          _id: { toString(): string };
          razaoSocial: string;
          cnpj: string;
          segment: string;
          cidade: string;
          uf: string;
          createdAt: Date;
        }>)
      : [];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* ═══ Welcome ═══ */}
      <section>
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-brand-yellow h-px w-8" />
          <span className="text-brand-iron font-mono text-[11px] tracking-[0.25em] uppercase">
            Painel administrativo
          </span>
        </div>
        <h1
          className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            letterSpacing: '-0.035em',
          }}
        >
          {getGreeting()}, <span className="text-brand-yellow-deep">{userName}.</span>
        </h1>
        <p className="text-brand-iron mt-2">Aqui está o resumo do que está acontecendo agora.</p>
      </section>

      {/* ═══ KPIs Catálogo ═══ */}
      <section>
        <SectionHeader
          icon={<Package className="size-4" />}
          title="Catálogo"
          actionLabel="Gerenciar produtos"
          actionHref="/admin/produtos"
        />

        <div className="bg-brand-mist grid grid-cols-2 gap-px md:grid-cols-4">
          <KpiCard
            label="Total no catálogo"
            value={totalProducts}
            sub={`${activeProducts} ativos · ${inactiveProducts} inativos`}
          />
          <KpiCard
            label="Marcados como lançamento"
            value={launchesCount}
            icon={<Sparkles className="size-3.5" strokeWidth={2} />}
            accent="yellow"
            href="/admin/lancamentos"
          />
          <KpiCard
            label="Sensores"
            value={`${sensorsAsLaunch}/${sensorsTotal}`}
            sub="destacados / total"
            icon={<Activity className="size-3.5" strokeWidth={2} />}
            href="/admin/lancamentos"
          />
          <KpiCard
            label="Em destaque (home)"
            value={featuredCount}
            sub={`${patentedCount} patenteados`}
            icon={<TrendingUp className="size-3.5" strokeWidth={2} />}
          />
        </div>
      </section>

      {/* ═══ Pendências importantes ═══ */}
      {(pendingResellers > 0 || productsWithoutImage > 0) && (
        <section>
          <SectionHeader
            icon={<AlertTriangle className="size-4" />}
            title="Pendências"
            badge={`${pendingResellers + (productsWithoutImage > 0 ? 1 : 0)}`}
          />

          <div className="bg-brand-mist space-y-px">
            {/* Revendedores pendentes */}
            {pendingResellers > 0 && (
              <PendingRow
                icon={<ClipboardList className="size-4" />}
                title={`${pendingResellers} ${pendingResellers === 1 ? 'aplicação' : 'aplicações'} de revendedor`}
                description="Aguardando análise comercial"
                hint="Revisar"
                actionHref="/admin/revendedores"
              >
                <ul className="mt-3 space-y-2 pl-7">
                  {recentPendingResellers.map((app) => (
                    <li
                      key={String(app._id)}
                      className="flex flex-wrap items-baseline gap-2 text-xs"
                    >
                      <span className="font-display text-brand-black max-w-xs truncate font-bold">
                        {app.razaoSocial}
                      </span>
                      <span className="text-brand-iron font-mono">{app.cnpj}</span>
                      <span className="text-brand-steel">·</span>
                      <span className="text-brand-iron font-mono uppercase">{app.segment}</span>
                      <span className="text-brand-steel">·</span>
                      <span className="text-brand-steel">
                        {app.cidade}/{app.uf}
                      </span>
                    </li>
                  ))}
                </ul>
              </PendingRow>
            )}

            {/* Produtos sem imagem */}
            {productsWithoutImage > 0 && (
              <PendingRow
                icon={<Package className="size-4" />}
                title={`${productsWithoutImage} produtos ativos sem imagem`}
                description="Cliente vê placeholder. Cadastre fotos para melhorar conversão."
                hint="Em breve"
                actionDisabled
              />
            )}
          </div>
        </section>
      )}

      {/* ═══ Acesso rápido ═══ */}
      <section>
        <SectionHeader icon={<TrendingUp className="size-4" />} title="Acesso rápido" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          <QuickAction
            icon={<Sparkles className="size-5" />}
            title="Gerenciar lançamentos"
            description="Marcar produtos como novidade ou em destaque"
            href="/admin/lancamentos"
            available
          />
          <QuickAction
            icon={<Package className="size-5" />}
            title="Editar produtos"
            description="CRUD completo do catálogo"
            href="/admin/produtos"
            available
          />
          <QuickAction
            icon={<ClipboardList className="size-5" />}
            title="Aprovar revendedores"
            description={
              pendingResellers > 0
                ? `${pendingResellers} aguardando análise`
                : 'Análise de aplicações B2B'
            }
            href="/admin/revendedores"
            highlight={pendingResellers > 0}
            available
          />
          <QuickAction
            icon={<Tags className="size-5" />}
            title="Marcas e categorias"
            description="Cadastro de fabricantes"
            href="/admin/marcas"
            available
          />
          <QuickAction
            icon={<ShoppingBag className="size-5" />}
            title="Pedidos"
            description="Aguardando integração de checkout"
            href="/admin/pedidos"
          />
          <QuickAction
            icon={<Users className="size-5" />}
            title="Clientes"
            description={`${totalCustomers} cadastrados`}
            href="/admin/clientes"
          />
        </div>
      </section>

      {/* ═══ Status do site ═══ */}
      <section>
        <SectionHeader icon={<CheckCircle2 className="size-4" />} title="Site público" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <SitelinkCard label="Página inicial" href="/" />
          <SitelinkCard label="Catálogo público" href="/produtos" />
          <SitelinkCard label="Lançamentos" href="/lancamentos" />
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════
//   Componentes internos
// ═══════════════════════════════════════════

function SectionHeader({
  icon,
  title,
  badge,
  actionLabel,
  actionHref,
  actionDisabled,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  actionLabel?: string;
  actionHref?: string;
  actionDisabled?: boolean;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="text-brand-iron flex items-center gap-2">
        <span className="text-brand-iron">{icon}</span>
        <h2 className="font-mono text-[11px] font-bold tracking-[0.25em] uppercase">{title}</h2>
        {badge && (
          <span className="bg-brand-yellow text-brand-black inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase">
            {badge}
          </span>
        )}
      </div>

      {actionLabel && actionHref && !actionDisabled && (
        <Link
          href={actionHref}
          className="font-display text-brand-iron hover:text-brand-yellow-deep inline-flex items-center gap-1 text-xs font-semibold tracking-wide uppercase transition"
        >
          {actionLabel}
          <ArrowRight className="size-3" />
        </Link>
      )}
      {actionLabel && actionDisabled && (
        <span className="font-display text-brand-mist inline-flex items-center gap-1 text-xs font-semibold tracking-wide uppercase">
          {actionLabel}
          <span className="text-brand-mist font-mono text-[9px]">(em breve)</span>
        </span>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  accent,
  href,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon?: React.ReactNode;
  accent?: 'yellow';
  href?: string;
}) {
  const content = (
    <>
      {accent === 'yellow' && (
        <div className="bg-brand-yellow absolute top-5 bottom-5 left-0 w-1 md:top-6 md:bottom-6" />
      )}
      <div className={accent === 'yellow' ? 'pl-4' : ''}>
        <div className="text-brand-iron mb-2 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.22em] uppercase">
          {icon}
          {label}
        </div>
        <div
          className="font-display text-brand-black leading-none font-black tracking-tight"
          style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            letterSpacing: '-0.035em',
          }}
        >
          {value}
        </div>
        {sub && <div className="text-brand-steel mt-2 truncate font-mono text-xs">{sub}</div>}
        {href && (
          <div className="text-brand-mist group-hover:text-brand-yellow-deep mt-3 inline-flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase transition">
            Gerenciar
            <ArrowRight className="size-3" />
          </div>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="bg-brand-white hover:bg-brand-snow group relative block p-5 transition-colors md:p-6"
      >
        {content}
      </Link>
    );
  }

  return <div className="bg-brand-white relative block p-5 md:p-6">{content}</div>;
}

function PendingRow({
  icon,
  title,
  description,
  hint,
  actionDisabled,
  actionHref,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  hint?: string;
  actionDisabled?: boolean;
  actionHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-brand-white relative p-5 md:p-6">
      <div className="bg-brand-yellow absolute top-5 bottom-5 left-0 w-1 md:top-6 md:bottom-6" />
      <div className="pl-4">
        <div className="flex items-start gap-3">
          <div className="bg-brand-yellow/10 text-brand-yellow-deep flex size-9 shrink-0 items-center justify-center">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-brand-black text-base leading-tight font-bold">
              {title}
            </div>
            <div className="text-brand-steel mt-1 text-sm">{description}</div>
            {children}
          </div>
          {actionHref && hint ? (
            <Link
              href={actionHref}
              className="text-brand-iron hover:text-brand-yellow-deep bg-brand-snow hover:bg-brand-yellow/10 hidden shrink-0 items-center gap-1 px-2 py-1 font-mono text-[10px] tracking-widest uppercase transition md:inline-flex"
            >
              {hint}
              <ArrowRight className="size-3" strokeWidth={2.5} />
            </Link>
          ) : actionDisabled && hint ? (
            <span className="text-brand-mist bg-brand-snow hidden shrink-0 px-2 py-1 font-mono text-[9px] tracking-widest uppercase md:inline-block">
              {hint}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  href,
  available,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  available?: boolean;
  highlight?: boolean;
}) {
  if (!available) {
    return (
      <div
        className="bg-brand-white border-brand-mist relative cursor-not-allowed border p-5 opacity-60 md:p-6"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        <div className="text-brand-mist bg-brand-snow absolute top-3 right-3 px-1.5 py-0.5 font-mono text-[9px] tracking-widest uppercase">
          em breve
        </div>
        <div className="bg-brand-snow text-brand-mist mb-4 flex size-10 items-center justify-center">
          {icon}
        </div>
        <div className="font-display text-brand-iron mb-1 text-base leading-tight font-bold">
          {title}
        </div>
        <div className="text-brand-steel text-xs">{description}</div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`bg-brand-white group relative block border p-5 transition-colors md:p-6 ${
        highlight
          ? 'border-brand-yellow hover:bg-brand-yellow/5'
          : 'border-brand-mist hover:border-brand-iron'
      }`}
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {highlight && (
        <div className="bg-brand-yellow absolute top-3 right-3 size-2 animate-pulse rounded-full" />
      )}
      <div className="bg-brand-black text-brand-yellow group-hover:bg-brand-graphite mb-4 flex size-10 items-center justify-center transition">
        {icon}
      </div>
      <div className="font-display text-brand-black mb-1 text-base leading-tight font-bold">
        {title}
      </div>
      <div className="text-brand-steel mb-3 text-xs">{description}</div>
      <div className="text-brand-iron group-hover:text-brand-yellow-deep inline-flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase transition">
        Acessar
        <ArrowRight className="size-3" />
      </div>
    </Link>
  );
}

function SitelinkCard({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-brand-white border-brand-mist hover:border-brand-iron group flex items-center justify-between gap-3 border p-4 transition-colors"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <div>
        <div className="text-brand-iron mb-0.5 font-mono text-[10px] tracking-widest uppercase">
          Ver no site
        </div>
        <div className="font-display text-brand-black group-hover:text-brand-yellow-deep text-sm font-bold transition">
          {label}
        </div>
      </div>
      <ExternalLink className="text-brand-mist group-hover:text-brand-yellow-deep size-4 shrink-0 transition" />
    </a>
  );
}
