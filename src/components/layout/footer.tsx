// src/components/layout/footer.tsx
/* ══════════════════════════════════════════
   Footer — Original Filter
   ──────────────────────────────────────────
   Estilo industrial-editorial alinhado com o restante do site:
   - Hero statement com slogan oficial completo
   - Grid de 4 colunas (Empresa · Catálogo · Buscar · Contato)
   - Faixa de certificações (IATF / QS / ISO)
   - Bottom bar com cadeado admin discreto
   ══════════════════════════════════════════ */

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Lock, Headphones, ArrowUpRight, Award } from 'lucide-react';
import { CONTACT, CERTIFICATIONS } from '@/lib/constants';
import { O_PATTERN_DARK } from '@/lib/brand-pattern';

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

// ══════ Estrutura dos links ══════
const COMPANY_LINKS = [
  { label: 'Quem somos', href: '/sobre' },
  { label: 'Política de qualidade', href: '/qualidade' },
  { label: 'Sustentabilidade', href: '/sustentabilidade' },
  { label: 'Política de garantia', href: '/garantia' },
  { label: 'Seja revendedor', href: '/seja-revendedor', highlight: true },
];

const CATALOG_LINKS = [
  { label: 'Catálogo completo', href: '/produtos' },
  { label: 'Linha patenteada', href: '/produtos?patenteado=true' },
  { label: 'Lançamentos', href: '/lancamentos' },
  { label: 'Linha rodoviária', href: '/produtos?linha=rodoviario' },
  { label: 'Linha agrícola', href: '/produtos?linha=agricola' },
  { label: 'Sensores NOx', href: '/produtos?tipo=sensor' },
];

