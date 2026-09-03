// src/lib/code-normalize.ts
/* ══════════════════════════════════════════
   Original Filter — Normalização de Códigos
   ══════════════════════════════════════════
   Fonte única de verdade para normalizar códigos de filtros
   (SKUs OF, códigos de concorrentes e OEMs de montadoras).

   Regra: uppercase + remoção de espaços, hífens, underscores,
   pontos e barras. Assim 'W 1170', 'w-1170' e 'W1170' colidem
   no mesmo valor e a busca cruzada encontra qualquer grafia.

   Usado por:
   - scripts/seed-cross-references.ts (importação da planilha)
   - /api/products/cross-reference (busca — adotar na próxima revisão,
     hoje a rota tem cópia local idêntica desta função)
   ══════════════════════════════════════════ */

export function normalizeCode(s: string): string {
  return s
    .trim()
    .toUpperCase()
    .replace(/[\s\-_./]+/g, '');
}
