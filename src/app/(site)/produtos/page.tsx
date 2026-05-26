/* ══════════════════════════════════════════
   /produtos — Catálogo Original Filter
   ──────────────────────────────────────────
   Página de listagem com:
   - PageHero compacto (com breadcrumb e contexto da query)
   - Search bar
   - Sidebar de filtros (tipo, linha, categoria, flags)
   - Ordenação
   - Grid responsivo de produtos
   - Paginação
   - EmptyState para 0 resultados

   Estado todo sincronizado com URL (querystring) para SEO,
   compartilhamento e back/forward do browser.
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { PageHero } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { ProductSort } from '@/components/products/product-sort';
import { ProductsSearchBar } from '@/components/products/products-search-bar';
import type { ProductCardData } from '@/components/products/product-card';

interface ApiResponse {
  items: ProductCardData[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const LIMIT = 24;

// Labels amigáveis para as queries (mostrar na PageHero)
const LINHA_LABELS: Record<string, string> = {
  rodoviario: 'Linha Rodoviária',
  agricola: 'Linha Agrícola',
  'maquinas-pesadas': 'Linha Máquinas Pesadas',
  automotivo: 'Linha Automotiva',
  industrial: 'Linha Industrial',
};

const TIPO_LABELS: Record<string, string> = {
  filter: 'Filtros',
  sensor: 'Sensores',
  accessory: 'Acessórios',
};

export default function ProdutosPage() {
  const sp = useSearchParams();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Build URL completa da query (sincronizada com sp)
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    sp.forEach((v, k) => params.set(k, v));
    if (!params.has('limit')) params.set('limit', String(LIMIT));
    return `/api/products?${params.toString()}`;
  }, [sp]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(apiUrl)
      .then((r) => r.json())
      .then((d: ApiResponse) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  // Contexto da query atual (para o título do hero)
  const linha = sp.get('linha');
  const tipo = sp.get('tipo');
  const q = sp.get('q');
  const categoria = sp.get('categoria');
  const patenteado = sp.get('patenteado') === 'true';
  const lancamento = sp.get('lancamento') === 'true';

  const { heroTitle, heroEyebrow, heroDesc } = useMemo(() => {
    if (q) {
      return {
        heroEyebrow: 'Resultados da busca',
        heroTitle: `"${q}"`,
        heroDesc: undefined,
      };
    }
    if (patenteado) {
      return {
        heroEyebrow: 'Linha Patenteada',
        heroTitle: 'Tecnologia exclusiva\nOriginal Filter.',
        heroDesc:
          'Soluções desenvolvidas pelo nosso Centro de Pesquisa & Desenvolvimento, registradas no INPI e únicas no mercado de reposição brasileiro.',
      };
    }
    if (lancamento) {
      return {
        heroEyebrow: 'Lançamentos',
        heroTitle: 'Novidades no\ncatálogo.',
        heroDesc: 'Os produtos mais recentes lançados pela Original Filter.',
      };
    }
    if (linha && LINHA_LABELS[linha]) {
      return {
        heroEyebrow: LINHA_LABELS[linha],
        heroTitle: 'Catálogo de produtos.',
        heroDesc: 'Filtros e sensores para a linha selecionada.',
      };
    }
    if (tipo && TIPO_LABELS[tipo]) {
      return {
        heroEyebrow: `Categoria · ${TIPO_LABELS[tipo]}`,
        heroTitle: `Catálogo de ${TIPO_LABELS[tipo].toLowerCase()}.`,
        heroDesc: undefined,
      };
    }
    if (categoria) {
      const label = categoria.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
      return {
        heroEyebrow: 'Categoria',
        heroTitle: label,
        heroDesc: undefined,
      };
    }
    return {
      heroEyebrow: 'Catálogo completo',
      heroTitle: 'Filtros, sensores\ne acessórios.',
      heroDesc:
        'Linha completa de reposição para aplicações automotivas, agrícolas, industriais e fora-de-estrada.',
    };
  }, [q, linha, tipo, categoria, patenteado, lancamento]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const totalPages = data?.pages ?? 1;

  // Extrai categorias únicas dos resultados para o filtro lateral
  const availableCategories = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, number>();
    for (const p of items) {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([slug, count]) => ({
        slug,
        label: slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [data, items]);

  return (
    <>
      <PageHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        description={heroDesc}
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Catálogo' }]}
        size="md"
        right={
          <div className="hidden items-center gap-3 text-sm md:flex">
            <ProductsSearchBar />
          </div>
        }
      />

      <section className="bg-brand-snow py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          {/* Search bar mobile + toolbar */}
          <div className="mb-5 md:hidden">
            <ProductsSearchBar />
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar de filtros */}
            <ProductFilters
              totalResults={total}
              availableCategories={availableCategories}
              mobileOpen={mobileFiltersOpen}
              onMobileClose={() => setMobileFiltersOpen(false)}
            />

            {/* Conteúdo */}
            <div className="min-w-0 flex-1">
              {/* Toolbar topo: filtros mobile + sort */}
              <div className="border-brand-mist mb-5 flex items-center justify-between border-b pb-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="border-brand-mist hover:border-brand-iron inline-flex items-center gap-2 border px-3 py-2 text-sm font-medium transition lg:hidden"
                    style={{ borderRadius: 'var(--radius-edge)' }}
                  >
                    <SlidersHorizontal className="size-4" strokeWidth={2} />
                    Filtros
                  </button>
                  {!loading && (
                    <span className="text-brand-iron hidden font-mono text-xs tracking-widest uppercase md:inline">
                      <span className="text-brand-yellow-deep font-bold">{total}</span>{' '}
                      {total === 1 ? 'produto' : 'produtos'}
                    </span>
                  )}
                </div>
                <ProductSort />
              </div>

              {/* Resultados */}
              {loading ? (
                <ProductGrid products={[]} loading skeletonCount={12} />
              ) : items.length === 0 ? (
                <EmptyState
                  eyebrow="Sem resultados"
                  title="Nenhum produto encontrado"
                  description="Tente ajustar os filtros ou usar termos mais amplos na busca."
                  actions={[
                    { label: 'Limpar filtros', href: '/produtos' },
                    {
                      label: 'Buscar por veículo',
                      href: '/buscar-por-veiculo',
                      variant: 'secondary',
                    },
                  ]}
                />
              ) : (
                <>
                  <ProductGrid products={items} />
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={total}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