const SEARCH_LINKS = [
  {
    label: 'Buscar por veículo',
    href: '/buscar-por-veiculo',
    description: 'Marca · modelo · motor',
  },
  {
    label: 'Cross-reference',
    href: '/cross-reference',
    description: 'Conversor de filtros',
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-black relative overflow-hidden text-white">
      {/* Faixa amarela no topo */}
      <div className="bg-brand-yellow h-1 w-full" />

      {/* Grid blueprint sutil */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={O_PATTERN_DARK} />

      <div className="relative mx-auto max-w-7xl px-4 md:px-12">
        {/* ══════ 1. Hero statement ══════ */}
        <section className="border-b border-white/10 pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Logo + slogan */}
            <div className="lg:col-span-7">
              <Link href="/" className="group mb-6 inline-flex items-center">
                <Image
                  src="/images/logo-originalfilter.png"
                  alt="Original Filter"
                  width={160}
                  height={64}
                  className="h-12 w-auto"
                />
              </Link>

              <div className="mb-4 flex items-center gap-3">
                <div className="bg-brand-yellow h-px w-8" />
                <span className="text-brand-yellow font-mono text-[11px] tracking-[0.25em] uppercase">
                  Especialista em filtros
                </span>
              </div>

              <h2
                className="font-display max-w-xl leading-[0.95] font-black tracking-tight"
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.035em',
                }}
              >
                Qualidade Superior em
                <br />
                <span className="text-brand-yellow">Filtros Automotivos e Sensores.</span>
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/60 md:text-base">
                Linha completa de reposição para aplicações automotivas, agrícolas, industriais e
                fora-de-estrada. Centro de Pesquisa & Desenvolvimento próprio em Cotia-SP.
              </p>
            </div>

            {/* Contato em destaque (lado direito) */}
            <div className="lg:col-span-5 lg:border-l lg:border-white/10 lg:pl-8">
              <div className="text-brand-yellow mb-3 font-mono text-[10px] tracking-[0.22em] uppercase">
                Atendimento comercial
              </div>
              <a
                href={`tel:${CONTACT.phoneRaw}`}
                className="hover:text-brand-yellow block font-mono font-bold tracking-tight text-white transition"
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                {CONTACT.phone}
              </a>

              <div className="mt-4 space-y-2.5">
                <a
                  href={`tel:${CONTACT.sacRaw}`}
                  className="group flex items-center gap-3 text-sm text-white/70 transition hover:text-white"
                >
                  <Headphones className="text-brand-yellow size-4 shrink-0" strokeWidth={2} />
                  <span>
                    <span className="mr-1.5 font-mono text-[10px] tracking-widest text-white/40 uppercase">
                      SAC
                    </span>
                    <span className="font-mono font-bold">{CONTACT.sac}</span>
                  </span>
                  <ArrowUpRight className="size-3 opacity-0 transition group-hover:opacity-100" />
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="group flex items-center gap-3 text-sm text-white/70 transition hover:text-white"
                >
                  <Mail className="text-brand-yellow size-4 shrink-0" strokeWidth={2} />
                  <span className="font-mono">{CONTACT.email}</span>
                  <ArrowUpRight className="size-3 opacity-0 transition group-hover:opacity-100" />
                </a>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <MapPin className="text-brand-yellow size-4 shrink-0" strokeWidth={2} />
                  <span>{CONTACT.address}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ 2. Grid de links ══════ */}
        <section className="grid grid-cols-2 gap-8 py-12 md:grid-cols-3 md:py-16 lg:grid-cols-12 lg:gap-12">
          {/* A Empresa */}
          <div className="lg:col-span-3">
            <SectionTitle>A Empresa</SectionTitle>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href} highlight={link.highlight}>
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Catálogo */}
          <div className="lg:col-span-3">
            <SectionTitle>Catálogo</SectionTitle>
            <ul className="space-y-2.5">
              {CATALOG_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Buscar */}
          <div className="lg:col-span-3">
            <SectionTitle>Buscar</SectionTitle>
            <ul className="space-y-3">
              {SEARCH_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group block py-1 transition">
                    <div className="group-hover:text-brand-yellow flex items-center gap-1.5 text-sm text-white/80 transition">
                      {link.label}
                      <ArrowUpRight className="size-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] tracking-widest text-white/40 uppercase">
                      {link.description}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Conta / Conexão */}
          <div className="lg:col-span-3">
            <SectionTitle>Minha conta</SectionTitle>
            <ul className="space-y-2.5">
              <li>
                <FooterLink href="/conta/login">Entrar</FooterLink>
              </li>
              <li>
                <FooterLink href="/conta/cadastro">Criar conta</FooterLink>
              </li>
              <li>
                <FooterLink href="/conta">Meus pedidos</FooterLink>
              </li>
              <li>
                <FooterLink href="/carrinho">Carrinho</FooterLink>
              </li>
              <li>
                <FooterLink href="/contato">Fale conosco</FooterLink>
              </li>
            </ul>

            {/* Redes sociais */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="mb-3 font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">
                Acompanhe
              </div>
              <div className="flex gap-2">
                <SocialButton
                  href={CONTACT.facebook}
                  label="Facebook"
                  icon={<FacebookIcon className="size-3.5" />}
                />
                <SocialButton
                  href={CONTACT.instagram}
                  label="Instagram"
                  icon={<InstagramIcon className="size-3.5" />}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══════ 3. Faixa de certificações ══════ */}
        <section className="border-t border-white/10 py-8 md:py-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <Award className="text-brand-yellow size-4 shrink-0" strokeWidth={2} />
              <div className="font-mono text-[10px] tracking-[0.22em] whitespace-nowrap text-white/50 uppercase">
                Auditados por
              </div>
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-2 md:gap-3">
              {CERTIFICATIONS.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-xs font-bold tracking-wider text-white/80"
                  style={{ borderRadius: 'var(--radius-edge)' }}
                >
                  <span className="bg-brand-yellow size-1.5 rounded-full" />
                  {cert}
                </span>
              ))}
            </div>

            <Link
              href="/qualidade"
              className="hover:text-brand-yellow inline-flex items-center gap-1.5 font-mono text-[11px] tracking-widest whitespace-nowrap text-white/50 uppercase transition"
            >
              Política de qualidade
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </section>
      </div>

      {/* ══════ 4. Bottom bar ══════ */}
      <div className="bg-brand-black relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-[11px] sm:flex-row md:px-12">
          <div className="font-mono tracking-widest text-white/40 uppercase">
            © {currentYear} Original Filter · Todos os direitos reservados
          </div>

          <div className="flex items-center gap-5 font-mono tracking-widest text-white/40 uppercase">
            <span>
              Desenvolvido por{' '}
              <a
                href="https://pedrazzolidigital.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-yellow text-white/60 transition"
              >
                Pedrazzoli Digital
              </a>
            </span>

            {/* Cadeado admin — discreto */}
            <Link
              href="/admin/login"
              className="text-white/15 transition hover:text-white/60"
              aria-label="Acesso administrativo"
              title="Acesso administrativo"
            >
              <Lock className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ══════════════════════════════════════════
//   Componentes internos
// ══════════════════════════════════════════
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="bg-brand-yellow h-px w-6" />
        <span className="text-brand-yellow font-mono text-[10px] tracking-[0.22em] uppercase">
          {children}
        </span>
      </div>
    </div>
  );
}

function FooterLink({
  href,
  children,
  highlight,
}: {
  href: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1.5 text-sm transition ${
        highlight
          ? 'text-brand-yellow hover:text-brand-yellow-bright font-semibold'
          : 'text-white/70 hover:text-white'
      }`}
    >
      {highlight && <span className="bg-brand-yellow animate-pulse-yellow size-1.5 rounded-full" />}
      {children}
      <ArrowUpRight className="size-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
    </Link>
  );
}

function SocialButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="hover:bg-brand-yellow hover:border-brand-yellow hover:text-brand-black inline-flex size-9 items-center justify-center border border-white/10 bg-white/5 text-white/70 transition"
      style={{ borderRadius: 'var(--radius-edge)' }}
    >
      {icon}
    </a>
  );
}
