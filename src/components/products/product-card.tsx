/* ══════════════════════════════════════════
   ProductCard — Original Filter
   ──────────────────────────────────────────
   Card industrial para listagem de produtos.
   - Fundo branco, sem cantos arredondados (radius-edge: 2px)
   - SKU em mono amarelo
   - Badges discretos: PATENTEADO (amarelo), LANÇAMENTO (preto), DESCONTINUADO (cinza)
   - Hover: faixa amarela vertical aparece à esquerda + imagem com scale leve
   - Preço só aparece quando > 0 ("Sob consulta" caso contrário)
   ══════════════════════════════════════════ */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Zap, Archive, ImageOff } from 'lucide-react';
import { formatBRL, cleanProductTitle } from '@/utils/format';

export interface ProductCardData {
  sku: string;
  slug: string;
  title: string;
  category: string;
  productType: string;
  primaryImage: string | null;
  retailPrice: number;
  finalPrice: number;
  discountTier: number;
  isPatented: boolean;
  isNewRelease: boolean;
  status: string;
  applicationsCount: number;
}

interface ProductCardProps {
  product: ProductCardData;
  /** "compact" reduz padding e tipografia para grids densos */
  variant?: 'default' | 'compact';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const isDiscontinued = product.status === 'discontinued';
  const hasDiscount = product.discountTier > 0 && product.finalPrice < product.retailPrice;
  const cleanTitle = cleanProductTitle(product.title, product.sku);
  const compact = variant === 'compact';

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className={`group bg-brand-white border-brand-mist hover:border-brand-iron relative block overflow-hidden border transition-all ${
        isDiscontinued ? 'opacity-70' : ''
      }`}
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {/* Faixa amarela vertical (aparece no hover) */}
      <div className="bg-brand-yellow absolute top-0 bottom-0 left-0 z-10 w-1 origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />

      {/* Badges no topo */}
      <div className="absolute top-3 right-3 left-3 z-10 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {product.isPatented && (
            <Badge variant="yellow" icon={<Sparkles className="size-2.5" strokeWidth={2.5} />}>
              Patenteado
            </Badge>
          )}
          {product.isNewRelease && !product.isPatented && (
            <Badge variant="black" icon={<Zap className="size-2.5" strokeWidth={2.5} />}>
              Lançamento
            </Badge>
          )}
          {isDiscontinued && (
            <Badge variant="gray" icon={<Archive className="size-2.5" strokeWidth={2.5} />}>
              Descontinuado
            </Badge>
          )}
        </div>
      </div>

      {/* Imagem */}
      <div
        className={`bg-brand-snow relative flex items-center justify-center ${
          compact ? 'aspect-square' : 'aspect-[4/3]'
        }`}
      >
        {product.primaryImage ? (
          <Image
            src={product.primaryImage}
            alt={cleanTitle || product.sku}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="text-brand-mist flex flex-col items-center justify-center gap-2 p-6">
            <ImageOff className="size-8" strokeWidth={1.25} />
            <div className="font-mono text-[10px] tracking-widest uppercase">Imagem em breve</div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className={`${compact ? 'p-3' : 'p-4 md:p-5'} border-brand-mist border-t`}>
        {/* SKU + categoria */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-brand-yellow-deep truncate font-mono text-xs font-bold tracking-wider">
            {product.sku}
          </div>
          <div className="text-brand-steel shrink-0 font-mono text-[10px] tracking-widest uppercase">
            {product.productType === 'sensor'
              ? 'Sensor'
              : product.productType === 'accessory'
                ? 'Acess.'
                : 'Filtro'}
          </div>
        </div>

        {/* Título */}
        <div
          className={`font-display text-brand-black line-clamp-2 leading-snug font-semibold ${
            compact ? 'text-sm' : 'text-sm md:text-[15px]'
          }`}
        >
          {cleanTitle || product.title}
        </div>

        {/* Categoria */}
        <div className="text-brand-steel mt-1 truncate text-xs">
          {product.category.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
        </div>

        {/* Aplicações */}
        {product.applicationsCount > 0 && (
          <div className="text-brand-iron mt-2 font-mono text-[10px] tracking-widest uppercase">
            <span className="text-brand-yellow-deep font-bold">{product.applicationsCount}</span>{' '}
            {product.applicationsCount === 1 ? 'aplicação' : 'aplicações'}
          </div>
        )}

        {/* Preço */}
        <div className="border-brand-mist mt-3 border-t pt-3">
          {product.retailPrice > 0 ? (
            <div className="flex items-baseline justify-between gap-2">
              <div>
                {hasDiscount && (
                  <div className="text-brand-steel font-mono text-[10px] line-through">
                    {formatBRL(product.retailPrice)}
                  </div>
                )}
                <div
                  className={`font-display text-brand-black font-black tracking-tight ${
                    compact ? 'text-base' : 'text-lg md:text-xl'
                  }`}
                >
                  {formatBRL(product.finalPrice)}
                </div>
              </div>
              {hasDiscount && (
                <div className="bg-brand-yellow text-brand-black inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider">
                  -{product.discountTier}%
                </div>
              )}
            </div>
          ) : (
            <div className="text-brand-steel font-mono text-xs tracking-widest uppercase">
              Sob consulta
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Badge interno ───
function Badge({
  variant,
  icon,
  children,
}: {
  variant: 'yellow' | 'black' | 'gray';
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const classes =
    variant === 'yellow'
      ? 'bg-brand-yellow text-brand-black'
      : variant === 'black'
        ? 'bg-brand-black text-brand-yellow'
        : 'bg-brand-snow text-brand-iron border border-brand-mist';

  return (
    <div
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 ${classes}`}
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {icon}
      <span className="font-mono text-[9px] font-bold tracking-widest uppercase">{children}</span>
    </div>
  );
}
