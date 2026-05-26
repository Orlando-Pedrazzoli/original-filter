/* ══════════════════════════════════════════
   Original Filter — Fontes do Projeto
   ──────────────────────────────────────────
   Sistema tipográfico industrial-editorial:
   - Archivo: títulos display (geometria precisa, peso)
   - Geist: body / UI (mecânica, ótima em alta densidade)
   - JetBrains Mono: SKUs e códigos OEM (técnico)
   ══════════════════════════════════════════ */

import { Archivo, Geist, JetBrains_Mono } from 'next/font/google';

export const fontDisplay = Archivo({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const fontBody = Geist({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

/** Use em <html className={fontVariables}> para disponibilizar todas. */
export const fontVariables = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`;
