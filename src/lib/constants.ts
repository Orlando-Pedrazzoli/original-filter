/* ══════════════════════════════════════════
   Original Filter — Constantes do Projeto
   ══════════════════════════════════════════ */

import type { NavItem, ProductLine, FilterCategory, MainBrand, Language } from '@/types';

// ── Marca ──
export const BRAND = {
  name: 'Original Filter',
  slogan: 'Qualidade Superior em Filtros Automotivos e Sensores',
  sloganShort: 'Especialista em Filtros e Sensores',
  url: 'https://originalfilter.com',
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
  phoneRaw: '+551146133454',
  whatsapp: '+5511461334554',
  whatsappLink: 'https://wa.me/5511461334554',
  sac: '0800 778 2000',
  sacRaw: '08007782000',
  email: 'contato@originalfilter.com',
  address: 'Cotia, SP — Brasil',
  city: 'Cotia',
  state: 'SP',
  facebook: 'https://www.facebook.com/originalfilter',
  instagram: 'https://www.instagram.com/originalfilterco',
} as const;

// ── Linhas de Produto (por aplicação/segmento) ──
export const PRODUCT_LINES: readonly ProductLine[] = [
  { name: 'Transporte', slug: 'transporte', count: 0 },
  { name: 'Agrícola', slug: 'agricola', count: 0 },
  { name: 'Máquinas e Equipamentos', slug: 'maquinas-e-equipamentos', count: 0 },
  { name: 'Automóveis', slug: 'automoveis', count: 0 },
  { name: 'Vans e Utilitários', slug: 'vans-e-utilitarios', count: 0 },
  { name: 'Pick-up', slug: 'pick-up', count: 0 },
] as const;

// ── Categorias de FILTRO (productType: 'filter') ──
export const FILTER_CATEGORIES: readonly FilterCategory[] = [
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

// ── Categorias de SENSOR (productType: 'sensor') ──
export const SENSOR_CATEGORIES: readonly FilterCategory[] = [
  { name: 'Sensor NOx', slug: 'sensor-nox', icon: 'activity' },
  { name: 'Sensor de Temperatura', slug: 'sensor-temperatura', icon: 'thermometer' },
  { name: 'Sensor de Pressão', slug: 'sensor-pressao', icon: 'gauge' },
] as const;

// ── Categorias de ACESSÓRIO (productType: 'accessory') ──
export const ACCESSORY_CATEGORIES: readonly FilterCategory[] = [
  { name: 'Válvula Dosadora ARLA', slug: 'valvula-dosadora-arla', icon: 'droplet' },
  { name: 'Reparo', slug: 'reparo', icon: 'wrench' },
] as const;

// ── Mapa: SKU prefix → productType + categoria ──
// Derivado da análise real do Excel da Original Filter
export const SKU_PREFIX_MAP = {
  OFA: { productType: 'filter', defaultCategory: 'filtro-de-ar' },
  OFC: { productType: 'filter', defaultCategory: 'filtro-de-combustivel' },
  OFD: { productType: 'filter', defaultCategory: 'filtro-secador-de-ar' },
  OFH: { productType: 'filter', defaultCategory: 'filtro-hidraulico' },
  OFL: { productType: 'filter', defaultCategory: 'filtro-de-oleo' },
  OFN: { productType: 'sensor', defaultCategory: 'sensor-nox' },
  OFR: { productType: 'filter', defaultCategory: 'filtro-freio-retarder' },
  OFT: { productType: 'accessory', defaultCategory: 'reparo' },
  OFU: { productType: 'filter', defaultCategory: 'filtro-de-ureia' },
  OFV: { productType: 'accessory', defaultCategory: 'valvula-dosadora-arla' },
  OFW: { productType: 'filter', defaultCategory: 'filtro-de-agua' },
} as const;

// ── Montadoras: Rodoviárias ──
export const TRANSPORT_BRANDS: readonly MainBrand[] = [
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

// ── Montadoras: Agrícolas + Máquinas Pesadas ──
// (detectadas no Excel real da Original Filter)
export const HEAVY_BRANDS: readonly MainBrand[] = [
  { name: 'Caterpillar', slug: 'caterpillar' },
  { name: 'Case', slug: 'case' },
  { name: 'New Holland', slug: 'new-holland' },
  { name: 'John Deere', slug: 'john-deere' },
  { name: 'Komatsu', slug: 'komatsu' },
  { name: 'JCB', slug: 'jcb' },
  { name: 'Massey Ferguson', slug: 'massey-ferguson' },
  { name: 'Valtra', slug: 'valtra' },
] as const;

// ── Compatibilidade: união de todas as montadoras ──
export const MAIN_BRANDS: readonly MainBrand[] = [...TRANSPORT_BRANDS, ...HEAVY_BRANDS] as const;

// ── Navegação Principal ──
export const NAVIGATION: NavItem[] = [
  {
    label: 'Produtos',
    href: '/produtos',
    children: [
      { label: 'Catálogo Completo', href: '/produtos' },
      { label: 'Filtros', href: '/produtos?tipo=filter' },
      { label: 'Sensores', href: '/produtos?tipo=sensor' },
      { label: 'Filtro de Ar', href: '/produtos/categoria/filtro-de-ar' },
      { label: 'Filtro de Combustível', href: '/produtos/categoria/filtro-de-combustivel' },
      { label: 'Filtro de Óleo', href: '/produtos/categoria/filtro-de-oleo' },
      { label: 'Filtro Hidráulico', href: '/produtos/categoria/filtro-hidraulico' },
      { label: 'Filtro Secador de Ar', href: '/produtos/categoria/filtro-secador-de-ar' },
      { label: 'Sensor NOx', href: '/produtos/categoria/sensor-nox' },
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
  { label: 'Seja Revendedor', href: '/seja-revendedor' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contato', href: '/contato' },
];

// ── Idiomas ──
export const LANGUAGES: readonly Language[] = [
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

// ── Segmentos para formulário "Seja Revendedor" ──
export const RESELLER_SEGMENTS = [
  { value: 'oficina', label: 'Oficina Mecânica' },
  { value: 'distribuidora', label: 'Distribuidora' },
  { value: 'atacado', label: 'Atacadista' },
  { value: 'loja', label: 'Loja de Auto Peças' },
  { value: 'frota', label: 'Gestor de Frota' },
  { value: 'concessionaria', label: 'Concessionária' },
  { value: 'outro', label: 'Outro' },
] as const;

// ── Status maps (para UI) ──
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando pagamento',
  processing: 'Processando',
  paid: 'Pago',
  failed: 'Falhou',
  refunded: 'Reembolsado',
  chargeback: 'Chargeback',
};

export const FULFILLMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando',
  processing: 'Em separação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  returned: 'Devolvido',
};

// ── Paginação padrão ──
export const PAGINATION = {
  defaultLimit: 24,
  maxLimit: 100,
} as const;
