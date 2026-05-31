/* ══════════════════════════════════════════
   HeroCarousel — Original Filter
   ──────────────────────────────────────────
   Carrossel principal da homepage com 4 banners (um por linha de veículo).
   Linhas configuradas: Rodoviária, Máquinas Pesadas, Industrial, Automotivo.
   A ordem real de exibição segue o que vem da API /api/vehicle-selector/lines.
   - Layout 1920×750 (responsivo, mobile: aspect 4/5)
   - Autoplay 6 segundos
   - Imagens de fundo reais por linha (Unsplash, licença comercial)
   - Best practices aplicadas:
     * Gradient overlay direcional esquerda → direita (legibilidade do texto)
     * Vignette inferior (legibilidade dos controles)
     * Camada de cor (tintHex) com blend-mode multiply para identidade visual
     * Ken Burns sutil (zoom 1.0 → 1.05 ao longo do autoplay)
     * Tipografia mantida em Archivo Black, alto contraste
     * Padrões decorativos removidos (foto real substitui)
   - Mobile: imagem ocupa fundo inteiro, gradient cobre todo o slide
   - Cada slide carrega contagem real de produtos via /api/vehicle-selector/brands
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Truck } from 'lucide-react';
import type { VehicleLine, VehicleBrandOption } from '@/lib/search-types';

const AUTOPLAY_MS = 5000;

interface SlideConfig {
  slug: string;
  label: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  description: string;
  /** Cor da camada de tinta sobreposta à imagem (blend multiply) — dá identidade à linha */
  tintHex: string;
  /** Caminho da imagem de fundo em /public/images/hero/ */
  imageSrc: string;
  /** Posição focal da imagem (object-position) — onde está o assunto importante */
  imagePosition: string;
}

/**
 * Configuração editorial de cada slide.
 * Imagens em /public/images/hero/ — formato sugerido: JPEG 1920×1080+, qualidade 80%
 *
 * IMPORTANTE: imageSrc usa basename sem extensão? NÃO — passar caminho completo.
 * Se quiser trocar a foto, é só substituir o arquivo mantendo o nome (ou atualizar imageSrc aqui).
 */
const SLIDE_CONFIGS: Record<string, Omit<SlideConfig, 'slug'>> = {
  rodoviario: {
    label: 'Linha Rodoviária',
    eyebrow: 'Caminhões · Ônibus · Carretas',
    headline: 'Transporte\npesado.',
    subhead: 'Filtros para a frota que move o Brasil.',
    description:
      'Cobertura completa Volvo, Scania, Mercedes-Benz, DAF, Iveco, MAN, Ford, Volkswagen e Agrale.',
    tintHex: '#0F172A', // azul-aço quase preto
    imageSrc: '/images/hero/rodoviario.jpg',
    imagePosition: 'center center',
  },
  'maquinas-pesadas': {
    label: 'Linha Máquinas Pesadas',
    eyebrow: 'Escavadeiras · Pás · Construção',
    headline: 'Obra\nem operação.',
    subhead: 'Filtros para máquinas que enfrentam o impossível.',
    description: 'Caterpillar, Komatsu, JCB, Case Construction e equipamentos fora-de-estrada.',
    tintHex: '#1F1408', // marrom-ocre escuro (terra)
    imageSrc: '/images/hero/maquinas-pesadas.jpg',
    imagePosition: 'center center',
  },
  industrial: {
    label: 'Linha Industrial',
    eyebrow: 'Motores estacionários · Geradores',
    headline: 'Indústria\nem movimento.',
    subhead: 'Filtros para motores estacionários e aplicações industriais.',
    description: 'Cummins, Perkins, MWM, Bosch e motorizações industriais de alta exigência.',
    tintHex: '#1A1A1A', // grafite puro
    imageSrc: '/images/hero/industrial.jpg',
    imagePosition: 'center center',
  },
  automotivo: {
    label: 'Linha Automotiva',
    eyebrow: 'Linha leve · Vans · Pick-ups',
    headline: 'Estrada\ndo dia a dia.',
    subhead: 'Filtros para veículos comerciais leves e utilitários.',
    description: 'Aplicações Mitsubishi, Volkswagen, Ford e demais montadoras da linha leve.',
    tintHex: '#1A0F1F', // roxo-grafite (urbano)
    imageSrc: '/images/hero/automotivo.jpg',
    imagePosition: 'center center',
  },
};

interface HeroCarouselProps {
  /** Linhas vindas do servidor (Server Component) ou null para carregar via fetch */
  initialLines?: VehicleLine[];
}

