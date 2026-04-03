import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
}

export default function PageHeader({ title, subtitle, breadcrumbs }: PageHeaderProps) {
  return (
    <section className="bg-dark relative overflow-hidden py-16 md:py-24">
      {/* Diagonal accent */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-brand/10 absolute -top-20 -right-20 h-80 w-80 rotate-45" />
        <div className="bg-brand/5 absolute -bottom-10 -left-10 h-60 w-60 rotate-12" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,215,0,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container-custom relative z-10">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="text-muted mb-6 flex items-center gap-1.5 text-sm"
          >
            <Link href="/" className="hover:text-brand transition-colors">
              Home
            </Link>
            {breadcrumbs.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5" />
                {item.href ? (
                  <Link href={item.href} className="hover:text-brand transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-brand">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1 className="font-heading text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && <p className="text-muted mt-4 max-w-2xl text-lg md:text-xl">{subtitle}</p>}

        {/* Brand accent line */}
        <div className="bg-brand mt-6 h-1 w-16 rounded-full" />
      </div>
    </section>
  );
}
