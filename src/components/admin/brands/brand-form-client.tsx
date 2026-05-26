/* ══════════════════════════════════════════
   BrandFormClient — Original Filter Admin
   ──────────────────────────────────────────
   Componente unificado para criar e editar marcas.
   ══════════════════════════════════════════ */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Save,
  Trash2,
  Loader2,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Upload,
  ImageOff,
  X,
} from 'lucide-react';
import { adminApi, type ApiError, type BrandCategory } from '@/lib/admin-api';
import { useAdminToast } from '@/components/admin/admin-toast';
import {
  AdminSection,
  TextField,
  NumberField,
  TextareaField,
  SelectField,
  ToggleField,
} from '@/components/admin/form/admin-form-fields';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

export interface BrandFormState {
  name: string;
  slug: string;
  logo: string;
  description: string;
  country: string;
  category: BrandCategory;
  displayOrder: number;
  isActive: boolean;
}

interface BrandFormClientProps {
  initialBrand?: Partial<BrandFormState>;
  originalSlug?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

function createEmpty(): BrandFormState {
  return {
    name: '',
    slug: '',
    logo: '',
    description: '',
    country: '',
    category: 'rodoviario',
    displayOrder: 999,
    isActive: true,
  };
}

export function BrandFormClient({ initialBrand, originalSlug }: BrandFormClientProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const isEditMode = !!originalSlug;

  const [form, setForm] = useState<BrandFormState>(() => ({
    ...createEmpty(),
    ...initialBrand,
  }));
  const [slugTouched, setSlugTouched] = useState(isEditMode);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Upload de logo
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!slugTouched && !isEditMode && form.name) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
  }, [form.name, slugTouched, isEditMode]);

  function update<K extends keyof BrandFormState>(key: K, value: BrandFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => {
        const { [key as string]: _, ...rest } = e;
        return rest;
      });
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.length < 2) {
      errs.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    if (!form.slug.trim() || form.slug.length < 2) {
      errs.slug = 'Slug obrigatório';
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      errs.slug = 'Slug deve ter apenas letras minúsculas, números e hifens';
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

  async function handleLogoUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem maior que 10MB');
      return;
    }

    setUploadingLogo(true);
    setUploadProgress(0);
    try {
      const result = await adminApi.upload.image(file, (p) => setUploadProgress(p));
      update('logo', result.url);
      toast.success('Logo enviado com sucesso');
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao enviar logo');
    } finally {
      setUploadingLogo(false);
      setUploadProgress(0);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        logo: form.logo.trim(),
        description: form.description.trim() || undefined,
        country: form.country.trim() || undefined,
        category: form.category,
        displayOrder: form.displayOrder,
        isActive: form.isActive,
      };

      if (isEditMode && originalSlug) {
        await adminApi.brands.update(originalSlug, payload);
        toast.success('Marca atualizada');
        if (form.slug !== originalSlug) {
          router.replace(`/admin/marcas/${form.slug}/editar`);
        } else {
          router.refresh();
        }
      } else {
        const result = await adminApi.brands.create(payload);
        toast.success(`Marca criada: ${result.brand.name}`);
        router.push(`/admin/marcas/${result.brand.slug}/editar`);
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
        setErrors({ [apiErr.conflictField]: `${apiErr.conflictField} já existe` });
        toast.error(apiErr.message);
      } else {
        toast.error(apiErr.message || 'Erro ao salvar marca');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!originalSlug) return;
    setDeleting(true);
    try {
      await adminApi.brands.delete(originalSlug);
      toast.success('Marca desativada');
      router.push('/admin/marcas');
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao desativar');
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/marcas"
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
                Editar marca:{' '}
                <span className="text-brand-yellow-deep">{form.name || originalSlug}</span>
              </>
            ) : (
              <>
                Nova marca<span className="text-brand-yellow-deep">.</span>
              </>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && originalSlug && (
            <Link
              href={`/produtos/marca/${originalSlug}`}
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
              Desativar
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
            {saving ? 'Salvando...' : isEditMode ? 'Salvar alterações' : 'Criar marca'}
          </button>
        </div>
      </div>

      {/* 01 IDENTIFICAÇÃO */}
      <AdminSection
        step="01"
        title="Identificação"
        description="Nome, slug e classificação da marca."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <TextField
            label="Nome"
            required
            value={form.name}
            onChange={(v) => update('name', v)}
            error={errors.name}
            placeholder="Volvo"
            maxLength={100}
            className="md:col-span-7"
          />

          <div className="md:col-span-5">
            <SelectField
              label="Categoria"
              required
              value={form.category}
              onChange={(v) => update('category', v as BrandCategory)}
              options={[
                { value: 'rodoviario', label: 'Rodoviário' },
                { value: 'agricola', label: 'Agrícola' },
                { value: 'maquinas-pesadas', label: 'Máquinas pesadas' },
                { value: 'automotivo', label: 'Automotivo' },
                { value: 'industrial', label: 'Industrial' },
              ]}
            />
          </div>

          <div className="md:col-span-10">
            <TextField
              label="Slug (URL)"
              required
              value={form.slug}
              onChange={(v) => {
                setSlugTouched(true);
                update('slug', v);
              }}
              error={errors.slug}
              placeholder="volvo"
              mono
              maxLength={100}
              hint={`originalfilter.com/produtos/marca/${form.slug || '...'}`}
            />
          </div>
          {!isEditMode && (
            <div className="flex items-end md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setSlugTouched(false);
                  update('slug', slugify(form.name));
                }}
                className="text-brand-iron hover:text-brand-yellow-deep border-brand-mist hover:border-brand-iron inline-flex w-full items-center justify-center gap-1.5 border px-3 py-2.5 font-mono text-[10px] tracking-widest uppercase transition"
                style={{ borderRadius: 'var(--radius-edge)' }}
                title="Regenerar slug a partir do nome"
              >
                <RefreshCw className="size-3" />
                Gerar
              </button>
            </div>
          )}

          <TextField
            label="País (opcional)"
            value={form.country}
            onChange={(v) => update('country', v)}
            placeholder="Suécia"
            maxLength={100}
            className="md:col-span-8"
          />

          <div className="md:col-span-4">
            <NumberField
              label="Ordem de exibição"
              value={form.displayOrder}
              onChange={(v) => update('displayOrder', Math.round(v))}
              hint="Menor = aparece primeiro"
              min={0}
            />
          </div>
        </div>
      </AdminSection>

      {/* 02 LOGO */}
      <AdminSection
        step="02"
        title="Logo da marca"
        description="PNG ou SVG com fundo transparente recomendado. Aparece no site e nas listagens."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Preview */}
          <div className="md:col-span-4">
            <div
              className="bg-brand-snow border-brand-mist relative flex aspect-square items-center justify-center overflow-hidden border"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              {form.logo ? (
                <>
                  <Image
                    src={form.logo}
                    alt={form.name || 'Logo'}
                    fill
                    sizes="200px"
                    className="object-contain p-6"
                  />
                  <button
                    type="button"
                    onClick={() => update('logo', '')}
                    className="absolute top-2 right-2 inline-flex size-7 items-center justify-center bg-red-600 text-white opacity-0 transition hover:scale-110 hover:opacity-100"
                    title="Remover logo"
                  >
                    <X className="size-3.5" />
                  </button>
                </>
              ) : (
                <div className="px-4 text-center">
                  <ImageOff className="text-brand-mist mx-auto mb-2 size-8" strokeWidth={1.5} />
                  <div className="text-brand-steel font-mono text-[10px] tracking-widest uppercase">
                    Sem logo
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload + URL manual */}
          <div className="space-y-3 md:col-span-8">
            <label
              className={`flex cursor-pointer items-center justify-center gap-3 border-2 border-dashed px-4 py-6 transition ${
                uploadingLogo
                  ? 'border-brand-yellow bg-brand-yellow/5'
                  : 'border-brand-mist hover:border-brand-iron hover:bg-brand-snow'
              }`}
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]);
                  e.target.value = '';
                }}
                disabled={uploadingLogo || saving}
              />
              {uploadingLogo ? (
                <>
                  <Loader2 className="text-brand-yellow-deep size-5 animate-spin" />
                  <div className="text-brand-iron text-sm">Enviando... {uploadProgress}%</div>
                </>
              ) : (
                <>
                  <Upload className="text-brand-iron size-5" strokeWidth={2} />
                  <div>
                    <div className="font-display text-brand-black text-sm font-bold">
                      {form.logo ? 'Substituir logo' : 'Selecionar arquivo'}
                    </div>
                    <div className="text-brand-steel mt-0.5 font-mono text-[10px] tracking-widest uppercase">
                      JPG · PNG · SVG · WebP · até 10MB
                    </div>
                  </div>
                </>
              )}
            </label>

            <div className="text-brand-steel text-center font-mono text-[10px] tracking-widest uppercase">
              ou
            </div>

            <TextField
              label="URL do logo"
              value={form.logo}
              onChange={(v) => update('logo', v)}
              placeholder="https://..."
              mono
            />
          </div>
        </div>
      </AdminSection>

      {/* 03 DESCRIÇÃO */}
      <AdminSection
        step="03"
        title="Descrição"
        description="Texto institucional que aparece na página da marca no site."
      >
        <TextareaField
          label="Descrição"
          value={form.description}
          onChange={(v) => update('description', v)}
          placeholder="Linha completa de filtros para a montadora..."
          rows={4}
          maxLength={1000}
        />
      </AdminSection>

      {/* 04 STATUS */}
      <AdminSection
        step="04"
        title="Status"
        description="Apenas marcas ativas aparecem no site público."
      >
        <ToggleField
          checked={form.isActive}
          onChange={(v) => update('isActive', v)}
          label="Marca ativa"
          description="Visível no site, busca por veículo e listagens"
        />
      </AdminSection>

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

      <div className="border-brand-mist bg-brand-snow sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t px-4 py-4 pt-4 lg:-mx-6 lg:px-6">
        <Link
          href="/admin/marcas"
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
          {saving ? 'Salvando...' : isEditMode ? 'Salvar alterações' : 'Criar marca'}
        </button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Desativar marca?"
        description={
          <>
            A marca <strong className="text-brand-black">{form.name}</strong> será{' '}
            <strong>removida do site público</strong>, mas continuará no banco para consultas. Esta
            ação pode ser revertida ativando a marca novamente.
          </>
        }
        confirmLabel="Sim, desativar"
        cancelLabel="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </form>
  );
}
