/* ══════════════════════════════════════════
   /admin/produtos/[slug]/editar — Editar produto
   ══════════════════════════════════════════ */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { ProductFormClient } from '@/components/admin/products/product-form-client';
import type { ProductFormState } from '@/components/admin/products/product-form-types';

export const metadata: Metadata = {
  title: 'Editar produto — Admin Original Filter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { slug } = await params;

  await dbConnect();

  const product = (await Product.findOne({ slug }).lean()) as unknown as {
    sku?: string;
    slug?: string;
    title?: string;
    productType?: ProductFormState['productType'];
    category?: string;
    description?: string;
    shortDescription?: string;
    retailPrice?: number;
    stock?: number;
    lowStockThreshold?: number;
    manageStock?: boolean;
    weight?: number;
    dimensions?: { height?: number; width?: number; depth?: number };
    applications?: Array<{
      brand: string;
      model: string;
      engine?: string;
      yearStart?: number;
      yearEnd?: number;
    }>;
    oemCodes?: string[];
    status?: ProductFormState['status'];
    isNewRelease?: boolean;
    isPatented?: boolean;
    isFeatured?: boolean;
    images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
    seo?: { title?: string; description?: string; keywords?: string[] };
  } | null;

  if (!product) {
    notFound();
  }

  // Converte para formato do form
  const initial: Partial<ProductFormState> = {
    sku: product.sku ?? '',
    slug: product.slug ?? slug,
    title: product.title ?? '',
    productType: product.productType ?? 'filter',
    category: product.category ?? '',
    description: product.description ?? '',
    shortDescription: product.shortDescription ?? '',
    retailPrice: product.retailPrice ?? 0,
    stock: product.stock ?? 0,
    lowStockThreshold: product.lowStockThreshold ?? 5,
    manageStock: product.manageStock ?? false,
    weight: product.weight ?? 1,
    dimensions: {
      height: product.dimensions?.height ?? 1,
      width: product.dimensions?.width ?? 1,
      depth: product.dimensions?.depth ?? 1,
    },
    applications: (product.applications ?? []).map((a) => ({
      brand: a.brand,
      model: a.model,
      engine: a.engine,
      yearStart: a.yearStart,
      yearEnd: a.yearEnd,
    })),
    oemCodes: product.oemCodes ?? [],
    status: product.status ?? 'active',
    isNewRelease: product.isNewRelease ?? false,
    isPatented: product.isPatented ?? false,
    isFeatured: product.isFeatured ?? false,
    images: (product.images ?? []).map((img) => ({
      url: img.url,
      alt: img.alt ?? '',
      isPrimary: img.isPrimary ?? false,
    })),
    seo: {
      title: product.seo?.title ?? '',
      description: product.seo?.description ?? '',
      keywords: product.seo?.keywords ?? [],
    },
  };

  return <ProductFormClient initialProduct={initial} originalSlug={slug} />;
}