export function HeroCarousel({ initialLines }: HeroCarouselProps) {
  const [lines, setLines] = useState<VehicleLine[]>(initialLines ?? []);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Carregar linhas se não vier do server
  useEffect(() => {
    if (initialLines && initialLines.length > 0) return;
    fetch('/api/vehicle-selector/lines')
      .then((r) => r.json())
      .then((d: { lines: VehicleLine[] }) => setLines(d.lines ?? []))
      .catch(() => {});
  }, [initialLines]);

  // Para cada linha, buscar contagem de produtos da API de brands
  useEffect(() => {
    if (lines.length === 0) return;
    Promise.all(
      lines.map((line) =>
        fetch(`/api/vehicle-selector/brands?linha=${line.slug}`)
          .then((r) => r.json())
          .then((d: { brands: VehicleBrandOption[] }) => ({
            slug: line.slug,
            total: (d.brands ?? []).reduce((sum, b) => sum + b.productCount, 0),
          }))
          .catch(() => ({ slug: line.slug, total: 0 })),
      ),
    ).then((results) => {
      const map: Record<string, number> = {};
      for (const r of results) map[r.slug] = r.total;
      setProductCounts(map);
    });
  }, [lines]);

  // Construir slides combinando config + dados
  const slides = useMemo<SlideConfig[]>(() => {
    return lines
      .filter((l) => SLIDE_CONFIGS[l.slug])
      .map((l) => ({
        slug: l.slug,
        ...SLIDE_CONFIGS[l.slug],
      }));
  }, [lines]);

  // Autoplay com progresso animado via rAF (mais suave que setInterval)
  useEffect(() => {
    if (isPaused || slides.length === 0) return;

    startTimeRef.current = performance.now();
    setProgress(0);

    function tick(now: number) {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(elapsed / AUTOPLAY_MS, 1);
      setProgress(pct);

      if (pct >= 1) {
        setActive((i) => (i + 1) % slides.length);
        startTimeRef.current = performance.now();
        setProgress(0);
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused, active, slides.length]);

  function goTo(idx: number) {
    setActive(idx);
    setProgress(0);
    startTimeRef.current = performance.now();
  }

  function next() {
    goTo((active + 1) % slides.length);
  }
  function prev() {
    goTo((active - 1 + slides.length) % slides.length);
  }

  if (slides.length === 0) {
    return <HeroSkeleton />;
  }

  const current = slides[active];
  const productCount = productCounts[current.slug] ?? 0;
  const brandCount = lines.find((l) => l.slug === current.slug)?.brandCount ?? 0;

  return (
    <section
      className="bg-brand-black relative w-full overflow-hidden"
      style={{ aspectRatio: '1920 / 750' }}
    >
      {/* Slides empilhados, transição via opacity */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current.slug}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Camada 1: imagem de fundo com Ken Burns sutil */}
          <motion.div
            key={`img-${current.slug}-${active}`}
            initial={{ scale: 1 }}
            animate={{ scale: 1.06 }}
            transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
            className="absolute inset-0"
          >
            <Image
              src={current.imageSrc}
              alt={`${current.label} — Original Filter`}
              fill
              sizes="100vw"
              priority={active === 0}
              className="object-cover"
              style={{ objectPosition: current.imagePosition }}
            />
          </motion.div>

          {/* Camada 2: tinta de identidade da linha (blend multiply para preservar foto) */}
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{
              backgroundColor: current.tintHex,
              opacity: 0.55,
            }}
          />

          {/* Camada 3: gradient escuro do lado esquerdo (legibilidade do texto principal)
              Técnica Netflix: gradient direcional que cobre o lado do texto sem
              esconder a foto inteira */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 80%)',
            }}
          />

          {/* Camada 4: vignette inferior (legibilidade dos controles) */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.65) 100%)',
            }}
          />

          {/* Camada 5: noise sutil para textura industrial (opcional, dá granulação) */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.85'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
            }}
          />

          {/* Conteúdo do slide */}
          <SlideContent slide={current} productCount={productCount} brandCount={brandCount} />
        </motion.div>
      </AnimatePresence>

      {/* Faixa amarela vertical à esquerda (assinatura visual) */}
      <div className="bg-brand-yellow absolute top-0 bottom-0 left-0 z-20 w-1" />

      {/* Controles */}
      <Controls
        active={active}
        total={slides.length}
        slides={slides}
        progress={progress}
        isPaused={isPaused}
        onSelect={goTo}
        onPrev={prev}
        onNext={next}
        onTogglePause={() => setIsPaused((p) => !p)}
      />
    </section>
  );
}

