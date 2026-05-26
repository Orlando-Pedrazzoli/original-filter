/* ══════════════════════════════════════════
   /admin/produtos/novo — Criar novo produto
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { ProductFormClient } from '@/components/admin/products/product-form-client';

export const metadata: Metadata = {
  title: 'Novo produto — Admin Original Filter',
  robots: { index: false, follow: false },
};

export default function NewProductPage() {
  return <ProductFormClient />;
}
