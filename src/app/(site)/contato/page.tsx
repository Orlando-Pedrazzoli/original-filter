'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import { CONTACT, CONTACT_SUBJECTS } from '@/lib/constants';

// Metadata must be in a separate layout or use generateMetadata in a server component
// For client components, metadata is handled via the parent layout or a head.tsx file

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

const CONTACT_INFO = [
  {
    icon: Phone,
    label: 'SAC (Ligação gratuita)',
    value: CONTACT.sac,
    href: `tel:${CONTACT.sac.replace(/\s/g, '')}`,
  },
  {
    icon: Phone,
    label: 'Telefone',
    value: CONTACT.phone,
    href: `tel:${CONTACT.phone.replace(/\s/g, '')}`,
  },
  {
    icon: Mail,
    label: 'E-mail',
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
  },
  {
    icon: MapPin,
    label: 'Localização',
    value: CONTACT.address,
    href: null,
  },
];

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim() || data.name.trim().length < 3) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    errors.email = 'Insira um e-mail válido.';
  }

  if (data.phone && data.phone.replace(/\D/g, '').length < 10) {
    errors.phone = 'Telefone deve ter pelo menos 10 dígitos.';
  }

  if (!data.subject) {
    errors.subject = 'Selecione um assunto.';
  }

  if (!data.message.trim() || data.message.trim().length < 10) {
    errors.message = 'Mensagem deve ter pelo menos 10 caracteres.';
  }

  return errors;
}

export default function ContatoPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validation = validateForm(formData);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setStatus('loading');
    setErrors({});

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Erro ao enviar mensagem.');

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <PageHeader
        title="Contato"
        subtitle="Queremos ouvir você! Envie suas dúvidas, elogios, sugestões ou solicite um orçamento."
        breadcrumbs={[{ label: 'Contato' }]}
      />

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* ── Formulário ── */}
            <div className="lg:col-span-3">
              <h2 className="font-heading text-dark text-2xl font-bold">Envie uma mensagem</h2>
              <p className="text-muted-dark mt-2">
                Preencha o formulário abaixo e retornaremos o mais breve possível.
              </p>

              {/* Success state */}
              {status === 'success' && (
                <div className="bg-success/10 mt-6 flex items-start gap-3 rounded-xl p-4">
                  <CheckCircle2 className="text-success mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-success font-semibold">Mensagem enviada!</p>
                    <p className="text-success/80 mt-1 text-sm">
                      Obrigado pelo contato. Retornaremos em até 48 horas úteis.
                    </p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {status === 'error' && (
                <div className="bg-danger/10 mt-6 flex items-start gap-3 rounded-xl p-4">
                  <AlertCircle className="text-danger mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-danger font-semibold">Erro ao enviar</p>
                    <p className="text-danger/80 mt-1 text-sm">
                      Tente novamente ou entre em contato pelo SAC {CONTACT.sac}.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Nome */}
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="text-dark block text-sm font-medium">
                      Nome completo <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`text-dark placeholder:text-muted focus:border-brand focus:ring-brand/20 mt-1.5 w-full rounded-lg border bg-white px-4 py-3 text-sm transition-colors outline-none focus:ring-2 ${
                        errors.name ? 'border-danger' : 'border-surface-alt'
                      }`}
                      placeholder="Seu nome completo"
                    />
                    {errors.name && <p className="text-danger mt-1 text-xs">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="text-dark block text-sm font-medium">
                      E-mail <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`text-dark placeholder:text-muted focus:border-brand focus:ring-brand/20 mt-1.5 w-full rounded-lg border bg-white px-4 py-3 text-sm transition-colors outline-none focus:ring-2 ${
                        errors.email ? 'border-danger' : 'border-surface-alt'
                      }`}
                      placeholder="seu@email.com"
                    />
                    {errors.email && <p className="text-danger mt-1 text-xs">{errors.email}</p>}
                  </div>

                  {/* Telefone */}
                  <div>
                    <label htmlFor="phone" className="text-dark block text-sm font-medium">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`text-dark placeholder:text-muted focus:border-brand focus:ring-brand/20 mt-1.5 w-full rounded-lg border bg-white px-4 py-3 text-sm transition-colors outline-none focus:ring-2 ${
                        errors.phone ? 'border-danger' : 'border-surface-alt'
                      }`}
                      placeholder="(11) 99999-9999"
                    />
                    {errors.phone && <p className="text-danger mt-1 text-xs">{errors.phone}</p>}
                  </div>

                  {/* Assunto */}
                  <div className="sm:col-span-2">
                    <label htmlFor="subject" className="text-dark block text-sm font-medium">
                      Assunto <span className="text-danger">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`text-dark focus:border-brand focus:ring-brand/20 mt-1.5 w-full rounded-lg border bg-white px-4 py-3 text-sm transition-colors outline-none focus:ring-2 ${
                        errors.subject ? 'border-danger' : 'border-surface-alt'
                      } ${!formData.subject ? 'text-muted' : ''}`}
                    >
                      <option value="">Selecione uma opção</option>
                      {CONTACT_SUBJECTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    {errors.subject && <p className="text-danger mt-1 text-xs">{errors.subject}</p>}
                  </div>

                  {/* Mensagem */}
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="text-dark block text-sm font-medium">
                      Mensagem <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className={`text-dark placeholder:text-muted focus:border-brand focus:ring-brand/20 mt-1.5 w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm transition-colors outline-none focus:ring-2 ${
                        errors.message ? 'border-danger' : 'border-surface-alt'
                      }`}
                      placeholder="Descreva sua dúvida, sugestão ou solicitação..."
                    />
                    {errors.message && <p className="text-danger mt-1 text-xs">{errors.message}</p>}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={status === 'loading'}
                  className="bg-brand text-dark hover:bg-brand-hover mt-6 inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Mensagem
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── Sidebar: Info de Contato ── */}
            <aside className="lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                {/* Contact cards */}
                <div className="border-surface-alt rounded-2xl border bg-white p-6">
                  <h3 className="font-heading text-dark text-lg font-bold">
                    Informações de contato
                  </h3>
                  <div className="mt-6 space-y-5">
                    {CONTACT_INFO.map((item) => (
                      <div key={item.label} className="flex gap-3">
                        <div className="bg-brand/10 text-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-muted text-xs font-medium tracking-wider uppercase">
                            {item.label}
                          </p>
                          {item.href ? (
                            <a
                              href={item.href}
                              className="text-dark hover:text-brand text-sm font-semibold transition-colors"
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p className="text-dark text-sm font-semibold">{item.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Horário */}
                <div className="border-surface-alt rounded-2xl border bg-white p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand/10 text-brand flex h-10 w-10 items-center justify-center rounded-lg">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted text-xs font-medium tracking-wider uppercase">
                        Horário de Atendimento
                      </p>
                      <p className="text-dark text-sm font-semibold">Seg a Sex — 8h às 18h</p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <a
                  href={CONTACT.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] p-4 font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Falar pelo WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
