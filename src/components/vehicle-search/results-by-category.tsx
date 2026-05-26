/* ══════════════════════════════════════════
   ResultsByCategory — Original Filter
   ──────────────────────────────────────────
   Agrupa os produtos compatíveis por categoria, com header próprio
   por seção e grid de ProductCards.
   ══════════════════════════════════════════ */

'use client';

import { motion } from 'framer-motion';
import { Wind, Droplets, Fuel, Filter as FilterIcon, Cog, Activity, Wrench } from 'lucide-react';
import { ProductCard, type ProductCardData } from '@/components/products/product-card';

interface ResultsByCategoryProps {
  byCategory: Record<string, ProductCardData[]>;
}

function categoryIcon(slug: string): React.ElementType {
  if (slug.includes('cabine')) return Wind;
  if (slug.includes('ar')) return Wind;
  if (slug.includes('oleo')) return Droplets;
  if (slug.includes('combustivel')) return Fuel;
  if (slug.includes('separador')) return FilterIcon;
  if (slug.includes('hidraulic')) return Cog;
  if (slug.includes('sensor')) return Activity;
  return Wrench;
}

function prettyCategory(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Ordem preferencial das categorias para exibição. */
const CATEGORY_ORDER = [
  'filtro-de-ar',
  'filtro-de-ar-seguranca',
  'filtro-de-oleo',
  'filtro-de-oleo-2',
  'filtro-de-combustivel',
  'filtro-de-combustivel-2',
  'filtro-separador',
  'filtro-hidraulico',
  'filtro-direcao-hidraulica',
  'filtro-de-cabine',
  'filtro-de-cabine-carvao',
  'filtro-secador-de-ar',
  'filtro-de-transmissao',
  'filtro-de-agua',
  'filtro-de-ureia',
  'centrifuga',
  'sensor-nox',
  'sensor-temperatura',
  'sensor-pressao',
];

export function ResultsByCategory({ byCategory }: ResultsByCategoryProps) {
  const entries = Object.entries(byCategory).sort(([a], [b]) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <div className="space-y-12 md:space-y-16">
      {entries.map(([category, products], i) => (
        <CategorySection key={category} category={category} products={products} index={i} />
      ))}
    </div>
  );
}

function CategorySection({
  category,
  products,
  index,
}: {
  category: string;
  products: ProductCardData[];
  index: number;
}) {
  const Icon = categoryIcon(category);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      {/* Header da categoria */}
      <div className="border-brand-mist mb-6 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-brand-black text-brand-yellow flex size-11 shrink-0 items-center justify-center">
            <Icon className="size-5" strokeWidth={2} />
          </div>
          <div>
            <div className="text-brand-iron mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
              Categoria {String(index + 1).padStart(2, '0')}
            </div>
            <h2
              className="font-display text-brand-black leading-tight font-black"
              style={{
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                letterSpacing: '-0.025em',
              }}
            >
              {prettyCategory(category)}
            </h2>
          </div>
        </div>
        <div className="text-brand-iron font-mono text-xs tracking-widest uppercase">
          <span className="text-brand-yellow-deep text-base font-bold">{products.length}</span>{' '}
          {products.length === 1 ? 'produto' : 'produtos'}
        </div>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.sku} product={p} />
        ))}
      </div>
    </motion.section>
  );
}
