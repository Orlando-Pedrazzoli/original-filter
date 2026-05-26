/* ══════════════════════════════════════════
   ProductGallery — Original Filter
   ──────────────────────────────────────────
   Galeria com imagem grande + thumbnails embaixo.
   - Click no thumbnail troca a imagem grande
   - Click na imagem grande abre lightbox simples
   - Estado vazio elegante quando não tem imagem
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageOff, X, ZoomIn } from 'lucide-react';

interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  sku: string;
}

export function ProductGallery({ images, productName, sku }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(() => {
    const primaryIdx = images.findIndex((img) => img.isPrimary);
    return primaryIdx >= 0 ? primaryIdx : 0;
  });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Sem imagens — estado vazio elegante
  if (images.length === 0) {
    return (
      <div
        className="bg-brand-snow border-brand-mist text-brand-steel relative flex aspect-square flex-col items-center justify-center gap-3 border"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        <ImageOff className="size-12" strokeWidth={1.25} />
        <div className="text-center">
          <div className="text-brand-iron mb-1 font-mono text-[11px] tracking-[0.22em] uppercase">
            Imagem em breve
          </div>
          <div className="text-brand-steel font-mono text-xs">{sku}</div>
        </div>
      </div>
    );
  }

  const activeImage = images[activeIdx];

  return (
    <div className="space-y-3">
      {/* Imagem principal */}
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group bg-brand-snow border-brand-mist hover:border-brand-iron relative aspect-square w-full cursor-zoom-in overflow-hidden border transition"
        style={{ borderRadius: 'var(--radius-edge)' }}
        aria-label="Ampliar imagem"
      >
        <Image
          src={activeImage.url}
          alt={activeImage.alt || productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-8 transition-transform duration-500 group-hover:scale-[1.02]"
          priority
        />
        {/* Indicador de zoom no hover */}
        <div className="bg-brand-black/70 absolute top-3 right-3 flex size-9 items-center justify-center text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
          <ZoomIn className="size-4" strokeWidth={2} />
        </div>
        {/* Faixa amarela vertical à esquerda */}
        <div className="bg-brand-yellow absolute top-0 bottom-0 left-0 w-1" />
      </button>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`bg-brand-snow relative aspect-square overflow-hidden border transition ${
                i === activeIdx
                  ? 'border-brand-yellow border-2'
                  : 'border-brand-mist hover:border-brand-iron'
              }`}
              style={{ borderRadius: 'var(--radius-edge)' }}
              aria-label={`Ver imagem ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} ${i + 1}`}
                fill
                sizes="120px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-brand-black/95 fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 flex size-10 items-center justify-center bg-white/10 text-white transition hover:bg-white/20"
              style={{ borderRadius: 'var(--radius-edge)' }}
              aria-label="Fechar lightbox"
            >
              <X className="size-5" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative aspect-square w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeImage.url}
                alt={activeImage.alt || productName}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>

            {/* Caption */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
              <div className="text-brand-yellow font-mono text-sm tracking-wider">{sku}</div>
              <div className="mt-1 text-xs text-white/60">{productName}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
