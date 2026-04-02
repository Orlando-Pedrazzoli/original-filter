import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-dark flex min-h-screen flex-col items-center justify-center text-white">
      <div className="text-center">
        <div className="bg-brand text-dark mb-6 inline-block rounded px-4 py-2 text-sm font-black tracking-wider">
          ORIGINAL FILTER
        </div>
        <h1 className="text-brand mb-4 text-7xl font-black">404</h1>
        <h2 className="mb-2 text-2xl font-bold">Página não encontrada</h2>
        <p className="mb-8 text-gray-400">A página que procura não existe ou foi movida.</p>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="bg-brand text-dark hover:bg-brand-hover flex items-center gap-2 rounded-xl px-6 py-3 font-bold transition-colors"
          >
            <Home className="h-4 w-4" />
            Página Inicial
          </Link>
          <Link
            href="/produtos"
            className="hover:border-brand hover:text-brand flex items-center gap-2 rounded-xl border border-gray-700 px-6 py-3 font-bold transition-colors"
          >
            <Search className="h-4 w-4" />
            Buscar Produtos
          </Link>
        </div>
      </div>
    </div>
  );
}
