/* ══════════════════════════════════════════
   PageHeader — Alias de retrocompatibilidade
   ──────────────────────────────────────────
   ATENÇÃO: este arquivo existe APENAS para manter funcionando as páginas
   institucionais antigas (/sobre, /qualidade, /sustentabilidade, /contato,
   /garantia) que importam de '@/components/shared/page-header'.

   O componente real é o PageHero em ./page-hero.tsx. Quando essas páginas
   antigas forem reescritas com a nova identidade visual, este arquivo
   pode ser deletado.
   ══════════════════════════════════════════ */

export { PageHero as default } from './page-hero';
export * from './page-hero';