// ══════════════════════════════════════════
//   Conteúdo de um slide
// ══════════════════════════════════════════
function SlideContent({
  slide,
  productCount,
  brandCount,
}: {
  slide: SlideConfig;
  productCount: number;
  brandCount: number;
}) {
  return (
    <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 md:px-12 lg:px-16">
      <div className="max-w-3xl text-white">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-5 flex items-center gap-3"
        >
          <div className="bg-brand-yellow h-px w-8" />
          <span
            className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
          >
            {slide.label}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-display leading-[0.95] font-black tracking-tight whitespace-pre-line"
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            letterSpacing: '-0.04em',
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}
        >
          {slide.headline}
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-5 max-w-xl text-lg font-light text-white/90 md:text-xl"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
        >
          {slide.subhead}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 md:text-base"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
        >
          {slide.description}
        </motion.p>

        {/* Eyebrow técnico */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-7 flex items-center gap-5 font-mono text-xs tracking-widest text-white/85 uppercase"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
        >
          {brandCount > 0 && (
            <>
              <span>
                <span className="text-brand-yellow font-bold">{brandCount}</span> montadoras
              </span>
              <div className="h-3 w-px bg-white/30" />
            </>
          )}
          {productCount > 0 && (
            <span>
              <span className="text-brand-yellow font-bold">{productCount}</span>{' '}
              {productCount === 1 ? 'produto' : 'produtos'}
            </span>
          )}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Link href={`/produtos?linha=${slide.slug}`} className="btn-primary">
            Ver {slide.label.toLowerCase()}
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/buscar-por-veiculo"
            className="font-display inline-flex items-center justify-center gap-2 border border-white/40 bg-white/5 px-6 py-3.5 text-sm font-semibold tracking-wide text-white uppercase backdrop-blur-sm transition hover:bg-white/15"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <Truck className="size-4" strokeWidth={2} />
            Buscar por veículo
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//   Controles (paginação + autoplay)
// ══════════════════════════════════════════
function Controls({
  active,
  total,
  slides,
  progress,
  isPaused,
  onSelect,
  onPrev,
  onNext,
  onTogglePause,
}: {
  active: number;
  total: number;
  slides: SlideConfig[];
  progress: number;
  isPaused: boolean;
  onSelect: (i: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onTogglePause: () => void;
}) {
  return (
    <div className="absolute right-0 bottom-0 left-0 z-20">
      <div className="mx-auto max-w-7xl px-4 pb-6 md:px-12 md:pb-10 lg:px-16">
        <div className="flex items-end justify-between gap-4">
          {/* Dots numerados */}
          <div className="flex flex-wrap items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`Ir para slide ${i + 1}: ${s.label}`}
                className="group relative"
              >
                <div
                  className={`relative overflow-hidden transition-all duration-300 ${
                    active === i ? 'h-1 w-16' : 'h-0.5 w-8 hover:h-1'
                  }`}
                  style={{ background: 'rgba(255,255,255,0.3)' }}
                >
                  {active === i && (
                    <div
                      className="bg-brand-yellow absolute inset-0 origin-left"
                      style={{
                        transform: `scaleX(${progress})`,
                        transformOrigin: 'left',
                      }}
                    />
                  )}
                </div>
              </button>
            ))}
            <div className="ml-4 hidden items-center gap-2 font-mono text-xs tracking-widest text-white/80 md:flex">
              <span className="text-brand-yellow font-bold">
                {String(active + 1).padStart(2, '0')}
              </span>
              <span>/</span>
              <span>{String(total).padStart(2, '0')}</span>
            </div>
          </div>

          {/* Botões de navegação */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onTogglePause}
              aria-label={isPaused ? 'Continuar autoplay' : 'Pausar autoplay'}
              className="p-2.5 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
            <button
              type="button"
              onClick={onPrev}
              aria-label="Slide anterior"
              className="p-2.5 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Próximo slide"
              className="p-2.5 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//   Skeleton enquanto carrega
// ══════════════════════════════════════════
function HeroSkeleton() {
  return (
    <section
      className="bg-brand-black relative w-full overflow-hidden"
      style={{ aspectRatio: '1920 / 750' }}
    >
      <div className="bg-brand-yellow absolute top-0 bottom-0 left-0 w-1" />
      <div className="mx-auto flex h-full max-w-7xl items-center px-4 md:px-12 lg:px-16">
        <div className="w-full max-w-3xl">
          <div className="mb-6 h-3 w-32 animate-pulse bg-white/10" />
          <div className="mb-3 h-20 w-3/4 animate-pulse bg-white/10" />
          <div className="mb-6 h-20 w-1/2 animate-pulse bg-white/10" />
          <div className="h-5 w-2/3 animate-pulse bg-white/10" />
        </div>
      </div>
    </section>
  );
}
