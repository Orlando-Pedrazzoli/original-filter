/* ══════════════════════════════════════════
   ForgotPasswordForm — Original Filter
   ══════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import { Mail, Loader2, AlertCircle, ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Informe seu email');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao processar solicitação');
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Em dev, mostra o link direto na tela pra facilitar testes
      if (data.devOnly?.resetUrl) {
        setDevUrl(data.devOnly.resetUrl);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Erro inesperado. Tente novamente.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-5">
        <div className="py-4 text-center">
          <div className="mb-4 inline-flex size-14 items-center justify-center bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-7" strokeWidth={2} />
          </div>
          <h3
            className="font-display text-brand-black mb-2 leading-tight font-black"
            style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)' }}
          >
            Solicitação enviada
          </h3>
          <p className="text-brand-iron mx-auto max-w-sm text-sm leading-relaxed">
            Se este email estiver cadastrado, você receberá em instantes um link para criar uma nova
            senha. <strong>Confira seu inbox e a pasta de spam.</strong>
          </p>
        </div>

        {/* Link de dev (só em desenvolvimento) */}
        {devUrl && (
          <div
            className="border border-amber-200 bg-amber-50 p-4 text-xs"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            <div className="font-display mb-2 text-[10px] font-bold tracking-wide text-amber-900 uppercase">
              ⚡ Modo desenvolvimento
            </div>
            <p className="mb-3 text-amber-900">
              Como o servidor SMTP ainda não está configurado, o link aparece direto aqui pra você
              testar:
            </p>
            <a
              href={devUrl}
              className="inline-flex items-center gap-1.5 bg-amber-900 px-3 py-2 font-mono text-[10px] break-all text-amber-50 transition hover:bg-amber-800"
              style={{ borderRadius: 'var(--radius-edge)' }}
            >
              Abrir link de reset
              <ExternalLink className="size-3 shrink-0" />
            </a>
          </div>
        )}

        <div className="border-brand-mist border-t pt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setEmail('');
              setDevUrl(null);
            }}
            className="text-brand-iron hover:text-brand-yellow-deep font-mono text-xs tracking-widest uppercase transition"
          >
            ← Solicitar para outro email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div
          className="flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
          style={{ borderRadius: 'var(--radius-edge)' }}
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <div>{error}</div>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="text-brand-iron mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase"
        >
          Email cadastrado
        </label>
        <div className="relative">
          <Mail className="text-brand-steel pointer-events-none absolute top-3 left-3.5 size-4" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="border-brand-mist focus:border-brand-yellow text-brand-black placeholder:text-brand-steel w-full border bg-white py-2.5 pr-3 pl-10 text-sm transition-colors outline-none"
            style={{ borderRadius: 'var(--radius-edge)' }}
            disabled={loading}
            required
            autoFocus
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-brand-black text-brand-yellow hover:bg-brand-graphite font-display inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-xs font-bold tracking-wide uppercase transition disabled:cursor-wait disabled:opacity-50"
        style={{ borderRadius: 'var(--radius-edge)' }}
      >
        {loading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            Enviar link de recuperação
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </>
        )}
      </button>
    </form>
  );
}
