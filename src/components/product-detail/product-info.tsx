/* ══════════════════════════════════════════
   ProductInfo — Original Filter
   ──────────────────────────────────────────
   Coluna direita do detalhe do produto:
   - SKU em destaque (mono amarelo)
   - Badges (Patenteado, Lançamento, Descontinuado)
   - Título grande
   - Descrição curta
   - Preço (com desconto B2B se aplicável) ou "Sob consulta"
   - CTAs: Adicionar ao carrinho / Solicitar cotação
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  Archive,
  ShoppingCart,
  MessageSquare,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { formatBRL, cleanProductTitle, productTypeLabel } from '@/utils/format';

interface ProductInfoProps {
  sku: string;
  title: string;
  shortDescription?: string;
  description: string;
  category: string;
  productType: string;
  retailPrice: number;
  finalPrice: number;
  appliedDiscountTier: number;
  appliedRole: string;
  status: string;
  isPatented: boolean;
  isNewRelease: boolean;
  replacedBy?: {
    sku: string;
    slug: string;
    title: string;
  } | null;
  applicationsCount: number;
}

export function ProductInfo({
  sku,
  title,
  shortDescription,
  category,
  productType,
  retailPrice,
  finalPrice,
  appliedDiscountTier,
  appliedRole,
  status,
  isPatented,
  isNewRelease,
  replacedBy,
  applicationsCount,
}: ProductInfoProps) {
  const isDiscontinued = status === 'discontinued';
  const hasDiscount = appliedDiscountTier > 0 && finalPrice < retailPrice;
  const cleanTitle = cleanProductTitle(title, sku);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="space-y-6">
      {/* Header: SKU + badges */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {isPatented && (
            <Badge variant="yellow" icon={<Sparkles className="size-3" strokeWidth={2.5} />}>
              Linha Patenteada
            </Badge>
          )}
          {isNewRelease && (
            <Badge variant="black" icon={<Zap className="size-3" strokeWidth={2.5} />}>
              Lançamento
            </Badge>
          )}
          {isDiscontinued && (
            <Badge variant="gray" icon={<Archive className="size-3" strokeWidth={2.5} />}>
              Descontinuado
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-brand-yellow-deep font-mono text-lg font-bold tracking-wider md:text-xl">
            {sku}
          </div>
          <div className="bg-brand-mist h-4 w-px" />
          <div className="text-brand-iron font-mono text-[10px] tracking-[0.22em] uppercase">
            {productTypeLabel(productType)} · {category.replace(/-/g, ' ')}
          </div>
        </div>
      </div>

      {/* Título */}
      <h1
        className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
        style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          letterSpacing: '-0.025em',
        }}
      >
        {cleanTitle || title}
      </h1>

      {/* Descrição curta */}
      {shortDescription && (
        <p className="text-brand-iron max-w-prose text-base leading-relaxed">{shortDescription}</p>
      )}

      {/* Aviso de descontinuado com substituto */}
      {isDiscontinued && replacedBy && (
        <div
          className="of-mark bg-brand-snow border-brand-mist border p-4"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <div className="text-brand-iron mb-1 font-mono text-[10px] tracking-[0.22em] uppercase">
            Produto descontinuado
          </div>
          <div className="text-brand-black text-sm">
            Foi substituído por{' '}
            <Link
              href={`/produtos/${replacedBy.slug}`}
              className="text-brand-yellow-deep font-mono font-bold hover:underline"
            >
              {replacedBy.sku}
            </Link>
            .
          </div>
        </div>
      )}

      {/* Indicador de aplicações */}
      {applicationsCount > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Check className="text-brand-yellow-deep size-4" strokeWidth={2.5} />
          <span className="text-brand-iron">
            Compatível com{' '}
            <span className="text-brand-black font-mono font-bold">{applicationsCount}</span>{' '}
            {applicationsCount === 1 ? 'aplicação' : 'aplicações'}
          </span>
        </div>
      )}

      {/* Preço */}
      <div
        className="bg-brand-snow border-brand-mist border p-5 md:p-6"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        {retailPrice > 0 ? (
          <div>
            {appliedRole === 'reseller' && (
              <div className="text-brand-yellow-deep mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
                Preço de revendedor · {appliedDiscountTier}% off
              </div>
            )}
            <div className="flex flex-wrap items-baseline gap-3">
              {hasDiscount && (
                <span className="text-brand-steel font-mono text-base line-through">
                  {formatBRL(retailPrice)}
                </span>
              )}
              <span
                className="font-display text-brand-black font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                {formatBRL(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="bg-brand-yellow text-brand-black inline-flex items-center px-2 py-1 font-mono text-xs font-bold tracking-wider">
                  -{appliedDiscountTier}%
                </span>
              )}
            </div>
            <div className="text-brand-steel mt-2 text-xs">
              Em até <span className="text-brand-iron font-bold">12x sem juros</span> no cartão
            </div>
          </div>
        ) : (
          <div>
            <div className="text-brand-yellow-deep mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
              Preço sob consulta
            </div>
            <div
              className="font-display text-brand-black leading-tight font-bold"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)' }}
            >
              Solicite seu orçamento personalizado
            </div>
            <div className="text-brand-iron mt-2 text-sm">
              Atendimento direto da equipe Original Filter para distribuidores, oficinas e
              frotistas.
            </div>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        {!isDiscontinued && retailPrice > 0 ? (
          <>
            {/* Quantidade + Adicionar */}
            <div className="flex gap-3">
              <div className="border-brand-mist flex items-center border bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-brand-iron hover:text-brand-black flex size-12 items-center justify-center transition disabled:opacity-30"
                  disabled={quantity <= 1}
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="border-brand-mist focus:bg-brand-snow h-12 w-14 border-x text-center font-mono font-bold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(999, q + 1))}
                  className="text-brand-iron hover:text-brand-black flex size-12 items-center justify-center transition"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <button type="button" className="btn-primary flex-1">
                <ShoppingCart className="size-4" />
                Adicionar ao carrinho
              </button>
            </div>
            <Link
              href={`/contato?produto=${encodeURIComponent(sku)}`}
              className="btn-secondary w-full"
            >
              <MessageSquare className="size-4" />
              Solicitar cotação personalizada
            </Link>
          </>
        ) : (
          <>
            <Link
              href={`/contato?produto=${encodeURIComponent(sku)}`}
              className="btn-primary w-full"
            >
              <MessageSquare className="size-4" />
              Solicitar cotação
            </Link>
            <Link href="/contato" className="btn-secondary w-full">
              Falar com comercial
            </Link>
          </>
        )}
      </div>

      {/* Footer técnico */}
      <div className="border-brand-mist text-brand-steel space-y-1.5 border-t pt-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest uppercase">SKU:</span>
          <span className="text-brand-iron font-mono">{sku}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest uppercase">Categoria:</span>
          <Link
            href={`/produtos?categoria=${category}`}
            className="text-brand-iron hover:text-brand-yellow-deep transition"
          >
            {category.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
          </Link>
        </div>
      </div>
    </div>
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
      className={`inline-flex items-center gap-1.5 px-2 py-1 ${classes}`}
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {icon}
      <span className="font-mono text-[10px] font-bold tracking-widest uppercase">{children}</span>
    </div>
  );
}
