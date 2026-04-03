/* ══════════════════════════════════════════
   Original Filter — Constantes do Projeto
   ══════════════════════════════════════════ */

import type { NavItem } from '@/types';

// ── Marca ──
export const BRAND = {
  name: 'Original Filter',
  slogan: 'Filtrando o futuro.',
  yellow: '#FFD700',
  yellowLight: '#FFDE00',
  black: '#000000',
  blackSoft: '#1A1A1A',
  white: '#FFFFFF',
  grayLight: '#F5F5F5',
  grayMid: '#9CA3AF',
  grayDark: '#4B5563',
  red: '#DC2626',
} as const;

// ── Contato ──
export const CONTACT = {
  phone: '+55 11 4613-3454',
  whatsapp: '+5511461334554',
  whatsappLink: 'https://wa.me/5511461334554',
  sac: '0800 778 2000',
  email: 'contato@originalfilter.com',
  address: 'Cotia, SP — Brasil',
  facebook: 'https://www.facebook.com/originalfilter',
  instagram: 'https://www.instagram.com/originalfilter',
} as const;

// ── Linhas de Produto (por aplicação) ──
export const PRODUCT_LINES = [
  { name: 'Transporte', slug: 'transporte', count: 481 },
  { name: 'Agrícola', slug: 'agricola', count: 146 },
  { name: 'Máquinas e Equipamentos', slug: 'maquinas-e-equipamentos', count: 143 },
  { name: 'Automóveis', slug: 'automoveis', count: 0 },
  { name: 'Vans e Utilitários', slug: 'vans-e-utilitarios', count: 0 },
  { name: 'Pick-up', slug: 'pick-up', count: 0 },
] as const;

// ── Categorias de Filtro (tipos) ──
export const FILTER_CATEGORIES = [
  { name: 'Filtro de Ar', slug: 'filtro-de-ar', icon: 'wind' },
  { name: 'Filtro de Ar de Segurança', slug: 'filtro-de-ar-seguranca', icon: 'shield' },
  { name: 'Filtro de Óleo', slug: 'filtro-de-oleo', icon: 'droplets' },
  { name: 'Filtro de Óleo 2º', slug: 'filtro-de-oleo-2', icon: 'droplets' },
  { name: 'Filtro de Combustível', slug: 'filtro-de-combustivel', icon: 'fuel' },
  { name: 'Filtro de Combustível 2º', slug: 'filtro-de-combustivel-2', icon: 'fuel' },
  { name: 'Filtro Separador', slug: 'filtro-separador', icon: 'filter' },
  { name: 'By-Pass', slug: 'by-pass', icon: 'git-branch' },
  { name: 'Filtro Hidráulico', slug: 'filtro-hidraulico', icon: 'gauge' },
  { name: 'Filtro Dir. Hidráulica', slug: 'filtro-direcao-hidraulica', icon: 'gauge' },
  { name: 'Filtro de Cabine', slug: 'filtro-de-cabine', icon: 'fan' },
  { name: 'Filtro de Cabine c/ Carvão', slug: 'filtro-de-cabine-carvao', icon: 'fan' },
  { name: 'Filtro Secador de Ar', slug: 'filtro-secador-de-ar', icon: 'snowflake' },
  { name: 'Filtro de Transmissão', slug: 'filtro-de-transmissao', icon: 'cog' },
  { name: 'Filtro de Água', slug: 'filtro-de-agua', icon: 'droplet' },
  { name: 'Filtro de Ureia', slug: 'filtro-de-ureia', icon: 'flask-conical' },
  { name: 'Copo Separador de Água', slug: 'copo-separador-agua', icon: 'cup-soda' },
  { name: 'Centrífuga', slug: 'centrifuga', icon: 'loader' },
  { name: 'Filtro do Freio Retarder', slug: 'filtro-freio-retarder', icon: 'disc' },
  { name: 'Kit de Manutenção', slug: 'kit-de-manutencao', icon: 'wrench' },
] as const;

// ── Montadoras Principais ──
export const MAIN_BRANDS = [
  { name: 'Scania', slug: 'scania' },
  { name: 'Volvo', slug: 'volvo' },
  { name: 'DAF', slug: 'daf' },
  { name: 'Volkswagen', slug: 'volkswagen' },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz' },
  { name: 'Ford', slug: 'ford' },
  { name: 'Iveco', slug: 'iveco' },
  { name: 'MAN', slug: 'man' },
  { name: 'Agrale', slug: 'agrale' },
] as const;

// ── Navegação Principal ──
export const NAVIGATION: NavItem[] = [
  {
    label: 'Produtos',
    href: '/produtos',
    children: [
      { label: 'Catálogo Completo', href: '/produtos' },
      { label: 'Filtro de Ar', href: '/produtos/categoria/filtro-de-ar' },
      { label: 'Filtro de Combustível', href: '/produtos/categoria/filtro-de-combustivel' },
      { label: 'Filtro de Óleo', href: '/produtos/categoria/filtro-de-oleo' },
      { label: 'Filtros Hidráulicos', href: '/produtos/categoria/filtro-hidraulico' },
      { label: 'Filtro Secador de Ar', href: '/produtos/categoria/filtro-secador-de-ar' },
      { label: 'Filtro de Arrefecimento', href: '/produtos/categoria/filtro-de-arrefecimento' },
      { label: 'Lançamentos', href: '/lancamentos' },
    ],
  },
  {
    label: 'A Empresa',
    href: '/sobre',
    children: [
      { label: 'Sobre Nós', href: '/sobre' },
      { label: 'Política de Qualidade', href: '/qualidade' },
      { label: 'Sustentabilidade', href: '/sustentabilidade' },
      { label: 'Política de Garantia', href: '/garantia' },
    ],
  },
  { label: 'Blog', href: '/blog' },
  { label: 'Contato', href: '/contato' },
];

// ── Idiomas ──
export const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
] as const;

// ── Certificações ──
export const CERTIFICATIONS = ['IATF 16949:2016', 'QS 9000', 'ISO 9001'] as const;

// ── Opções de Contato (formulário) ──
export const CONTACT_SUBJECTS = [
  { value: 'duvidas', label: 'Dúvidas' },
  { value: 'orcamento', label: 'Orçamento' },
  { value: 'elogios', label: 'Elogios' },
  { value: 'sugestoes', label: 'Sugestões' },
  { value: 'reclamacoes', label: 'Reclamações' },
] as const;
