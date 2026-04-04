/* ══════════════════════════════════════════
   Original Filter — Coming Soon Component
   ══════════════════════════════════════════
   Componente reutilizável para páginas em construção.
   Usado por: /conta/*, /carrinho
   ══════════════════════════════════════════ */

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

export default function ComingSoon({
  icon: Icon,
  title,
  description,
  features,
  ctaLabel = 'Voltar ao início',
  ctaHref = '/',
}: ComingSoonProps) {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="bg-brand/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
          <Icon className="text-brand-dark h-10 w-10" />
        </div>

        {/* Badge */}
        <span className="bg-brand/10 text-brand-dark mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
          Em breve
        </span>

        {/* Title */}
        <h1 className="text-dark mb-3 text-3xl font-bold">{title}</h1>

        {/* Description */}
        <p className="text-muted-dark mx-auto mb-8 max-w-md text-base leading-relaxed">
          {description}
        </p>

        {/* Feature list */}
        {features && features.length > 0 && (
          <div className="bg-surface mx-auto mb-8 max-w-sm rounded-xl p-6 text-left">
            <p className="text-dark mb-3 text-sm font-bold">O que está a caminho:</p>
            <ul className="space-y-2.5">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <span className="bg-brand mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                  <span className="text-muted-dark">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={ctaHref}
            className="bg-brand text-dark hover:bg-brand-hover rounded-lg px-6 py-3 text-sm font-bold transition-colors"
          >
            {ctaLabel}
          </Link>
          <Link
            href="/contato"
            className="text-muted-dark hover:text-dark rounded-lg px-6 py-3 text-sm font-medium transition-colors"
          >
            Fale conosco
          </Link>
        </div>
      </div>
    </section>
  );
}
