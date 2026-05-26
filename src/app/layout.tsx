/* ══════════════════════════════════════════
   Original Filter — Layout Root
   ──────────────────────────────────────────
   Aplica as fontes (Archivo + Geist + JetBrains Mono) via CSS variables.
   Não substitua sem cuidar dos providers atuais do projeto.
   ══════════════════════════════════════════ */

import type { Metadata, Viewport } from 'next';
import { fontVariables } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Original Filter — Qualidade Superior em Filtros Automotivos e Sensores',
    template: '%s | Original Filter',
  },
  description:
    'Fabricante brasileira especializada em filtros automotivos, agrícolas, industriais e ' +
    'fora-de-estrada, com Centro de Pesquisa e Desenvolvimento próprio. Linha completa de filtros ' +
    'de reposição para Volvo, Scania, Mercedes-Benz, DAF, Caterpillar e mais 17 montadoras.',
  metadataBase: new URL('https://originalfilter.com'),
  manifest: '/images/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/images/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Original Filter',
    title: 'Original Filter — Qualidade Superior em Filtros Automotivos e Sensores',
    description: 'Especialista em filtros automotivos, agrícolas, industriais e fora-de-estrada.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fontVariables}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
