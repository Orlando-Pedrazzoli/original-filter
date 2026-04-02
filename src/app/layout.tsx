import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Original Filter | Especialista em Filtros Automotivos',
    template: '%s | Original Filter',
  },
  description:
    'Líder no mercado de autopeças, especializada em filtros automotivos, agrícolas, industriais e fora-de-estrada. Filtros de ar, óleo, combustível, hidráulicos e mais.',
  keywords: [
    'filtros automotivos',
    'filtro de ar',
    'filtro de óleo',
    'filtro de combustível',
    'filtro hidráulico',
    'filtro secador de ar',
    'filtro de arrefecimento',
    'Original Filter',
    'filtros para caminhão',
    'filtros agrícolas',
    'filtros industriais',
    'autopeças',
    'Scania',
    'Volvo',
    'Mercedes-Benz',
    'Volkswagen',
    'DAF',
  ],
  authors: [{ name: 'Original Filter' }],
  creator: 'Pedrazzoli Digital',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://originalfilter.com'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Original Filter',
    title: 'Original Filter | Especialista em Filtros Automotivos',
    description:
      'Filtros automotivos, agrícolas e industriais de alta qualidade. Catálogo completo com mais de 481 produtos.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
