/* ══════════════════════════════════════════
   AccountAuthLayout — Original Filter
   ──────────────────────────────────────────
   Layout dividido (split) usado em login, cadastro,
   recuperar e resetar senha. Estilo industrial-editorial.

   - Esquerda: hero preto com gráfico + frase institucional
   - Direita: form em fundo branco

   Em mobile, hero some e fica só o form em fundo snow.
   ══════════════════════════════════════════ */

import Link from 'next/link';
import { ArrowLeft, Shield, Truck, Tag } from 'lucide-react';

interface AccountAuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Texto e link do footer (ex: "Não tem conta? Cadastre-se") */
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}

export function AccountAuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AccountAuthLayoutProps) {
  return (
    <div className="grid min-h-[calc(100vh-200px)] grid-cols-1 lg:grid-cols-12">
      {/* ─── Hero lado esquerdo (escondido em mobile) ─── */}
      <aside className="bg-brand-black relative hidden overflow-hidden text-white lg:col-span-5 lg:flex">
        {/* Grid pattern decorativo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Faixa amarela vertical */}
        <div className="bg-brand-yellow absolute top-0 bottom-0 left-0 w-1" />

        <div className="relative mx-auto flex w-full max-w-md flex-col justify-between px-12 py-16">
          <div>
            <Link
              href="/"
              className="hover:text-brand-yellow mb-12 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-white/50 uppercase transition"
            >
              <ArrowLeft className="size-3" />
              Voltar ao site
            </Link>

            <div className="mb-8">
              <div className="text-brand-yellow mb-4 font-mono text-[10px] tracking-[0.25em] uppercase">
                Original Filter
              </div>
              <h2
                className="font-display leading-[0.9] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                  letterSpacing: '-0.035em',
                }}
              >
                Qualidade superior
                <br />
                <span className="text-brand-yellow">em cada filtro.</span>
              </h2>
            </div>

            <ul className="space-y-4 text-sm">
              <BenefitLine
                icon={<Shield className="size-4" strokeWidth={2} />}
                title="Auditoria IATF 16949"
                description="Produtos certificados pelas normas mais rigorosas"
              />
              <BenefitLine
                icon={<Tag className="size-4" strokeWidth={2} />}
                title="Programa B2B"
                description="Descontos exclusivos para revendedores aprovados"
              />
              <BenefitLine
                icon={<Truck className="size-4" strokeWidth={2} />}
                title="Centro de P&D em Cotia"
                description="Logística rápida para todo o Brasil"
              />
            </ul>
          </div>

          <div className="font-mono text-[10px] tracking-widest text-white/30 uppercase">
            © {new Date().getFullYear()} Original Filter · Cotia/SP
          </div>
        </div>
      </aside>

      {/* ─── Form lado direito ─── */}
      <main className="bg-brand-snow flex items-start justify-center px-4 py-10 lg:col-span-7 lg:items-center lg:py-20">
        <div className="w-full max-w-md">
          {/* Voltar (apenas mobile) */}
          <Link
            href="/"
            className="text-brand-iron hover:text-brand-yellow-deep mb-8 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase transition lg:hidden"
          >
            <ArrowLeft className="size-3" />
            Voltar ao site
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="text-brand-yellow-deep mb-3 font-mono text-[10px] tracking-[0.25em] uppercase">
              Conta do cliente
            </div>
            <h1
              className="font-display text-brand-black leading-[0.95] font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                letterSpacing: '-0.035em',
              }}
            >
              {title}
              <span className="text-brand-yellow-deep">.</span>
            </h1>
            {subtitle && <p className="text-brand-iron mt-2 leading-relaxed">{subtitle}</p>}
          </div>

          {/* Conteúdo */}
          <div
            className="bg-brand-white border-brand-mist border p-6 md:p-8"
            style={{ borderRadius: 'var(--radius-edge)' }}
          >
            {children}
          </div>

          {/* Footer */}
          {footerText && footerLinkHref && footerLinkText && (
            <div className="text-brand-iron mt-6 text-center text-sm">
              {footerText}{' '}
              <Link
                href={footerLinkHref}
                className="font-display text-brand-yellow-deep font-bold underline-offset-2 hover:underline"
              >
                {footerLinkText}
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function BenefitLine({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="bg-brand-yellow text-brand-black inline-flex size-9 shrink-0 items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="font-display text-sm font-bold text-white">{title}</div>
        <div className="mt-0.5 text-xs text-white/60">{description}</div>
      </div>
    </li>
  );
}
