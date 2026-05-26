/* ══════════════════════════════════════════
   ResellerForm — Original Filter
   ──────────────────────────────────────────
   Formulário B2B de aplicação para revendedor.
   Bate 100% com o schema Zod da API /api/reseller-application.

   Estrutura em 3 grupos visuais:
   - 01 DADOS DA EMPRESA  (razaoSocial, cnpj, nomeFantasia, IE)
   - 02 CONTATO RESPONSÁVEL (contactName, email, phone, whatsapp)
   - 03 PERFIL COMERCIAL  (cidade, uf, segment, volume, suppliers, message)

   Funcionalidades:
   - Máscaras automáticas: CNPJ, telefone, UF
   - Validação client-side
   - Estados: idle / submitting / success / error
   - Honeypot anti-spam
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Hash,
  ArrowRight,
} from 'lucide-react';

const SEGMENT_OPTIONS = [
  { value: 'oficina', label: 'Oficina mecânica' },
  { value: 'distribuidora', label: 'Distribuidora' },
  { value: 'atacado', label: 'Atacado / autopeças' },
  { value: 'loja', label: 'Loja de autopeças (varejo)' },
  { value: 'frota', label: 'Frota / transportadora' },
  { value: 'concessionaria', label: 'Concessionária' },
  { value: 'outro', label: 'Outro' },
];

const VOLUME_OPTIONS = [
  { value: '', label: 'Selecione (opcional)' },
  { value: 'ate-50', label: 'Até 50 unidades/mês' },
  { value: '50-200', label: '50 a 200 unidades/mês' },
  { value: '200-500', label: '200 a 500 unidades/mês' },
  { value: '500-1000', label: '500 a 1.000 unidades/mês' },
  { value: 'acima-1000', label: 'Acima de 1.000 unidades/mês' },
];

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FormData {
  // Dados da empresa
  razaoSocial: string;
  cnpj: string;
  nomeFantasia: string;
  inscricaoEstadual: string;
  // Contato responsável
  contactName: string;
  email: string;
  phone: string;
  whatsapp: string;
  // Perfil comercial
  cidade: string;
  uf: string;
  segment: string;
  estimatedMonthlyVolume: string;
  currentSuppliers: string;
  message: string;
  // Honeypot
  website: string;
}

const INITIAL_DATA: FormData = {
  razaoSocial: '',
  cnpj: '',
  nomeFantasia: '',
  inscricaoEstadual: '',
  contactName: '',
  email: '',
  phone: '',
  whatsapp: '',
  cidade: '',
  uf: '',
  segment: 'oficina',
  estimatedMonthlyVolume: '',
  currentSuppliers: '',
  message: '',
  website: '',
};

// ─── Máscaras ───
function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskUF(value: string): string {
  return value
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 2);
}

export function ResellerForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [state, setState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((d) => ({ ...d, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (formData.razaoSocial.trim().length < 2) {
      errors.razaoSocial = 'Informe a razão social completa';
    }
    const cnpjDigits = formData.cnpj.replace(/\D/g, '');
    if (cnpjDigits.length !== 14) {
      errors.cnpj = 'CNPJ deve ter 14 dígitos';
    }
    if (formData.contactName.trim().length < 2) {
      errors.contactName = 'Informe o nome do responsável';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Email inválido';
    }
    if (formData.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Telefone inválido';
    }
    if (formData.cidade.trim().length < 2) {
      errors.cidade = 'Informe a cidade';
    }
    if (formData.uf.length !== 2) {
      errors.uf = 'UF com 2 letras';
    }

    setFieldErrors(errors);

    // Se houver erros, scroll suave até o primeiro
    if (Object.keys(errors).length > 0) {
      setTimeout(() => {
        const firstErrorEl = document.querySelector('[data-field-error="true"]');
        firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    setState('submitting');

    try {
      const payload = {
        razaoSocial: formData.razaoSocial.trim(),
        cnpj: formData.cnpj,
        nomeFantasia: formData.nomeFantasia.trim() || undefined,
        inscricaoEstadual: formData.inscricaoEstadual.trim() || undefined,
        contactName: formData.contactName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        whatsapp: formData.whatsapp.trim() || undefined,
        cidade: formData.cidade.trim(),
        uf: formData.uf,
        segment: formData.segment,
        estimatedMonthlyVolume: formData.estimatedMonthlyVolume.trim() || undefined,
        currentSuppliers: formData.currentSuppliers.trim() || undefined,
        message: formData.message.trim() || undefined,
      };

      const res = await fetch('/api/reseller-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.issues && Array.isArray(data.issues)) {
          // Mapear erros do Zod de volta para os campos
          const apiErrors: Partial<Record<keyof FormData, string>> = {};
          for (const issue of data.issues) {
            if (issue.path && issue.message) {
              apiErrors[issue.path as keyof FormData] = issue.message;
            }
          }
          setFieldErrors(apiErrors);
          throw new Error('Verifique os campos destacados.');
        }
        throw new Error(data?.error ?? 'Erro ao enviar aplicação.');
      }

      setState('success');
      setFormData(INITIAL_DATA);
    } catch (err) {
      setState('error');
      setErrorMessage((err as Error).message);
    }
  }

  // ─── Tela de sucesso ───
  if (state === 'success') {
    return (
      <div
        className="bg-brand-white border-brand-mist border p-8 text-center md:p-12"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        <div className="bg-brand-yellow text-brand-black mb-6 inline-flex size-20 items-center justify-center">
          <CheckCircle2 className="size-10" strokeWidth={2} />
        </div>
        <div className="text-brand-yellow-deep mb-3 font-mono text-[10px] tracking-[0.22em] uppercase">
          Aplicação recebida
        </div>
        <h3
          className="font-display text-brand-black mx-auto mb-4 max-w-md leading-tight font-black"
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            letterSpacing: '-0.03em',
          }}
        >
          Cadastro enviado com sucesso!
        </h3>
        <p className="text-brand-iron mx-auto mb-8 max-w-md leading-relaxed">
          Recebemos sua aplicação para o programa de revendedores. Nossa equipe comercial vai
          analisar os dados e entrar em contato em até{' '}
          <strong className="text-brand-black">2 dias úteis</strong> com as condições do programa.
        </p>

        <div className="mx-auto flex max-w-md flex-col justify-center gap-3 sm:flex-row">
          <Link href="/produtos" className="btn-primary">
            Explorar catálogo
            <ArrowRight className="size-4" />
          </Link>
          <button type="button" onClick={() => setState('idle')} className="btn-secondary">
            Enviar outra aplicação
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>
      {/* Honeypot anti-spam */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={formData.website}
        onChange={(e) => update('website', e.target.value)}
        className="pointer-events-none absolute -left-[9999px] opacity-0"
        aria-hidden="true"
      />

      {/* ═══ ETAPA 01: DADOS DA EMPRESA ═══ */}
      <FormGroup
        step="01"
        title="Dados da empresa"
        description="Informações cadastrais para validação do CNPJ."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Razão social"
            required
            error={fieldErrors.razaoSocial}
            className="md:col-span-2"
          >
            <Building2 className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
            <input
              type="text"
              value={formData.razaoSocial}
              onChange={(e) => update('razaoSocial', e.target.value)}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-3 pr-4 pl-10 text-[15px] leading-normal transition-colors outline-none"
              placeholder="Empresa Comercial Ltda"
              required
              minLength={2}
              maxLength={200}
            />
          </Field>

          <Field label="CNPJ" required error={fieldErrors.cnpj}>
            <Hash className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => update('cnpj', maskCNPJ(e.target.value))}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-3 pr-4 pl-10 font-mono text-[15px] leading-normal transition-colors outline-none"
              placeholder="00.000.000/0000-00"
              inputMode="numeric"
              required
              maxLength={18}
            />
          </Field>

          <Field label="Nome fantasia (opcional)">
            <input
              type="text"
              value={formData.nomeFantasia}
              onChange={(e) => update('nomeFantasia', e.target.value)}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white px-4 py-3 text-[15px] leading-normal transition-colors outline-none"
              placeholder="Nome comercial"
              maxLength={200}
            />
          </Field>

          <Field label="Inscrição estadual (opcional)" className="md:col-span-2">
            <input
              type="text"
              value={formData.inscricaoEstadual}
              onChange={(e) => update('inscricaoEstadual', e.target.value)}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white px-4 py-3 text-[15px] leading-normal transition-colors outline-none"
              placeholder="ISENTO ou 000.000.000.000"
              maxLength={50}
            />
          </Field>
        </div>
      </FormGroup>

      {/* ═══ ETAPA 02: CONTATO ═══ */}
      <FormGroup
        step="02"
        title="Contato responsável"
        description="Pessoa que vai receber o retorno da nossa equipe comercial."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Nome completo"
            required
            error={fieldErrors.contactName}
            className="md:col-span-2"
          >
            <User className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => update('contactName', e.target.value)}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-3 pr-4 pl-10 text-[15px] leading-normal transition-colors outline-none"
              placeholder="Seu nome"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
            />
          </Field>

          <Field label="Email" required error={fieldErrors.email}>
            <Mail className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => update('email', e.target.value)}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-3 pr-4 pl-10 text-[15px] leading-normal transition-colors outline-none"
              placeholder="contato@empresa.com.br"
              autoComplete="email"
              required
            />
          </Field>

          <Field label="Telefone comercial" required error={fieldErrors.phone}>
            <Phone className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => update('phone', maskPhone(e.target.value))}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-3 pr-4 pl-10 font-mono text-[15px] leading-normal transition-colors outline-none"
              placeholder="(11) 99999-9999"
              inputMode="tel"
              required
              maxLength={20}
            />
          </Field>

          <Field label="WhatsApp (opcional)" className="md:col-span-2">
            <Phone className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => update('whatsapp', maskPhone(e.target.value))}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-3 pr-4 pl-10 font-mono text-[15px] leading-normal transition-colors outline-none"
              placeholder="(11) 99999-9999"
              inputMode="tel"
              maxLength={20}
            />
          </Field>
        </div>
      </FormGroup>

      {/* ═══ ETAPA 03: PERFIL COMERCIAL ═══ */}
      <FormGroup
        step="03"
        title="Perfil comercial"
        description="Ajuda nossa equipe a entender melhor seu negócio."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Field label="Cidade" required error={fieldErrors.cidade} className="md:col-span-2">
            <MapPin className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
            <input
              type="text"
              value={formData.cidade}
              onChange={(e) => update('cidade', e.target.value)}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-3 pr-4 pl-10 text-[15px] leading-normal transition-colors outline-none"
              placeholder="São Paulo"
              autoComplete="address-level2"
              required
              minLength={2}
              maxLength={100}
            />
          </Field>

          <Field label="UF" required error={fieldErrors.uf}>
            <input
              type="text"
              value={formData.uf}
              onChange={(e) => update('uf', maskUF(e.target.value))}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white px-4 py-3 text-center font-mono text-[15px] leading-normal uppercase transition-colors outline-none"
              placeholder="SP"
              autoComplete="address-level1"
              required
              maxLength={2}
            />
          </Field>

          <Field label="Tipo de negócio" required className="md:col-span-3">
            <Briefcase className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
            <select
              value={formData.segment}
              onChange={(e) => update('segment', e.target.value)}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black w-full cursor-pointer appearance-none border bg-white px-4 py-3 pr-10 pl-10 text-[15px] leading-normal transition-colors outline-none"
              required
            >
              {SEGMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <svg
              className="text-brand-steel pointer-events-none absolute top-3.5 right-3 size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Field>

          <Field label="Volume mensal estimado (opcional)" className="md:col-span-3">
            <TrendingUp className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
            <select
              value={formData.estimatedMonthlyVolume}
              onChange={(e) => update('estimatedMonthlyVolume', e.target.value)}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black w-full cursor-pointer appearance-none border bg-white px-4 py-3 pr-10 pl-10 text-[15px] leading-normal transition-colors outline-none"
            >
              {VOLUME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <svg
              className="text-brand-steel pointer-events-none absolute top-3.5 right-3 size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Field>

          <Field label="Fornecedores atuais (opcional)" className="md:col-span-3">
            <input
              type="text"
              value={formData.currentSuppliers}
              onChange={(e) => update('currentSuppliers', e.target.value)}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white px-4 py-3 text-[15px] leading-normal transition-colors outline-none"
              placeholder="Marcas que trabalha atualmente (ex: Mann, Tecfil, Wega)"
              maxLength={300}
            />
          </Field>

          <Field label="Observações (opcional)" className="md:col-span-3">
            <MessageSquare className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
            <textarea
              value={formData.message}
              onChange={(e) => update('message', e.target.value)}
              rows={4}
              style={{ borderRadius: 'var(--radius-edge)' }}
              className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel min-h-[100px] w-full resize-y border bg-white py-3 pr-4 pl-10 text-[15px] leading-normal transition-colors outline-none"
              placeholder="Detalhes adicionais sobre seu negócio, áreas de atuação ou interesse específico."
              maxLength={2000}
            />
          </Field>
        </div>
      </FormGroup>

      {/* Erro geral */}
      {state === 'error' && errorMessage && (
        <div
          className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit */}
      <div className="border-brand-mist border-t pt-4">
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {state === 'submitting' ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Enviando aplicação...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Enviar aplicação
            </>
          )}
        </button>
        <p className="text-brand-steel mt-4 max-w-2xl text-xs leading-relaxed">
          Ao enviar, você concorda com o tratamento dos dados pessoais e comerciais conforme nossa
          política de privacidade. Sua aplicação será analisada em até 2 dias úteis e você receberá
          retorno por email.
        </p>
      </div>
    </form>
  );
}

