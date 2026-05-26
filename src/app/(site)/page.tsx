/* ══════════════════════════════════════════
   Homepage — Original Filter
   ──────────────────────────────────────────
   Estrutura completa em 8 seções:
   1. Hero Carousel (5 banners por linha, autoplay 6s)
   2. Stats Band (KPIs do catálogo)
   3. Product Lines (cards das 5 linhas)
   4. Featured Patented (linha patenteada — diferencial)
   5. Brands Carousel (22 montadoras)
   6. Cross-Reference Banner (conversor de filtros)
   7. Trust Section (institucional — Centro P&D, Cotia-SP)
   8. Reseller CTA (Seja Revendedor)
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { StatsBand } from '@/components/home/stats-band';
import { ProductLines } from '@/components/home/product-lines';
import { FeaturedPatented } from '@/components/home/featured-patented';
import { BrandsCarousel } from '@/components/home/brands-carousel';
import { CrossReferenceBanner } from '@/components/home/cross-reference-banner';
import { TrustSection } from '@/components/home/trust-section';
import { ResellerCTA } from '@/components/home/reseller-cta';

export const metadata: Metadata = {
  title: 'Original Filter — Qualidade Superior em Filtros Automotivos e Sensores',
  description:
    'Especialista em filtros automotivos, agrícolas, industriais e fora-de-estrada. ' +
    'Linha completa de reposição para Volvo, Scania, Mercedes-Benz, DAF, Caterpillar, ' +
    'John Deere e mais 16 montadoras. Centro de Pesquisa & Desenvolvimento próprio.',
};

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <StatsBand />
      <ProductLines />
      <FeaturedPatented />
      <BrandsCarousel />
      <CrossReferenceBanner />
      <TrustSection />
      <ResellerCTA />
    </>
  );
}
