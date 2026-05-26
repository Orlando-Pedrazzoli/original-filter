/* ══════════════════════════════════════════
   BrandCard — Original Filter
   ──────────────────────────────────────────
   Card de marca usado em listas e grids.
   Mostra: logo, nome, contagem de produtos, categoria.
   ══════════════════════════════════════════ */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, ImageOff } from 'lucide-react';

export interface BrandCardData {
  slug: string;
  name: string;
  logo: string;
  country?: string;
  productsCount: number;
}

interface BrandCardProps {
  brand: BrandCardData;
  index?: number;
}

export function BrandCard({ brand, index = 0 }: BrandCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
    >
      <Link
        href={`/produtos/marca/${brand.slug}`}
        className="group bg-brand-white border-brand-mist hover:border-brand-iron hover:bg-brand-snow relative block h-full border p-5 transition-all"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        {/* Faixa amarela vertical no hover */}
        <div className="bg-brand-yellow absolute top-0 bottom-0 left-0 w-1 origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />

        <div className="flex h-full flex-col pl-3">
          {/* Logo */}
          <div className="bg-brand-snow border-brand-mist group-hover:border-brand-iron relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden border transition-colors">
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <ImageOff className="text-brand-mist size-8" strokeWidth={1.25} />
            )}
          </div>

          {/* Nome + arrow */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3
              className="font-display text-brand-black leading-tight font-black"
              style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                letterSpacing: '-0.02em',
              }}
            >
              {brand.name}
            </h3>
            <ArrowUpRight
              className="text-brand-mist group-hover:text-brand-yellow-deep size-4 shrink-0 transition"
              strokeWidth={2}
            />
          </div>

          {/* Contagem de produtos */}
          <div className="border-brand-mist mt-auto flex items-baseline justify-between gap-2 border-t pt-3 font-mono text-[10px] tracking-widest uppercase">
            <span className="text-brand-iron">
              {brand.productsCount > 0 ? (
                <>
                  <span className="text-brand-black font-bold">{brand.productsCount}</span>{' '}
                  {brand.productsCount === 1 ? 'produto' : 'produtos'}
                </>
              ) : (
                'Em breve'
              )}
            </span>
            {brand.country && (
              <span className="text-brand-steel max-w-[60%] truncate">{brand.country}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
