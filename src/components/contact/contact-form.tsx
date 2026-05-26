/* ══════════════════════════════════════════
   ContactForm — Original Filter
   ──────────────────────────────────────────
   Formulário de contato com:
   - Suporte a query params ?assunto=, ?produto=, ?codigo= (pré-preenche)
   - Honeypot anti-spam
   - Estados: idle / submitting / success / error
   - Validação client-side simples
   - Sem dependências extras (sem react-hook-form, sem zod)
   ══════════════════════════════════════════ */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  Hash,
} from 'lucide-react';

const SUBJECT_OPTIONS = [
  { value: 'comercial', label: 'Atendimento Comercial' },
  { value: 'tecnico', label: 'Suporte Técnico' },
  { value: 'garantia', label: 'Solicitação de Garantia' },
  { value: 'logistica-reversa', label: 'Logística Reversa' },
  { value: 'programa-devolucao', label: 'Programa de Devolução' },
  { value: 'revendedor', label: 'Programa de Revendedor' },
  { value: 'cross_reference', label: 'Conversão de Código (Cross-Reference)' },
  { value: 'outro', label: 'Outro Assunto' },
];

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FormData {
  subject: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  website: string; // honeypot
}

export function ContactForm() {
  const sp = useSearchParams();

  // Captura query params para pré-preencher
  const ctx = useMemo(() => {
    return {
      assunto: sp.get('assunto') ?? '',
      produto: sp.get('produto') ?? '',
      codigo: sp.get('codigo') ?? '',
    };
  }, [sp]);

  // Pré-preenche assunto e adiciona contexto na mensagem
  const [formData, setFormData] = useState<FormData>({
    subject: ctx.assunto || 'comercial',
    name: '',
    company: '',
    email: '',
    phone: '',
    message: buildInitialMessage(ctx),
    website: '',
  });

  const [state, setState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Atualiza mensagem inicial se o contexto mudar (raro mas possível)
  useEffect(() => {
    if (ctx.produto || ctx.codigo) {
      setFormData((d) => ({
        ...d,
        subject: ctx.assunto || (ctx.codigo ? 'cross_reference' : d.subject),
        message: buildInitialMessage(ctx),
      }));
    }
  }, [ctx]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((d) => ({ ...d, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (formData.name.trim().length < 2) {
      errors.name = 'Informe seu nome completo';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Email inválido';
    }
    if (formData.message.trim().length < 10) {
      errors.message = 'Mensagem muito curta (mínimo 10 caracteres)';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    setState('submitting');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formData.subject,
          name: formData.name.trim(),
          company: formData.company.trim() || undefined,
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          message: formData.message.trim(),
          website: formData.website, // honeypot
          context: {
            produto: ctx.produto || undefined,
            codigo: ctx.codigo || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? 'Erro ao enviar mensagem.');
      }

      setState('success');
      // Reset parcial (mantém o assunto, limpa o resto)
      setFormData({
        subject: formData.subject,
        name: '',
        company: '',
        email: '',
        phone: '',
        message: '',
        website: '',
      });
    } catch (err) {
      setState('error');
      setErrorMessage((err as Error).message);
    }
  }

  // Tela de sucesso
  if (state === 'success') {
    return (
      <div
        className="bg-brand-white border-brand-mist flex flex-col items-center border p-8 text-center md:p-10"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        <div className="bg-brand-yellow text-brand-black mb-5 flex size-16 items-center justify-center">
          <CheckCircle2 className="size-8" strokeWidth={2} />
        </div>
        <div className="text-brand-yellow-deep mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
          Mensagem enviada
        </div>
        <h3
          className="font-display text-brand-black mb-3 leading-tight font-black"
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            letterSpacing: '-0.025em',
          }}
        >
          Obrigado pelo contato!
        </h3>
        <p className="text-brand-iron mb-6 max-w-md leading-relaxed">
          Recebemos sua mensagem e nossa equipe entrará em contato em breve. Confirmação enviada
          para o email informado.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="font-display text-brand-iron hover:text-brand-yellow-deep inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase transition"
        >
          Enviar outra mensagem →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Honeypot (invisível para humanos, bots preenchem) */}
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

      {/* Contexto vindo de outra página (badge) */}
      {(ctx.produto || ctx.codigo) && (
        <div
          className="bg-brand-yellow/10 border-brand-yellow-deep/30 flex items-start gap-3 border px-4 py-3"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <Hash className="text-brand-yellow-deep mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
          <div className="text-sm">
            <div className="text-brand-yellow-deep mb-0.5 font-mono text-[10px] tracking-[0.22em] uppercase">
              Contexto da consulta
            </div>
            {ctx.produto && (
              <div className="text-brand-black font-mono">
                <span className="text-brand-iron">Produto:</span> <strong>{ctx.produto}</strong>
              </div>
            )}
            {ctx.codigo && (
              <div className="text-brand-black font-mono">
                <span className="text-brand-iron">Código pesquisado:</span>{' '}
                <strong>{ctx.codigo}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assunto */}
      <Field label="Assunto" required>
        <select
          value={formData.subject}
          onChange={(e) => update('subject', e.target.value)}
          className="border-brand-mist focus:border-brand-yellow text-brand-black w-full cursor-pointer appearance-none border bg-white px-4 py-3 pr-10 text-[15px] leading-normal transition-colors outline-none"
          style={{ borderRadius: 'var(--radius-edge)' }}
          required
        >
          {SUBJECT_OPTIONS.map((o) => (
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Field>

      {/* Nome */}
      <Field label="Nome completo" required error={fieldErrors.name}>
        <User className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
        <input
          type="text"
          value={formData.name}
          onChange={(e) => update('name', e.target.value)}
          className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-3 pr-4 pl-10 text-[15px] leading-normal transition-colors outline-none"
          style={{ borderRadius: 'var(--radius-edge)' }}
          placeholder="Seu nome"
          autoComplete="name"
          required
          minLength={2}
        />
      </Field>

      {/* Empresa */}
      <Field label="Empresa (opcional)">
        <Building2 className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
        <input
          type="text"
          value={formData.company}
          onChange={(e) => update('company', e.target.value)}
          className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-3 pr-4 pl-10 text-[15px] leading-normal transition-colors outline-none"
          style={{ borderRadius: 'var(--radius-edge)' }}
          placeholder="Nome da empresa, oficina ou frota"
          autoComplete="organization"
        />
      </Field>

      {/* Email + telefone (grid 2 colunas em desktop) */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Email" required error={fieldErrors.email}>
          <Mail className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => update('email', e.target.value)}
            className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-3 pr-4 pl-10 text-[15px] leading-normal transition-colors outline-none"
            style={{ borderRadius: 'var(--radius-edge)' }}
            placeholder="seu@email.com"
            autoComplete="email"
            required
          />
        </Field>
        <Field label="Telefone (opcional)">
          <Phone className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-3 pr-4 pl-10 text-[15px] leading-normal transition-colors outline-none"
            style={{ borderRadius: 'var(--radius-edge)' }}
            placeholder="(11) 98765-4321"
            autoComplete="tel"
          />
        </Field>
      </div>

      {/* Mensagem */}
      <Field label="Mensagem" required error={fieldErrors.message}>
        <MessageSquare className="text-brand-steel pointer-events-none absolute top-3.5 left-3.5 size-4" />
        <textarea
          value={formData.message}
          onChange={(e) => update('message', e.target.value)}
          rows={6}
          className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel min-h-[140px] w-full resize-y border bg-white py-3 pr-4 pl-10 text-[15px] leading-normal transition-colors outline-none"
          style={{ borderRadius: 'var(--radius-edge)' }}
          placeholder="Descreva sua solicitação com detalhes. Quanto mais informações, melhor podemos ajudar."
          required
          minLength={10}
        />
      </Field>

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

      {/* Submit + disclaimer */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {state === 'submitting' ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Enviar mensagem
            </>
          )}
        </button>
        <p className="text-brand-steel mt-4 text-xs leading-relaxed">
          Ao enviar, você concorda com o tratamento dos dados pessoais conforme nossa política de
          privacidade. Não compartilhamos seus dados com terceiros.
        </p>
      </div>
    </form>
  );
}

// ══════════════════════════════════════════
//   Field wrapper
// ══════════════════════════════════════════
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
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

// ══════════════════════════════════════════
//   Helper: gera mensagem inicial baseada no contexto
// ══════════════════════════════════════════
function buildInitialMessage(ctx: { produto?: string; codigo?: string; assunto?: string }): string {
  if (ctx.produto) {
    return `Olá, gostaria de mais informações sobre o produto ${ctx.produto}.\n\n`;
  }
  if (ctx.codigo) {
    return `Olá, pesquisei o código ${ctx.codigo} no cross-reference e gostaria de confirmar a equivalência Original Filter para minha aplicação.\n\nDescreva sua aplicação:\n- Veículo / equipamento:\n- Aplicação:\n\n`;
  }
  if (ctx.assunto === 'garantia') {
    return `Olá, gostaria de acionar a garantia de um produto Original Filter.\n\nDados do produto:\n- SKU/código:\n- Data de aquisição:\n- Descrição da falha:\n\n`;
  }
  if (ctx.assunto === 'revendedor') {
    return `Olá, tenho interesse no programa de revenda Original Filter.\n\nDados da minha empresa:\n- Nome/Razão social:\n- Região de atuação:\n- Tipo de negócio (distribuidor, oficina, frota):\n\n`;
  }
  if (ctx.assunto === 'logistica-reversa' || ctx.assunto === 'programa-devolucao') {
    return `Olá, tenho interesse em participar da logística reversa Original Filter.\n\nDados:\n- Tipo de operação:\n- Volume médio mensal de filtros usados:\n- Localização:\n\n`;
  }
  return '';
}
