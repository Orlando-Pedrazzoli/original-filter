import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';
import { Package, ShoppingCart, Users, MessageSquare, FileText, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | Admin',
};

async function getStats() {
  try {
    await dbConnect();
    const totalContatos = await Contact.countDocuments();
    const contatosNovos = await Contact.countDocuments({ status: 'novo' });
    return { totalContatos, contatosNovos };
  } catch {
    return { totalContatos: 0, contatosNovos: 0 };
  }
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const stats = await getStats();

  const cards = [
    {
      label: 'Produtos',
      value: '—',
      sublabel: 'Aguardando catálogo',
      icon: Package,
      color: 'text-brand',
      bg: 'bg-brand/10',
    },
    {
      label: 'Pedidos',
      value: '0',
      sublabel: 'Nenhum pedido ainda',
      icon: ShoppingCart,
      color: 'text-info',
      bg: 'bg-info/10',
    },
    {
      label: 'Contatos',
      value: String(stats.totalContatos),
      sublabel: `${stats.contatosNovos} novos`,
      icon: MessageSquare,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Clientes',
      value: '0',
      sublabel: 'Nenhum cliente registrado',
      icon: Users,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Blog',
      value: '0',
      sublabel: 'Nenhum post publicado',
      icon: FileText,
      color: 'text-danger',
      bg: 'bg-danger/10',
    },
    {
      label: 'Receita',
      value: 'R$ 0',
      sublabel: 'E-commerce em breve',
      icon: TrendingUp,
      color: 'text-brand',
      bg: 'bg-brand/10',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-dark text-2xl font-bold">Olá, {session?.user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-dark mt-1 text-sm">
          Bem-vindo ao painel administrativo da Original Filter.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-dark text-sm font-medium">{card.label}</p>
                <p className="text-dark mt-2 text-3xl font-bold">{card.value}</p>
                <p className="text-muted mt-1 text-xs">{card.sublabel}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-dark mb-4 text-lg font-bold">Próximos passos</h2>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm">
              <span className="bg-brand mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" />
              <span className="text-muted-dark">
                <strong className="text-dark">Catálogo de produtos</strong> — aguardando documento
                do cliente com produtos e imagens.
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="bg-surface-alt mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" />
              <span className="text-muted-dark">
                <strong className="text-dark">Componentes UI</strong> — button, card, input, select,
                badge, skeleton, modal, textarea.
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="bg-surface-alt mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" />
              <span className="text-muted-dark">
                <strong className="text-dark">Blog CMS</strong> — criar, editar e publicar artigos
                técnicos.
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="bg-surface-alt mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" />
              <span className="text-muted-dark">
                <strong className="text-dark">E-commerce B2B</strong> — carrinho, checkout,
                Pagar.me, Melhor Envio.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
