'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, ChevronDown } from 'lucide-react';
import { BRAND, CERTIFICATIONS } from '@/lib/constants';

/* ══════════════════════════════════════════
   Original Filter — Geometric Sphere Hero
   Adapted from shadcn geometric-sphere
   Brand: Yellow (#FFD700) / Black / White
   ══════════════════════════════════════════ */

const CONFIG = {
  // Brand Colors (RGB)
  primaryColor: '255, 215, 0', // Brand yellow
  secondaryColor: '230, 194, 0', // Brand yellow dark
  accentColor: '255, 255, 255', // White accents

  // Animation
  sphereRotationDuration: '200s',
  gridPanDuration: '180s',
  coreGlowDuration: '25s',

  // Intensity
  wireframeOpacity: 0.6,
  wireframeShadowIntensity: 50,
  coreBlur: 180,
  parallaxDepth: 30,
  lerpFactor: 0.06,
  sphereDensity: 14,
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function HeroSphere() {
  const [targetMousePos, setTargetMousePos] = useState({ x: 0, y: 0 });
  const currentMousePos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  const animateLerp = useCallback(() => {
    currentMousePos.current.x = lerp(
      currentMousePos.current.x,
      targetMousePos.x,
      CONFIG.lerpFactor,
    );
    currentMousePos.current.y = lerp(
      currentMousePos.current.y,
      targetMousePos.y,
      CONFIG.lerpFactor,
    );

    setTargetMousePos(() => ({
      x: currentMousePos.current.x,
      y: currentMousePos.current.y,
    }));

    animationFrameRef.current = requestAnimationFrame(animateLerp);
  }, [targetMousePos.x, targetMousePos.y]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateLerp);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [animateLerp]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setTargetMousePos({
      x: (e.clientX - centerX) / centerX,
      y: (e.clientY - centerY) / centerY,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const { x: smoothX, y: smoothY } = currentMousePos.current;
  const depth = CONFIG.parallaxDepth;

  const sphereRings = Array.from({ length: CONFIG.sphereDensity }, (_, i) => {
    const step = 90 / (CONFIG.sphereDensity / 2);
    const angle = i * step;
    return (
      <div
        key={i}
        className="hero-sphere-line"
        style={{
          transform: i % 2 === 0 ? `rotateY(${angle}deg)` : `rotateX(${angle}deg)`,
        }}
        aria-hidden="true"
      />
    );
  });

  return (
    <section className="bg-dark relative flex h-screen w-full items-center justify-center overflow-hidden">
      {/* ── CSS for sphere animations ── */}
      <style jsx>{`
        .hero-sphere-line {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(${CONFIG.primaryColor}, ${CONFIG.wireframeOpacity});
          box-shadow:
            0 0 ${CONFIG.wireframeShadowIntensity}px rgba(${CONFIG.primaryColor}, 0.15),
            inset 0 0 ${CONFIG.wireframeShadowIntensity}px rgba(${CONFIG.primaryColor}, 0.05);
        }

        @keyframes sphereRotate {
          from {
            transform: rotateY(0deg) rotateX(0deg);
          }
          to {
            transform: rotateY(360deg) rotateX(180deg);
          }
        }

        .hero-sphere-rotation {
          animation: sphereRotate ${CONFIG.sphereRotationDuration} linear infinite;
          transform-style: preserve-3d;
          perspective: 1000px;
        }

        @keyframes corePulse {
          0%,
          100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }

        .hero-core-light {
          animation: corePulse ${CONFIG.coreGlowDuration} ease-in-out infinite;
        }

        @keyframes gridPan {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 40px 40px;
          }
        }

        .hero-panning-grid {
          animation: gridPan ${CONFIG.gridPanDuration} linear infinite;
        }
      `}</style>

      {/* Layer 0: Panning Grid */}
      <div
        className="hero-panning-grid absolute inset-0"
        style={{
          transform: `translate3d(${-smoothX * (depth / 2)}px, ${-smoothY * (depth / 2)}px, 0)`,
          backgroundImage:
            'repeating-linear-gradient(to right, rgba(255,215,0,0.03) 1px, transparent 1px), repeating-linear-gradient(to bottom, rgba(255,215,0,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Layer 1: Volumetric Haze */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(${smoothX * (depth / 2)}px, ${smoothY * (depth / 2)}px, 0)`,
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(${CONFIG.primaryColor}, 0.08) 0%, transparent 50%)`,
          filter: 'blur(150px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 2: Deep Base + Core Glow */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(${smoothX * depth}px, ${smoothY * depth}px, 0)`,
          backgroundImage: `radial-gradient(at 50% 50%, rgba(${CONFIG.primaryColor}, 0.05) 0%, #000000 90%)`,
        }}
      >
        <div
          className="hero-core-light pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '400px',
            height: '400px',
            backgroundImage: `radial-gradient(circle, rgba(${CONFIG.primaryColor}, 0.3) 0%, transparent 70%)`,
            filter: `blur(${CONFIG.coreBlur}px)`,
          }}
        />
      </div>

      {/* Layer 3: Wireframe Sphere */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div
          className="hero-sphere-rotation h-[600px] w-[600px] md:h-[700px] md:w-[700px]"
          style={{
            transform: `rotateX(${smoothY * 5}deg) rotateY(${-smoothX * 5}deg)`,
            transformOrigin: 'center center',
          }}
        >
          {sphereRings}
        </div>
      </div>

      {/* Layer 4: Bloom */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(${smoothX * depth}px, ${smoothY * depth}px, 0)`,
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(${CONFIG.primaryColor}, 0.2) 0%, transparent 50%)`,
          mixBlendMode: 'screen',
          filter: 'blur(100px)',
          opacity: 0.8,
        }}
      />

      {/* Layer 5: Noise Texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Layer 6: Hero Content */}
      <div className="relative z-20 mx-auto max-w-4xl px-6 text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logo-originalfilter.png"
            alt="Original Filter"
            width={180}
            height={72}
            className="h-16 w-auto md:h-20"
            priority
          />
        </div>

        {/* Slogan */}
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="block">{BRAND.slogan.split(' ')[0]}</span>
          <span className="from-brand via-brand-light to-brand block bg-gradient-to-r bg-clip-text text-transparent">
            {BRAND.slogan.split(' ').slice(1).join(' ')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-gray-400 sm:text-lg md:text-xl">
          Especialistas em filtros automotivos, agrícolas e industriais. Qualidade certificada
          internacionalmente para proteger o que move o seu negócio.
        </p>

        {/* Certifications */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {CERTIFICATIONS.map((cert) => (
            <span
              key={cert}
              className="border-brand/30 bg-brand/10 text-brand rounded-full border px-3 py-1 text-xs font-semibold tracking-wider"
            >
              {cert}
            </span>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mx-auto mt-10 max-w-xl">
          <div className="group relative">
            <Search className="group-focus-within:text-brand absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar por código, montadora ou tipo de filtro..."
              className="focus:border-brand/50 focus:ring-brand/20 h-14 w-full rounded-2xl border border-white/10 bg-white/5 pr-32 pl-12 text-sm text-white backdrop-blur-sm transition-all outline-none placeholder:text-gray-500 focus:bg-white/10 focus:ring-2"
            />
            <Link
              href="/produtos"
              className="bg-brand text-dark hover:bg-brand-hover hover:shadow-brand/25 absolute top-1/2 right-2 -translate-y-1/2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:shadow-lg"
            >
              Buscar
            </Link>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/produtos"
            className="group bg-brand text-dark hover:bg-brand-hover hover:shadow-brand/25 inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold transition-all hover:shadow-lg"
          >
            Ver Catálogo Completo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/contato"
            className="hover:border-brand/40 inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/5"
          >
            Solicitar Orçamento
          </Link>
        </div>
      </div>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-brand/60 h-6 w-6" />
      </div>
    </section>
  );
}
