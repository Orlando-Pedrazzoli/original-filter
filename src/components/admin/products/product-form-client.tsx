/* ══════════════════════════════════════════
   ProductFormClient — Original Filter Admin
   ──────────────────────────────────────────
   Componente unificado para criar e editar produtos.

   Modo "criar": initialProduct undefined, button "Criar produto"
   Modo "editar": initialProduct presente, button "Salvar alterações" + deletar

   Estrutura em 7 seções (AdminSection):
   01 Identificação      (sku, slug, título, tipo, categoria)
   02 Conteúdo           (descrição curta, descrição longa)
   03 Imagens            (gerenciamento de URLs + primária)
   04 Preço e estoque    (retailPrice, stock, manageStock)
   05 Logística          (peso, dimensões h/l/d)
   06 Aplicações         (lista de brand/model/engine/anos)
   07 Códigos OEM        (chips)
   08 SEO                (title, description, keywords)
   09 Status e flags     (status, isNewRelease, isPatented, isFeatured)
   ══════════════════════════════════════════ */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  Trash2,
  Loader2,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { adminApi, type ApiError } from '@/lib/admin-api';
import { useAdminToast } from '@/components/admin/admin-toast';
import {
  AdminSection,
  TextField,
  NumberField,
  TextareaField,
  SelectField,
  ToggleField,
} from '@/components/admin/form/admin-form-fields';
import { ProductApplicationsField } from '@/components/admin/products/product-applications-field';
import { ProductImagesField } from '@/components/admin/products/product-images-field';
import { TagsField } from '@/components/admin/products/tags-field';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import {
  createEmptyProductFormState,
  type ProductFormState,
} from '@/components/admin/products/product-form-types';

interface ProductFormClientProps {
  /** Se presente, modo edição. Se ausente, modo criação. */
  initialProduct?: Partial<ProductFormState> & {
    slug?: string;
  };
  /** Slug original (antes de qualquer edição). Usado para identificar o produto na API. */
  originalSlug?: string;
}

// ─── Helper: gerar slug a partir do título ───
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // só letras, nums, espaços e hifens
    .trim()
    .replace(/\s+/g, '-') // espaços viram hifens
    .replace(/-+/g, '-') // dois ou mais hifens vira um
    .slice(0, 120);
}

