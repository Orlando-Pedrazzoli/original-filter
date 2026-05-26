/* ══════════════════════════════════════════
   ProductImagesField — Original Filter Admin
   ──────────────────────────────────────────
   Galeria com upload direto para o Cloudinary.

   Features:
   - Drag & drop de arquivos
   - Botão "Selecionar arquivos" tradicional
   - Upload paralelo de múltiplos arquivos
   - Barra de progresso individual
   - Reordenar (setas)
   - Definir primária (estrela)
   - Remover
   ══════════════════════════════════════════ */

'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, Star, ImageOff, Upload, Loader2, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { useAdminToast } from '@/components/admin/admin-toast';
import type { ProductImageForm } from './product-form-types';

interface ProductImagesFieldProps {
  value: ProductImageForm[];
  onChange: (value: ProductImageForm[]) => void;
  disabled?: boolean;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export function ProductImagesField({ value, onChange, disabled }: ProductImagesFieldProps) {
  const { toast } = useAdminToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);

  // ─── Helpers ───
  function removeAt(index: number) {
    const next = value.filter((_, i) => i !== index);
    if (value[index].isPrimary && next.length > 0) {
      next[0].isPrimary = true;
    }
    onChange(next);
  }

  function setPrimaryAt(index: number) {
    onChange(value.map((img, i) => ({ ...img, isPrimary: i === index })));
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    onChange(next);
  }

