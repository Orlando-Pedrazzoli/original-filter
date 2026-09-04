// src/app/(site)/page.tsx
/* ══════════════════════════════════════════
   Homepage — Original Filter
   ──────────────────────────────────────────
   Reformulada (set/2026) com foco em referências cruzadas
   e aplicações — pedido do Gabriel, benchmark Showlub:
   1. Hero Search (busca-primeiro, fundo preto contínuo com o navbar)
   3. Product Lines (cards das linhas)
   4. Equivalence Brands (top marcas substituídas, dados reais)
   5. Brands Carousel (montadoras atendidas)
   6. Trust Section (institucional — Centro P&D, Cotia-SP)
   7. Reseller CTA (Seja Revendedor)
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { HeroSearch } from '@/components/home/hero-search';
import { ProductLines } from '@/components/home/product-lines';
import { EquivalenceBrands } from '@/components/home/equivalence-brands';
import { BrandsCarousel } from '@/components/home/brands-carousel';
import { TrustSection } from '@/components/home/trust-section';
import { ResellerCTA } from '@/components/home/reseller-cta';

export const metadata: Metadata = {
  title: 'Original Filter — Qualidade Superior em Filtros Automotivos e Sensores',
  description:
    'Busque por qualquer código — Original Filter, do concorrente ou original da montadora — ' +
    'e encontre o filtro equivalente. Mais de 7.000 referências cruzadas de 200+ marcas: ' +
    'MANN, Fleetguard, Donaldson, Tecfil, Wega, Parker e as principais montadoras.',
};

export default function HomePage() {
  return (
    <>
      <HeroSearch />
      <ProductLines />
      <EquivalenceBrands />
      <BrandsCarousel />
      <TrustSection />
      <ResellerCTA />
    </>
  );
}
