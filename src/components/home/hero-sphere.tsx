'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, ChevronDown } from 'lucide-react';
import { BRAND, CERTIFICATIONS } from '@/lib/constants';

const CONFIG = {
  primaryColor: '255, 215, 0',
  secondaryColor: '230, 194, 0',
  wireframeOpacity: 0.4,
  wireframeShadowIntensity: 30,
  coreBlur: 150,
  parallaxDepth: 20,
  lerpFactor: 0.06,
  sphereDensity: 12,
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SPHERE_CSS = `
  .hero-sphere-line {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(${CONFIG.primaryColor}, ${CONFIG.wireframeOpacity});
    box-shadow: 0 0 ${CONFIG.wireframeShadowIntensity}px rgba(${CONFIG.primaryColor}, 0.1),
                inset 0 0 ${CONFIG.wireframeShadowIntensity}px rgba(${CONFIG.primaryColor}, 0.03);
  }
  @keyframes sphereRotate {
    from { transform: rotateY(0deg) rotateX(0deg); }
    to { transform: rotateY(360deg) rotateX(180deg); }
  }
  .hero-sphere-rotation {
    animation: sphereRotate 240s linear infinite;
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  @keyframes corePulse {
    0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
  }
  .hero-core-light {
    animation: corePulse 25s ease-in-out infinite;
  }
  @keyframes gridPan {
    from { background-position: 0 0; }
    to { background-position: 40px 40px; }
  }
  .hero-panning-grid {
    animation: gridPan 180s linear infinite;
  }
`;

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
    <section className="bg-dark relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: SPHERE_CSS }} />

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
          backgroundImage: `radial-gradient(circle at 50% 45%, rgba(${CONFIG.primaryColor}, 0.06) 0%, transparent 50%)`,
          filter: 'blur(120px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 2: Deep Base + Core Glow */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(${smoothX * depth}px, ${smoothY * depth}px, 0)`,
          backgroundImage: `radial-gradient(at 50% 45%, rgba(${CONFIG.primaryColor}, 0.04) 0%, #000000 85%)`,
        }}
      >
        <div
          className="hero-core-light pointer-events-none absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '350px',
            height: '350px',
            backgroundImage: `radial-gradient(circle, rgba(${CONFIG.primaryColor}, 0.2) 0%, transparent 70%)`,
            filter: `blur(${CONFIG.coreBlur}px)`,
          }}
        />
      </div>

      {/* Layer 3: Wireframe Sphere — smaller, centered, subtle */}
      <div className="pointer-events-none absolute top-[45%] left-1/2 z-[5] -translate-x-1/2 -translate-y-1/2 opacity-60">
        <div
          className="hero-sphere-rotation h-[380px] w-[380px] sm:h-[440px] sm:w-[440px] md:h-[500px] md:w-[500px]"
          style={{
            transform: `rotateX(${smoothY * 4}deg) rotateY(${-smoothX * 4}deg)`,
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
          backgroundImage: `radial-gradient(circle at 50% 45%, rgba(${CONFIG.primaryColor}, 0.12) 0%, transparent 45%)`,
          mixBlendMode: 'screen',
          filter: 'blur(80px)',
          opacity: 0.7,
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

      {/* Layer 6: Hero Content — above sphere */}
      <div className="relative z-20 mx-auto max-w-3xl px-6 pt-16 text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/images/logo-originalfilter.png"
            alt="Original Filter"
            width={160}
            height={64}
            className="h-12 sm:h-14 md:h-16"
            style={{ width: 'auto' }}
            priority
          />
        </div>

        {/* Slogan */}
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          <span className="block">{BRAND.slogan.split(' ')[0]}</span>
          <span className="from-brand via-brand-light to-brand block bg-gradient-to-r bg-clip-text text-transparent">
            {BRAND.slogan.split(' ').slice(1).join(' ')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-5 max-w-xl text-sm text-gray-400 sm:text-base md:text-lg">
          Especialistas em filtros automotivos, agrícolas e industriais. Qualidade certificada
          internacionalmente para proteger o que move o seu negócio.
        </p>

        {/* Certifications */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {CERTIFICATIONS.map((cert) => (
            <span
              key={cert}
              className="border-brand/25 bg-brand/5 text-brand/80 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-wider uppercase"
            >
              {cert}
            </span>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mx-auto mt-8 max-w-lg">
          <div className="group relative">
            <Search className="group-focus-within:text-brand absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-gray-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar por código, montadora ou tipo de filtro..."
              className="focus:border-brand/50 focus:ring-brand/20 h-12 w-full rounded-xl border border-white/10 bg-white/5 pr-28 pl-11 text-sm text-white backdrop-blur-sm transition-all outline-none placeholder:text-gray-500 focus:bg-white/10 focus:ring-2"
            />
            <Link
              href="/produtos"
              className="bg-brand text-dark hover:bg-brand-hover hover:shadow-brand/25 absolute top-1/2 right-1.5 -translate-y-1/2 rounded-lg px-4 py-2 text-xs font-bold transition-all hover:shadow-lg"
            >
              Buscar
            </Link>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/produtos"
            className="group bg-brand text-dark hover:bg-brand-hover hover:shadow-brand/25 inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold transition-all hover:shadow-lg"
          >
            Ver Catálogo Completo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/contato"
            className="hover:border-brand/30 inline-flex items-center gap-2 rounded-xl border border-white/15 px-7 py-3 text-sm font-medium text-white transition-all hover:bg-white/5"
          >
            Solicitar Orçamento
          </Link>
        </div>
      </div>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-brand/50 h-5 w-5" />
      </div>
    </section>
  );
}
