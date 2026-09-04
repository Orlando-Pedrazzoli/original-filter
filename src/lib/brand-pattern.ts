// src/lib/brand-pattern.ts
/* ══════════════════════════════════════════
   Padrão de "O"s do logotipo — Original Filter
   ──────────────────────────────────────────
   Fonte única do padrão de marca (SVG inline como data URI),
   exportado como objetos de estilo para uso via style={...}.

   IMPORTANTE: usamos inline style (e não classe CSS custom) de
   propósito — classes customizadas em @layer no Tailwind v4 +
   Next 16/Turbopack se mostraram não confiáveis (somem em dev
   sem restart e já falharam em produção noutros projetos).
   Inline style é imune a isso.

   Uso:
     <div aria-hidden className="pointer-events-none absolute inset-0"
          style={O_PATTERN_DARK} />           // seções pretas
     <section style={O_PATTERN_LIGHT}>...</section>  // seções brancas
   ══════════════════════════════════════════ */

import type { CSSProperties } from 'react';

/** Gera o tile SVG dos "O"s (linhas intercaladas) com a cor/opacidade dadas. */
function buildTile(stroke: string, strokeOpacity: number): string {
  const rects = [
    // [x externo, y externo] de cada "O"; interno é derivado (+8, +9)
    [4, 4],
    [38, 4],
    [21, 46],
    [-13, 46],
    [55, 46],
  ]
    .map(
      ([x, y]) =>
        `%3Crect x='${x}' y='${y}' width='26' height='34' rx='10'/%3E` +
        `%3Crect x='${x + 8}' y='${y + 9}' width='10' height='16' rx='5'/%3E`,
    )
    .join('');

  return (
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' ` +
    `width='68' height='84' viewBox='0 0 68 84'%3E` +
    `%3Cg fill='none' stroke='%23${stroke}' stroke-opacity='${strokeOpacity}' stroke-width='1.5'%3E` +
    `${rects}%3C/g%3E%3C/svg%3E")`
  );
}

/** "O"s amarelos sutis — para seções de fundo preto. */
export const O_PATTERN_DARK: CSSProperties = {
  backgroundImage: buildTile('FFD700', 0.095),
  backgroundSize: '68px 84px',
};

/** "O"s cinza discretos — para seções de fundo branco/claro. */
export const O_PATTERN_LIGHT: CSSProperties = {
  backgroundImage: buildTile('121212', 0.09),
  backgroundSize: '68px 84px',
};
