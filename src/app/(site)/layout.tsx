/* ══════════════════════════════════════════
   Layout do grupo (site) — páginas públicas
   ──────────────────────────────────────────
   Envolve todas as páginas exceto /admin/*.
   - Navbar (3 níveis: topbar institucional + search inline + nav links)
   - Footer (institucional)
   - WhatsApp button (CTA flutuante)
   ══════════════════════════════════════════ */

import { Navbar } from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import WhatsAppButton from '@/components/layout/whatsapp-button';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-snow flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
