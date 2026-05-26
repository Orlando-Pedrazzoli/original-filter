/* ══════════════════════════════════════════
   /admin/marcas/nova — Criar nova marca
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { BrandFormClient } from '@/components/admin/brands/brand-form-client';

export const metadata: Metadata = {
  title: 'Nova marca — Admin Original Filter',
  robots: { index: false, follow: false },
};

export default function NewBrandPage() {
  return <BrandFormClient />;
}