export function ProductFormClient({ initialProduct, originalSlug }: ProductFormClientProps) {
  const router = useRouter();
  const { toast } = useAdminToast();

  const isEditMode = !!originalSlug;

  // Estado do form (merge initial com defaults)
  const [form, setForm] = useState<ProductFormState>(() => ({
    ...createEmptyProductFormState(),
    ...initialProduct,
    dimensions: {
      ...createEmptyProductFormState().dimensions,
      ...(initialProduct?.dimensions ?? {}),
    },
    seo: {
      ...createEmptyProductFormState().seo,
      ...(initialProduct?.seo ?? {}),
    },
  }));

  // Slug auto-gerado a partir do título quando não foi editado manualmente
  const [slugTouched, setSlugTouched] = useState(isEditMode);

  // Erros por campo
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Loading states
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Auto-slug quando título muda (apenas em modo criação)
  useEffect(() => {
    if (!slugTouched && !isEditMode && form.title) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, slugTouched, isEditMode]);

  // ─── Helpers de update ───
  function update<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => {
        const { [key as string]: _, ...rest } = e;
        return rest;
      });
    }
  }

  function updateDimension(key: 'height' | 'width' | 'depth', value: number) {
    setForm((f) => ({ ...f, dimensions: { ...f.dimensions, [key]: value } }));
  }

  function updateSeo<K extends keyof ProductFormState['seo']>(
    key: K,
    value: ProductFormState['seo'][K],
  ) {
    setForm((f) => ({ ...f, seo: { ...f.seo, [key]: value } }));
  }

  // ─── Validação client ───
  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (!form.sku.trim() || form.sku.length < 2) {
      errs.sku = 'SKU deve ter pelo menos 2 caracteres';
    } else if (!/^[A-Za-z0-9\-_./]+$/.test(form.sku)) {
      errs.sku = 'SKU deve ter apenas letras, números, hífens e _./';
    }

    if (!form.slug.trim() || form.slug.length < 2) {
      errs.slug = 'Slug obrigatório';
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      errs.slug = 'Slug deve ter apenas letras minúsculas, números e hifens';
    }

    if (!form.title.trim() || form.title.length < 3) {
      errs.title = 'Título deve ter pelo menos 3 caracteres';
    }

    if (form.retailPrice < 0) {
      errs.retailPrice = 'Preço não pode ser negativo';
    }

    if (form.weight < 0) {
      errs.weight = 'Peso não pode ser negativo';
    }

    if (form.images.length === 0) {
      // Não é erro bloqueante, mas mostra aviso amarelo
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      setTimeout(() => {
        const el = document.querySelector('[data-field-error="true"]');
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return false;
    }
    return true;
  }

  // ─── Submit ───
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    try {
      // Garantir que apenas uma imagem seja primária
      let imagesNormalized = form.images;
      if (imagesNormalized.length > 0 && !imagesNormalized.some((i) => i.isPrimary)) {
        imagesNormalized = imagesNormalized.map((img, i) => ({
          ...img,
          isPrimary: i === 0,
        }));
      }

      const payload: Record<string, unknown> = {
        sku: form.sku.trim(),
        slug: form.slug.trim(),
        title: form.title.trim(),
        productType: form.productType,
        category: form.category.trim(),
        description: form.description.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        retailPrice: form.retailPrice,
        stock: form.stock,
        lowStockThreshold: form.lowStockThreshold,
        manageStock: form.manageStock,
        weight: form.weight,
        dimensions: form.dimensions,
        applications: form.applications,
        oemCodes: form.oemCodes,
        images: imagesNormalized,
        status: form.status,
        isNewRelease: form.isNewRelease,
        isPatented: form.isPatented,
        isFeatured: form.isFeatured,
      };

      // SEO só envia se tiver algo
      if (
        form.seo.title?.trim() ||
        form.seo.description?.trim() ||
        (form.seo.keywords && form.seo.keywords.length > 0)
      ) {
        payload.seo = {
          title: form.seo.title?.trim() || undefined,
          description: form.seo.description?.trim() || undefined,
          keywords: form.seo.keywords?.length ? form.seo.keywords : undefined,
        };
      }

      if (isEditMode && originalSlug) {
        await adminApi.products.update(originalSlug, payload);
        toast.success('Produto atualizado com sucesso');

        // Se mudou o slug, redireciona pro novo
        if (form.slug !== originalSlug) {
          router.replace(`/admin/produtos/${form.slug}/editar`);
        } else {
          router.refresh();
        }
      } else {
        const result = await adminApi.products.create(payload);
        toast.success(`Produto criado: ${result.product.sku}`);
        router.push(`/admin/produtos/${result.product.slug}/editar`);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.issues) {
        const fieldErrors: Record<string, string> = {};
        for (const iss of apiErr.issues) {
          fieldErrors[iss.path] = iss.message;
        }
        setErrors(fieldErrors);
        toast.error('Verifique os campos destacados');
      } else if (apiErr.conflictField) {
        const fieldKey = apiErr.conflictField.toLowerCase() === 'sku' ? 'sku' : 'slug';
        setErrors({ [fieldKey]: `${apiErr.conflictField} já existe` });
        toast.error(apiErr.message);
      } else {
        toast.error(apiErr.message || 'Erro ao salvar produto');
      }
    } finally {
      setSaving(false);
    }
  }

  // ─── Delete ───
  async function handleDelete() {
    if (!originalSlug) return;
    setDeleting(true);
    try {
      await adminApi.products.delete(originalSlug);
      toast.success('Produto descontinuado');
      router.push('/admin/produtos');
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao descontinuar');
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
      {/* ─── Header com voltar + ações ─── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/produtos"
            className="text-brand-iron hover:text-brand-yellow-deep mb-3 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase transition"
          >
            <ArrowLeft className="size-3" />
            Voltar para lista
          </Link>
          <h1
            className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
              letterSpacing: '-0.035em',
            }}
          >
            {isEditMode ? (
              <>
                Editar produto:{' '}
                <span className="text-brand-yellow-deep font-mono">{form.sku || originalSlug}</span>
              </>
            ) : (
              <>
                Novo produto<span className="text-brand-yellow-deep">.</span>
              </>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && originalSlug && (
            <Link
              href={`/produtos/${originalSlug}`}
              target="_blank"
              className="font-display text-brand-iron hover:text-brand-yellow-deep border-brand-mist hover:border-brand-iron inline-flex items-center gap-2 border px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <ExternalLink className="size-3.5" />
              Ver no site
            </Link>
          )}
          {isEditMode && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={saving}
              className="font-display inline-flex items-center gap-2 border border-red-200 px-4 py-2.5 text-xs font-semibold tracking-wide text-red-600 uppercase transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <Trash2 className="size-3.5" />
              Descontinuar
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition disabled:cursor-wait disabled:opacity-50"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" strokeWidth={2.5} />
            )}
            {saving ? 'Salvando...' : isEditMode ? 'Salvar alterações' : 'Criar produto'}
          </button>
        </div>
      </div>

      {/* ─── 01 IDENTIFICAÇÃO ─── */}
      <AdminSection
        step="01"
        title="Identificação"
        description="Código único do produto e classificação."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <TextField
            label="SKU"
            required
            value={form.sku}
            onChange={(v) => update('sku', v)}
            error={errors.sku}
            placeholder="OF-NX-001"
            mono
            maxLength={50}
            className="md:col-span-4"
          />
          <div className="md:col-span-8">
            <TextField
              label="Título"
              required
              value={form.title}
              onChange={(v) => update('title', v)}
              error={errors.title}
              placeholder="Sensor NOx Volvo FH 540"
              maxLength={200}
            />
          </div>

          <div className="md:col-span-7">
            <TextField
              label="Slug (URL)"
              required
              value={form.slug}
              onChange={(v) => {
                setSlugTouched(true);
                update('slug', v);
              }}
              error={errors.slug}
              placeholder="sensor-nox-volvo-fh-540"
              mono
              maxLength={120}
              hint={`originalfilter.com/produtos/${form.slug || '...'}`}
            />
          </div>
          {!isEditMode && (
            <div className="flex items-end md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setSlugTouched(false);
                  update('slug', slugify(form.title));
                }}
                className="text-brand-iron hover:text-brand-yellow-deep border-brand-mist hover:border-brand-iron inline-flex w-full items-center justify-center gap-1.5 border px-3 py-2.5 font-mono text-[10px] tracking-widest uppercase transition"
                style={{ borderRadius: 'var(--radius-edge)' }}
                title="Regenerar slug a partir do título"
              >
                <RefreshCw className="size-3" />
                Gerar
              </button>
            </div>
          )}

          <SelectField
            label="Tipo"
            required
            value={form.productType}
            onChange={(v) => update('productType', v as ProductFormState['productType'])}
            options={[
              { value: 'filter', label: 'Filtro' },
              { value: 'sensor', label: 'Sensor' },
              { value: 'accessory', label: 'Acessório' },
            ]}
            className={`md:col-span-${isEditMode ? '6' : '5'}`}
          />
          <TextField
            label="Categoria"
            value={form.category}
            onChange={(v) => update('category', v)}
            placeholder="Filtro de combustível"
            maxLength={100}
            className="md:col-span-6"
          />
        </div>
      </AdminSection>

      {/* ─── 02 CONTEÚDO ─── */}
      <AdminSection
        step="02"
        title="Conteúdo"
        description="Descrições que aparecem no site público."
      >
        <TextareaField
          label="Descrição curta (cards e snippets)"
          value={form.shortDescription}
          onChange={(v) => update('shortDescription', v)}
          placeholder="Resumo objetivo do produto em até 280 caracteres."
          rows={2}
          maxLength={280}
        />
        <TextareaField
          label="Descrição completa"
          value={form.description}
          onChange={(v) => update('description', v)}
          placeholder="Descrição técnica completa, características, aplicações..."
          rows={6}
          maxLength={5000}
        />
      </AdminSection>

      {/* ─── 03 IMAGENS ─── */}
      <AdminSection
        step="03"
        title="Imagens"
        description="A primeira imagem (ou a marcada como principal) é usada nos cards e no destaque do produto."
      >
        <ProductImagesField
          value={form.images}
          onChange={(v) => update('images', v)}
          disabled={saving}
        />
      </AdminSection>

      {/* ─── 04 PREÇO E ESTOQUE ─── */}
      <AdminSection
        step="04"
        title="Preço e estoque"
        description="Preço de varejo (B2C). Desconto B2B é calculado por discountTier do revendedor."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <NumberField
            label="Preço de varejo"
            value={form.retailPrice}
            onChange={(v) => update('retailPrice', v)}
            error={errors.retailPrice}
            prefix="R$"
            min={0}
            step={0.01}
            className="md:col-span-4"
          />
          <NumberField
            label="Estoque atual"
            value={form.stock}
            onChange={(v) => update('stock', Math.round(v))}
            min={0}
            className="md:col-span-4"
          />
          <NumberField
            label="Alerta de estoque baixo"
            value={form.lowStockThreshold}
            onChange={(v) => update('lowStockThreshold', Math.round(v))}
            min={0}
            hint="Mostra alerta quando estoque cair até este nível"
            className="md:col-span-4"
          />
        </div>
        <div className="border-brand-mist border-t pt-3">
          <ToggleField
            checked={form.manageStock}
            onChange={(v) => update('manageStock', v)}
            label="Gerenciar estoque"
            description="Se ativo, o sistema bloqueia vendas quando estoque chegar a 0"
          />
        </div>
      </AdminSection>

      {/* ─── 05 LOGÍSTICA ─── */}
      <AdminSection
        step="05"
        title="Logística"
        description="Dimensões para cálculo de frete (Melhor Envio)."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <NumberField
            label="Peso"
            value={form.weight}
            onChange={(v) => update('weight', v)}
            error={errors.weight}
            suffix="kg"
            min={0}
            step={0.01}
            className="md:col-span-3"
          />
          <NumberField
            label="Altura"
            value={form.dimensions.height}
            onChange={(v) => updateDimension('height', v)}
            suffix="cm"
            min={0}
            step={0.1}
            className="md:col-span-3"
          />
          <NumberField
            label="Largura"
            value={form.dimensions.width}
            onChange={(v) => updateDimension('width', v)}
            suffix="cm"
            min={0}
            step={0.1}
            className="md:col-span-3"
          />
          <NumberField
            label="Profundidade"
            value={form.dimensions.depth}
            onChange={(v) => updateDimension('depth', v)}
            suffix="cm"
            min={0}
            step={0.1}
            className="md:col-span-3"
          />
        </div>
      </AdminSection>

      {/* ─── 06 APLICAÇÕES ─── */}
      <AdminSection
        step="06"
        title="Aplicações de veículo"
        description="Lista de veículos que usam este produto. Aparecem na ficha técnica e na busca por veículo."
      >
        <ProductApplicationsField
          value={form.applications}
          onChange={(v) => update('applications', v)}
          disabled={saving}
        />
      </AdminSection>

      {/* ─── 07 CÓDIGOS OEM ─── */}
      <AdminSection
        step="07"
        title="Códigos OEM"
        description="Códigos equivalentes de fabricantes (Volvo, Scania, Mercedes-Benz...). Usados na busca por cross-reference."
      >
        <TagsField
          value={form.oemCodes}
          onChange={(v) => update('oemCodes', v)}
          placeholder="Digite um código OEM e pressione Enter (ex: 21567137, 1872014)"
          uppercase
          variant="mono"
          maxLength={50}
          disabled={saving}
        />
      </AdminSection>

      {/* ─── 08 SEO ─── */}
      <AdminSection
        step="08"
        title="SEO"
        description="Otimização para mecanismos de busca. Se vazio, usa título e descrição padrão."
      >
        <TextField
          label="Title SEO"
          value={form.seo.title ?? ''}
          onChange={(v) => updateSeo('title', v)}
          placeholder="Igual ao título do produto se vazio"
          maxLength={200}
          hint="Até 60 caracteres é o ideal para Google"
        />
        <TextareaField
          label="Description SEO"
          value={form.seo.description ?? ''}
          onChange={(v) => updateSeo('description', v)}
          placeholder="Descrição que aparece no Google. Até 160 caracteres é o ideal."
          rows={3}
          maxLength={300}
        />
        <div>
          <label className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase">
            Keywords
          </label>
          <TagsField
            value={form.seo.keywords ?? []}
            onChange={(v) => updateSeo('keywords', v)}
            placeholder="Palavras-chave (Enter para adicionar)"
            disabled={saving}
          />
        </div>
      </AdminSection>

      {/* ─── 09 STATUS E FLAGS ─── */}
      <AdminSection
        step="09"
        title="Status e flags"
        description="Visibilidade do produto e destaques especiais."
      >
        <SelectField
          label="Status"
          required
          value={form.status}
          onChange={(v) => update('status', v as ProductFormState['status'])}
          options={[
            { value: 'active', label: 'Ativo (visível no site)' },
            { value: 'inactive', label: 'Inativo (oculto)' },
            { value: 'discontinued', label: 'Descontinuado (arquivado)' },
          ]}
          hint="Apenas produtos ativos aparecem no site público"
        />

        <div className="border-brand-mist grid grid-cols-1 gap-4 border-t pt-3 md:grid-cols-3">
          <ToggleField
            checked={form.isNewRelease}
            onChange={(v) => update('isNewRelease', v)}
            label="Lançamento"
            description="Aparece em /lancamentos"
          />
          <ToggleField
            checked={form.isPatented}
            onChange={(v) => update('isPatented', v)}
            label="Patenteado"
            description="Badge especial no card"
          />
          <ToggleField
            checked={form.isFeatured}
            onChange={(v) => update('isFeatured', v)}
            label="Em destaque"
            description="Aparece na home"
          />
        </div>
      </AdminSection>

      {/* ─── Erros gerais ─── */}
      {Object.keys(errors).length > 0 && (
        <div
          className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <div>
            <strong>Há campos com erro.</strong> Verifique os campos destacados acima.
          </div>
        </div>
      )}

      {/* ─── Footer com botões ─── */}
      <div className="border-brand-mist bg-brand-snow sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t px-4 py-4 pt-4 lg:-mx-6 lg:px-6">
        <Link
          href="/admin/produtos"
          className="font-display text-brand-iron hover:text-brand-black border-brand-mist hover:border-brand-iron border px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition disabled:cursor-wait disabled:opacity-50"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Save className="size-3.5" strokeWidth={2.5} />
          )}
          {saving ? 'Salvando...' : isEditMode ? 'Salvar alterações' : 'Criar produto'}
        </button>
      </div>

      {/* ─── Confirm delete ─── */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Descontinuar produto?"
        description={
          <>
            O produto <strong className="text-brand-black font-mono">{form.sku}</strong> será
            marcado como descontinuado e <strong>removido do site público</strong>, mas continuará
            no banco para consultas históricas. Esta ação pode ser revertida editando o produto e
            mudando o status.
          </>
        }
        confirmLabel="Sim, descontinuar"
        cancelLabel="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </form>
  );
}
