import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { CONTACT, CERTIFICATIONS } from '@/lib/constants';

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

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white">
      <div className="bg-brand h-1 w-full" />

      <div className="container-custom py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Descrição */}
          <div>
            <div className="mb-6 flex flex-col items-start">
              <span className="bg-brand text-dark rounded px-3 py-1 text-lg font-black tracking-wider">
                ORIGINAL
              </span>
              <span className="mt-0.5 text-xs font-medium tracking-[0.2em] text-white">FILTER</span>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Especialistas em filtros automotivos, agrícolas e industriais. Qualidade superior com
              certificações internacionais.
            </p>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATIONS.map((cert) => (
                <span
                  key={cert}
                  className="rounded border border-gray-700 px-2 py-1 text-xs text-gray-400"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Links Institucionais */}
          <div>
            <h3 className="text-brand mb-4 text-sm font-bold tracking-wider uppercase">
              A Empresa
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Sobre Nós', href: '/sobre' },
                { label: 'Política de Qualidade', href: '/qualidade' },
                { label: 'Sustentabilidade', href: '/sustentabilidade' },
                { label: 'Política de Garantia', href: '/garantia' },
                { label: 'Blog', href: '/blog' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-brand text-sm text-gray-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Produtos */}
          <div>
            <h3 className="text-brand mb-4 text-sm font-bold tracking-wider uppercase">Produtos</h3>
            <ul className="space-y-3">
              {[
                { label: 'Catálogo Completo', href: '/produtos' },
                { label: 'Filtro de Ar', href: '/produtos/categoria/filtro-de-ar' },
                { label: 'Filtro de Óleo', href: '/produtos/categoria/filtro-de-oleo' },
                {
                  label: 'Filtro de Combustível',
                  href: '/produtos/categoria/filtro-de-combustivel',
                },
                { label: 'Filtros Hidráulicos', href: '/produtos/categoria/filtro-hidraulico' },
                { label: 'Lançamentos', href: '/lancamentos' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-brand text-sm text-gray-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-brand mb-4 text-sm font-bold tracking-wider uppercase">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="text-brand mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">{CONTACT.phone}</p>
                  <p className="text-xs text-gray-500">SAC: {CONTACT.sac}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-brand h-4 w-4 flex-shrink-0" />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="hover:text-brand text-sm text-gray-400 transition-colors"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="text-brand h-4 w-4 flex-shrink-0" />
                <span className="text-sm text-gray-400">{CONTACT.address}</span>
              </li>
            </ul>

            <div className="mt-6 flex gap-3">
              <a
                href={CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:border-brand hover:text-brand flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 text-gray-400 transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:border-brand hover:text-brand flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 text-gray-400 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container-custom flex flex-col items-center justify-between gap-2 py-6 text-xs text-gray-500 sm:flex-row">
          <p>&copy; {currentYear} Original Filter. Todos os direitos reservados.</p>
          <p>
            Desenvolvido por{' '}
            <a
              href="https://pedrazzolidigital.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand text-gray-400 transition-colors"
            >
              Pedrazzoli Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
