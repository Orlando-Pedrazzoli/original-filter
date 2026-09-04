// src/lib/data/category-content.ts
/* ══════════════════════════════════════════
   Conteúdo institucional das páginas de categoria
   ──────────────────────────────────────────
   Textos oficiais fornecidos pelo Gabriel (set/2026).
   Cada categoria com conteúdo aqui ganha o bloco editorial
   completo na página /produtos/categoria/[slug]; categorias
   sem entrada exibem apenas a listagem de produtos.

   Para adicionar uma nova categoria: copiar a estrutura de
   'filtro-de-ar' e preencher com o texto oficial do cliente.
   ══════════════════════════════════════════ */

export interface CategoryContentItem {
  title: string;
  text: string;
}

export interface CategoryContent {
  /** H1 e <title> da página. */
  pageTitle: string;
  /** Meta description (SEO). */
  metaDescription: string;
  /** Parágrafo de abertura. */
  intro: string;
  whyTitle: string;
  whyItems: CategoryContentItem[];
  advantagesTitle: string;
  advantages: CategoryContentItem[];
  maintenanceTitle?: string;
  maintenanceText?: string;
  closingBlocks: CategoryContentItem[];
}

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  'filtro-de-ar': {
    pageTitle: 'Filtro de Ar ORIGINAL FILTER: qualidade, desempenho e confiança',
    metaDescription:
      'Filtros de ar ORIGINAL FILTER para caminhões, ônibus, máquinas agrícolas e ' +
      'equipamentos industriais. Alta confiabilidade, economia de combustível e ' +
      'durabilidade conforme as normas dos fabricantes de veículos.',
    intro:
      'O filtro de ar é um componente essencial do sistema de admissão do motor. Sua função ' +
      'vai além de simplesmente reter impurezas; ele desempenha um papel crucial na saúde e ' +
      'no desempenho do motor. Na ORIGINAL FILTER, estamos comprometidos em oferecer produtos ' +
      'de alta qualidade que atendam às necessidades dos mais exigentes fabricantes mundiais ' +
      'de veículos.',
    whyTitle: 'Por que o filtro de ar é importante?',
    whyItems: [
      {
        title: 'Ar limpo para o motor',
        text:
          'O filtro de ar garante que apenas ar limpo e livre de partículas indesejadas ' +
          'alcance a câmara de combustão. Isso é fundamental para o desempenho eficiente do ' +
          'motor e a economia de combustível.',
      },
      {
        title: 'Proteção dos componentes',
        text:
          'Partículas como poeira, sujeira e detritos podem causar danos significativos ao ' +
          'motor. O filtro de ar atua como uma barreira, impedindo que essas impurezas entrem ' +
          'no sistema.',
      },
      {
        title: 'Pressão e fluxo adequados',
        text:
          'O volume de ar admitido pelo motor é extremamente alto, especialmente em motores a ' +
          'diesel. O filtro de ar deve permitir um fluxo adequado sem restrições, mantendo a ' +
          'pressão ideal.',
      },
    ],
    advantagesTitle: 'Vantagens dos filtros de ar ORIGINAL FILTER',
    advantages: [
      {
        title: 'Alta confiabilidade',
        text:
          'Nossos filtros são projetados para oferecer desempenho consistente e confiável. ' +
          'Você pode confiar na qualidade da ORIGINAL FILTER.',
      },
      {
        title: 'Economia de combustível',
        text:
          'Um filtro de ar limpo melhora a eficiência do motor, resultando em menor consumo ' +
          'de combustível. Isso é especialmente importante para frotas de veículos comerciais.',
      },
      {
        title: 'Durabilidade',
        text:
          'Os elementos filtrantes da ORIGINAL FILTER são fabricados conforme as normas ' +
          'definidas pelos fabricantes de veículos. Isso garante uma vida útil prolongada e ' +
          'menos manutenção.',
      },
      {
        title: 'Resistência e qualidade',
        text:
          'Nossos filtros possuem cobertura interna e externa resistente à pressão e ' +
          'corrosão. Eles enfrentam as condições mais desafiadoras com confiança.',
      },
      {
        title: 'Testes rigorosos',
        text:
          'Cada filtro passa por testes laboratoriais em todo o processo de produção. Isso ' +
          'garante que apenas produtos de alta qualidade cheguem até você.',
      },
    ],
    maintenanceTitle: 'Trocas regulares para melhor desempenho',
    maintenanceText:
      'Para obter o máximo desempenho do seu motor e prolongar sua vida útil, siga as ' +
      'recomendações do fabricante quanto à troca dos filtros. A ORIGINAL FILTER oferece ' +
      'soluções que vão além das expectativas, garantindo que seu veículo ou equipamento ' +
      'funcione com eficiência.',
    closingBlocks: [
      {
        title: 'Escolha a ORIGINAL FILTER e experimente a diferença',
        text:
          'Comprove você também a qualidade superior e o preço imbatível da ORIGINAL FILTER! ' +
          'Seja para sua frota de caminhões, máquinas agrícolas ou equipamentos industriais, ' +
          'confie em quem entende de filtragem.',
      },
      {
        title: 'Escolha a ORIGINAL FILTER e proteja seu investimento',
        text:
          'Seja para caminhões, ônibus, máquinas agrícolas, equipamentos industriais ou ' +
          'aplicações fora de estrada, confie na ORIGINAL FILTER para fornecer filtros de ar ' +
          'de alta qualidade. A ORIGINAL FILTER oferece soluções desenvolvidas para ' +
          'proporcionar desempenho, confiabilidade e proteção ao seu equipamento.',
      },
    ],
  },
};