// ══════════════════════════════════════════
//   FormGroup wrapper (header numerado)
// ══════════════════════════════════════════
function FormGroup({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-brand-white border-brand-mist relative border p-6 md:p-8"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      <div className="bg-brand-yellow absolute top-6 bottom-6 left-0 w-1 md:top-8 md:bottom-8" />

      <div className="mb-6 pl-5">
        <div className="text-brand-yellow-deep mb-1.5 font-mono text-[10px] tracking-[0.22em] uppercase">
          Etapa {step}
        </div>
        <h3
          className="font-display text-brand-black leading-tight font-black"
          style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)',
            letterSpacing: '-0.025em',
          }}
        >
          {title}
        </h3>
        <p className="text-brand-steel mt-1.5 text-sm leading-relaxed">{description}</p>
      </div>

      {children}
    </div>
  );
}

// ══════════════════════════════════════════
//   Field wrapper
// ══════════════════════════════════════════
function Field({
  label,
  required,
  error,
  className = '',
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className} data-field-error={error ? 'true' : undefined}>
      <label className="text-brand-iron mb-2 block font-mono text-[10px] tracking-[0.22em] uppercase">
        {label}
        {required && <span className="text-brand-yellow-deep ml-0.5">*</span>}
      </label>
      <div className="relative">{children}</div>
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="size-3" strokeWidth={2} />
          {error}
        </div>
      )}
    </div>
  );
}
