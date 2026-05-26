/* ══════════════════════════════════════════
   Admin API Client — Original Filter
   ──────────────────────────────────────────
   Helpers tipados para chamar /api/admin/...

   Vantagens vs fetch direto:
   - Tratamento de erro padronizado
   - Tipos de resposta consistentes
   - Single source of truth para URLs
   - Fácil interceptar (logging, retry, refresh token)

   USO:
   ```
   import { adminApi } from '@/lib/admin-api';
   const { items, pagination } = await adminApi.products.list({ q: 'NOx' });
   ```
   ══════════════════════════════════════════ */

// ══════════════════════════════════════════
// Tipos
// ══════════════════════════════════════════
export interface ProductListItem {
  slug: string;
  sku: string;
  title: string;
  productType: 'filter' | 'sensor' | 'accessory';
  category: string;
  status: 'active' | 'inactive' | 'discontinued';
  retailPrice: number;
  stock: number;
  primaryImage: string | null;
  hasImage: boolean;
  isNewRelease: boolean;
  isPatented: boolean;
  isFeatured: boolean;
  updatedAt: string;
}

export interface ProductListResponse {
  items: ProductListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    q: string;
    status: string;
    productType: string;
    hasImage: string;
    sort: string;
    order: 'asc' | 'desc';
  };
}

export interface ProductListQuery {
  q?: string;
  status?: 'active' | 'inactive' | 'discontinued' | '';
  productType?: 'filter' | 'sensor' | 'accessory' | '';
  hasImage?: 'true' | 'false' | '';
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductFlags {
  isNewRelease: boolean;
  isPatented: boolean;
  isFeatured: boolean;
}

export interface ApiError extends Error {
  status: number;
  issues?: Array<{ path: string; message: string }>;
  conflictField?: string;
}

// ══════════════════════════════════════════
// Brand types
// ══════════════════════════════════════════
export type BrandCategory =
  | 'rodoviario'
  | 'agricola'
  | 'maquinas-pesadas'
  | 'automotivo'
  | 'industrial';

export interface BrandListItem {
  slug: string;
  name: string;
  logo: string;
  description: string;
  country: string;
  category: BrandCategory;
  displayOrder: number;
  isActive: boolean;
  productsCount: number;
  updatedAt: string;
}

export interface BrandListResponse {
  items: BrandListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    q: string;
    category: string;
    active: string;
    sort: string;
    order: 'asc' | 'desc';
  };
}

export interface BrandListQuery {
  q?: string;
  category?: BrandCategory | '';
  active?: 'true' | 'false' | '';
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ══════════════════════════════════════════
// Reseller Application types
// ══════════════════════════════════════════
export type ResellerStatus = 'pending' | 'approved' | 'rejected';

export type ResellerSegment =
  | 'oficina'
  | 'distribuidora'
  | 'atacado'
  | 'loja'
  | 'frota'
  | 'concessionaria'
  | 'outro';

export interface ResellerApplicationItem {
  _id: string;
  razaoSocial: string;
  cnpj: string;
  nomeFantasia: string;
  inscricaoEstadual: string;
  contactName: string;
  email: string;
  phone: string;
  whatsapp: string;
  cidade: string;
  uf: string;
  segment: ResellerSegment;
  estimatedMonthlyVolume: string;
  currentSuppliers: string;
  message: string;
  status: ResellerStatus;
  reviewedAt: string | null;
  rejectionReason: string;
  approvedDiscountTier: 0 | 5 | 10 | 15 | 20 | null;
  createdAt: string;
}

export interface ResellerListResponse {
  items: ResellerApplicationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  counts: {
    pending: number;
    approved: number;
    rejected: number;
  };
  filters: {
    q: string;
    status: string;
    segment: string;
    sort: string;
    order: 'asc' | 'desc';
  };
}

export interface ResellerListQuery {
  q?: string;
  status?: ResellerStatus | 'all' | '';
  segment?: ResellerSegment | '';
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ══════════════════════════════════════════
// Helpers internos
// ══════════════════════════════════════════
async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // resposta sem corpo válido
  }

  if (!res.ok) {
    const err = new Error((data as { error?: string })?.error ?? `Erro ${res.status}`) as ApiError;
    err.status = res.status;
    if (data && typeof data === 'object') {
      const d = data as { issues?: ApiError['issues']; conflictField?: string };
      if (d.issues) err.issues = d.issues;
      if (d.conflictField) err.conflictField = d.conflictField;
    }
    throw err;
  }

  return data as T;
}

