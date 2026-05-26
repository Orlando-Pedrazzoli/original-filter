/* ══════════════════════════════════════════
   /admin/marcas/[slug]/editar — Editar marca
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Brand from '@/models/Brand';
import { BrandFormClient, type BrandFormState } from '@/components/admin/brands/brand-form-client';
import type { BrandCategory } from '@/lib/admin-api';

export const metadata: Metadata = {
  title: 'Editar marca — Admin Original Filter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditBrandPage({ params }: PageProps) {
  const { slug } = await params;

  await dbConnect();

  const brand = (await Brand.findOne({ slug }).lean()) as unknown as {
    name?: string;
    slug?: string;
    logo?: string;
    description?: string;
    country?: string;
    category?: BrandCategory;
    displayOrder?: number;
    isActive?: boolean;
  } | null;

  if (!brand) {
    notFound();
  }

  const initial: Partial<BrandFormState> = {
    name: brand.name ?? '',
    slug: brand.slug ?? slug,
    logo: brand.logo ?? '',
    description: brand.description ?? '',
    country: brand.country ?? '',
    category: brand.category ?? 'rodoviario',
    displayOrder: brand.displayOrder ?? 999,
    isActive: brand.isActive ?? true,
  };

  return <BrandFormClient initialBrand={initial} originalSlug={slug} />;
}