  // ─── Upload ───
  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);

      // Validações por arquivo
      const valid: File[] = [];
      for (const file of list) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast.error(`${file.name}: tipo não suportado (use JPG, PNG ou WebP)`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name}: maior que 10MB`);
          continue;
        }
        valid.push(file);
      }

      if (valid.length === 0) return;

      // Adiciona à lista de uploads
      const uploadIds: Record<string, string> = {};
      for (const file of valid) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        uploadIds[file.name] = id;
        setUploading((u) => [...u, { id, name: file.name, progress: 0 }]);
      }

      // Upload paralelo
      const results = await Promise.allSettled(
        valid.map(async (file) => {
          const id = uploadIds[file.name];
          try {
            const result = await adminApi.upload.image(file, (percent) => {
              setUploading((u) =>
                u.map((up) => (up.id === id ? { ...up, progress: percent } : up)),
              );
            });

            // Sucesso: remove da lista de uploading
            setUploading((u) => u.filter((up) => up.id !== id));

            return {
              file,
              url: result.url,
              alt: file.name.replace(/\.[^.]+$/, ''), // nome sem extensão como alt
            };
          } catch (err) {
            const errMsg = (err as Error).message;
            setUploading((u) =>
              u.map((up) => (up.id === id ? { ...up, progress: 0, error: errMsg } : up)),
            );
            // Após 4s, remove da lista
            setTimeout(() => {
              setUploading((u) => u.filter((up) => up.id !== id));
            }, 4000);
            throw err;
          }
        }),
      );

      // Adiciona os bem-sucedidos à galeria
      const newImages: ProductImageForm[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (const r of results) {
        if (r.status === 'fulfilled') {
          newImages.push({
            url: r.value.url,
            alt: r.value.alt,
            isPrimary: false,
          });
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (newImages.length > 0) {
        // Se ainda não tinha imagem, marca a primeira nova como primária
        const finalList = [...value, ...newImages];
        if (!finalList.some((img) => img.isPrimary)) {
          finalList[0].isPrimary = true;
        }
        onChange(finalList);
      }

      if (successCount > 0) {
        toast.success(
          `${successCount} ${successCount === 1 ? 'imagem enviada' : 'imagens enviadas'}`,
        );
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} ${errorCount === 1 ? 'imagem falhou' : 'imagens falharam'}`);
      }
    },
    [value, onChange, toast],
  );

  // ─── Handlers ───
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = ''; // reset para permitir selecionar o mesmo arquivo de novo
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-3">
      {/* Galeria existente */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((img, i) => (
            <div
              key={`${img.url}-${i}`}
              className={`group bg-brand-snow relative border ${
                img.isPrimary ? 'border-brand-yellow border-2' : 'border-brand-mist'
              }`}
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden p-3">
                <Image
                  src={img.url}
                  alt={img.alt || `Imagem ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-contain p-2"
                />
              </div>

              {img.isPrimary && (
                <div className="bg-brand-yellow text-brand-black absolute top-1 left-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-widest uppercase">
                  <Star className="size-2.5" strokeWidth={3} />
                  Principal
                </div>
              )}

              <div className="bg-brand-black/0 group-hover:bg-brand-black/60 absolute inset-0 flex items-center justify-center gap-1 opacity-0 transition-colors group-hover:opacity-100">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimaryAt(i)}
                    disabled={disabled}
                    className="bg-brand-yellow text-brand-black inline-flex size-8 items-center justify-center transition hover:scale-110"
                    title="Definir como principal"
                  >
                    <Star className="size-3.5" strokeWidth={2.5} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => moveImage(i, i - 1)}
                  disabled={disabled || i === 0}
                  className="text-brand-black hover:bg-brand-yellow inline-flex size-8 items-center justify-center bg-white transition disabled:opacity-30"
                  title="Mover para esquerda"
                >
                  <ArrowUp className="size-3.5 rotate-[-90deg]" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(i, i + 1)}
                  disabled={disabled || i === value.length - 1}
                  className="text-brand-black hover:bg-brand-yellow inline-flex size-8 items-center justify-center bg-white transition disabled:opacity-30"
                  title="Mover para direita"
                >
                  <ArrowDown className="size-3.5 rotate-[-90deg]" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  disabled={disabled}
                  className="inline-flex size-8 items-center justify-center bg-red-600 text-white transition hover:scale-110"
                  title="Remover imagem"
                >
                  <X className="size-3.5" strokeWidth={2.5} />
                </button>
              </div>

              <div className="text-brand-iron border-brand-mist truncate border-t px-2 py-1.5 font-mono text-[10px]">
                {img.alt || img.url.split('/').pop() || 'imagem'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploads em progresso */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((up) => (
            <div
              key={up.id}
              className={`bg-brand-white border ${
                up.error ? 'border-red-200' : 'border-brand-mist'
              } flex items-center gap-3 p-3`}
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              <div className="shrink-0">
                {up.error ? (
                  <AlertCircle className="size-5 text-red-600" strokeWidth={2} />
                ) : (
                  <Loader2 className="text-brand-yellow-deep size-5 animate-spin" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-brand-black truncate text-sm font-semibold">
                  {up.name}
                </div>
                {up.error ? (
                  <div className="mt-0.5 text-xs text-red-600">{up.error}</div>
                ) : (
                  <>
                    <div className="text-brand-iron mt-0.5 font-mono text-[10px] tracking-widest uppercase">
                      {up.progress < 100
                        ? `Enviando... ${up.progress}%`
                        : 'Processando no Cloudinary...'}
                    </div>
                    <div className="bg-brand-mist mt-1.5 h-1 overflow-hidden">
                      <div
                        className="bg-brand-yellow h-full transition-all"
                        style={{ width: `${up.progress}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone / botão upload */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed p-6 text-center transition-all md:p-10 ${
          isDragging
            ? 'border-brand-yellow bg-brand-yellow/5 scale-[1.01]'
            : 'border-brand-mist hover:border-brand-iron hover:bg-brand-snow'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        style={{ borderRadius: 'var(--radius-edge)' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={`flex size-14 items-center justify-center transition-colors ${
              isDragging ? 'bg-brand-yellow text-brand-black' : 'bg-brand-snow text-brand-iron'
            }`}
          >
            {isDragging ? (
              <ImageOff className="size-6" strokeWidth={2} />
            ) : (
              <Upload className="size-6" strokeWidth={2} />
            )}
          </div>

          <div>
            <div className="font-display text-brand-black mb-1 font-bold">
              {isDragging
                ? 'Solte para enviar'
                : value.length === 0
                  ? 'Arraste imagens aqui'
                  : 'Adicionar mais imagens'}
            </div>
            <div className="text-brand-iron text-xs">
              ou{' '}
              <span className="text-brand-yellow-deep font-semibold underline-offset-2 hover:underline">
                clique para selecionar
              </span>
            </div>
            <div className="text-brand-steel mt-2 font-mono text-[10px] tracking-widest uppercase">
              JPG · PNG · WebP · até 10MB cada
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