function buildQueryString(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

// ══════════════════════════════════════════
// Public API
// ══════════════════════════════════════════
export const adminApi = {
  upload: {
    /**
     * Faz upload de um arquivo direto para o Cloudinary.
     * 1. Pega assinatura segura do servidor
     * 2. Envia arquivo direto pro Cloudinary com a assinatura
     * 3. Retorna URL da imagem
     *
     * onProgress: callback (0-100) opcional
     */
    image: async (
      file: File,
      onProgress?: (percent: number) => void,
    ): Promise<{ url: string; publicId: string; width: number; height: number }> => {
      // 1. Pega assinatura
      const sig = await fetchJson<{
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
        folder: string;
      }>('/api/admin/upload/signature', { method: 'POST' });

      // 2. Monta FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.apiKey);
      formData.append('timestamp', String(sig.timestamp));
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);

      // 3. Upload com XHR para conseguir tracking de progresso
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({
                url: data.secure_url,
                publicId: data.public_id,
                width: data.width,
                height: data.height,
              });
            } catch {
              reject(new Error('Resposta inválida do Cloudinary'));
            }
          } else {
            let errMsg = `Upload falhou (${xhr.status})`;
            try {
              const data = JSON.parse(xhr.responseText);
              errMsg = data?.error?.message ?? errMsg;
            } catch {
              // ignore
            }
            reject(new Error(errMsg));
          }
        };

        xhr.onerror = () => reject(new Error('Erro de rede durante upload'));
        xhr.onabort = () => reject(new Error('Upload cancelado'));

        xhr.send(formData);
      });
    },
  },

  products: {
    /** Lista paginada com filtros */
    list: (query: ProductListQuery = {}): Promise<ProductListResponse> =>
      fetchJson<ProductListResponse>(
        `/api/admin/products${buildQueryString(query as Record<string, unknown>)}`,
      ),

    /** Detalhe completo do produto */
    get: (slug: string): Promise<{ product: Record<string, unknown> }> =>
      fetchJson(`/api/admin/products/${encodeURIComponent(slug)}`),

    /** Criar novo produto */
    create: (
      data: Record<string, unknown>,
    ): Promise<{
      success: boolean;
      product: { slug: string; sku: string; _id: string };
    }> =>
      fetchJson('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /** Atualizar produto */
    update: (
      slug: string,
      data: Record<string, unknown>,
    ): Promise<{
      success: boolean;
      product: { slug: string; sku: string; _id: string };
    }> =>
      fetchJson(`/api/admin/products/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    /** Soft delete (vira discontinued) ou hard delete via ?hard=true */
    delete: (
      slug: string,
      options: { hard?: boolean } = {},
    ): Promise<{ success: boolean; hard: boolean }> =>
      fetchJson(
        `/api/admin/products/${encodeURIComponent(slug)}${options.hard ? '?hard=true' : ''}`,
        { method: 'DELETE' },
      ),

    /** Atualizar apenas flags (rápido, separado do PATCH completo) */
    updateFlags: (
      slug: string,
      flags: Partial<ProductFlags>,
    ): Promise<{ success: boolean; product: ProductFlags & { slug: string; sku: string } }> =>
      fetchJson(`/api/admin/products/${encodeURIComponent(slug)}/flags`, {
        method: 'PATCH',
        body: JSON.stringify(flags),
      }),
  },

  brands: {
    /** Lista paginada de marcas */
    list: (query: BrandListQuery = {}): Promise<BrandListResponse> =>
      fetchJson<BrandListResponse>(
        `/api/admin/brands${buildQueryString(query as Record<string, unknown>)}`,
      ),

    /** Detalhe da marca */
    get: (slug: string): Promise<{ brand: Record<string, unknown> }> =>
      fetchJson(`/api/admin/brands/${encodeURIComponent(slug)}`),

    /** Criar nova marca */
    create: (
      data: Record<string, unknown>,
    ): Promise<{
      success: boolean;
      brand: { slug: string; name: string; _id: string };
    }> =>
      fetchJson('/api/admin/brands', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /** Atualizar marca */
    update: (
      slug: string,
      data: Record<string, unknown>,
    ): Promise<{
      success: boolean;
      brand: { slug: string; name: string; _id: string };
    }> =>
      fetchJson(`/api/admin/brands/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    /** Soft delete (vira isActive=false) ou hard delete via ?hard=true */
    delete: (
      slug: string,
      options: { hard?: boolean } = {},
    ): Promise<{ success: boolean; hard: boolean }> =>
      fetchJson(
        `/api/admin/brands/${encodeURIComponent(slug)}${options.hard ? '?hard=true' : ''}`,
        { method: 'DELETE' },
      ),
  },

  resellers: {
    /** Lista aplicações com filtros */
    list: (query: ResellerListQuery = {}): Promise<ResellerListResponse> =>
      fetchJson<ResellerListResponse>(
        `/api/admin/reseller-applications${buildQueryString(query as Record<string, unknown>)}`,
      ),

    /** Aprovar aplicação (cria User com role reseller + tier) */
    approve: (
      id: string,
      discountTier: 0 | 5 | 10 | 15 | 20,
    ): Promise<{
      success: boolean;
      application: {
        _id: string;
        status: 'approved';
        approvedDiscountTier: number;
        createdUserId: string;
      };
      userCreated: boolean;
    }> =>
      fetchJson(`/api/admin/reseller-applications/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'approve', discountTier }),
      }),

    /** Rejeitar aplicação com motivo */
    reject: (
      id: string,
      rejectionReason: string,
    ): Promise<{
      success: boolean;
      application: {
        _id: string;
        status: 'rejected';
        rejectionReason: string;
      };
    }> =>
      fetchJson(`/api/admin/reseller-applications/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'reject', rejectionReason }),
      }),

    /** Reabrir (volta para pending) */
    reopen: (
      id: string,
    ): Promise<{
      success: boolean;
      application: { _id: string; status: 'pending' };
    }> =>
      fetchJson(`/api/admin/reseller-applications/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'reopen' }),
      }),
  },
};
