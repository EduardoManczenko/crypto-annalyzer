/**
 * Tooltips e explicações para transparência total da aplicação
 */

// Explicações das seções
export const sectionTooltips = {
  basicInfo: {
    title: "Informações Básicas",
    description:
      "Identifica o ativo mostrando nome, símbolo e categoria. Essencial para confirmar que você está analisando o protocolo/token correto e entender seu tipo (DEX, Lending, Chain, etc.).",
  },
  marketMetrics: {
    title: "Métricas de Mercado",
    description:
      "Mostra o tamanho e liquidez do ativo através de Market Cap (valor total), Volume 24h (atividade de trading) e TVL (capital depositado). Quanto maiores esses números, geralmente mais estabelecido é o projeto.",
  },
  supplyAnalysis: {
    title: "Análise de Supply",
    description:
      "Explica quantos tokens existem, quantos estão circulando e quantos ainda podem ser criados. Importante para avaliar se há risco de inflação (diluição do seu investimento) ou se tokens estão bloqueados.",
  },
  performanceVariations: {
    title: "Variações de Performance",
    description:
      "Mostra como o preço e TVL mudaram nas últimas 24h, 7 dias e 30 dias. Percentuais positivos (verde) indicam crescimento, negativos (vermelho) indicam queda. Use para avaliar momentum e volatilidade.",
  },
  advancedMetrics: {
    title: "Métricas Avançadas",
    description:
      "Indicadores mais técnicos para análise profunda: FDV (valor se todos tokens existissem), Volume/MCap ratio (quão ativo é o trading), e outras métricas de liquidez e eficiência do protocolo.",
  },
  tvlDistribution: {
    title: "Distribuição de TVL",
    description:
      "Mostra em quais blockchains o protocolo opera e quanto capital tem em cada uma. Diversificação entre várias chains = menos risco. Concentração em uma única chain = mais risco se essa chain tiver problemas.",
  },
  riskScore: {
    title: "Score de Risco",
    description:
      "Nota de 0-100 calculada automaticamente considerando volatilidade, liquidez, descentralização e outros fatores. Quanto menor o score, menor o risco. Use como referência inicial, não como única decisão.",
  },
  warnings: {
    title: "Alertas e Avisos",
    description:
      "Red flags detectados automaticamente que podem indicar problemas: baixa liquidez (difícil vender), alta concentração (poucos holders), métricas inconsistentes, etc. SEMPRE investigue estes alertas antes de investir.",
  },
  positivePoints: {
    title: "Pontos Positivos",
    description:
      "Green flags identificados na análise: boa liquidez, crescimento sustentável, descentralização adequada, volume saudável, etc. Aspectos favoráveis que aumentam a confiança no projeto.",
  },
  recommendation: {
    title: "Recomendação Final",
    description:
      "Sugestão automatizada baseada em TODOS os dados analisados: Compra Forte, Compra, Neutro, Venda ou Venda Forte. IMPORTANTE: Isto NÃO é conselho financeiro! É apenas análise técnica. Faça sua própria pesquisa (DYOR).",
  },
}

// Explicações dos campos/labels
export const fieldTooltips = {
  // Basic Info
  name: "Nome oficial do projeto ou protocolo no ecossistema cripto.",
  symbol: "Ticker ou símbolo usado para negociação do token nos exchanges.",
  category: "Classificação do protocolo (DEX, Lending, Chain, etc.) segundo DeFiLlama.",
  chain: "Blockchain principal onde o protocolo opera ou onde o token foi emitido.",

  // Market Metrics
  price: "Preço atual do token em dólares (USD), atualizado em tempo real.",
  marketCap: "Capitalização de mercado: preço atual × supply circulante. Indica o tamanho total do projeto no mercado.",
  volume24h: "Volume total negociado nas últimas 24 horas em todos os exchanges. Indica liquidez e interesse.",
  tvl: "Total Value Locked: valor total em USD depositado/bloqueado no protocolo. Principal métrica DeFi.",

  // Supply Analysis
  circulatingSupply: "Quantidade de tokens atualmente em circulação no mercado, disponíveis para negociação.",
  totalSupply: "Quantidade total de tokens que existem atualmente, incluindo os bloqueados e não circulantes.",
  maxSupply: "Limite máximo de tokens que poderão existir conforme tokenomics. Se não há limite, pode indicar inflação infinita.",
  tokensLocked: "Quantidade de tokens bloqueados em contratos (vesting, staking, etc.) e não disponíveis para venda imediata.",

  // Performance
  priceChange24h: "Variação percentual do preço nas últimas 24 horas. Indica volatilidade de curto prazo.",
  priceChange7d: "Variação percentual do preço nos últimos 7 dias. Mostra tendência semanal.",
  priceChange30d: "Variação percentual do preço nos últimos 30 dias. Indica tendência mensal.",
  tvlChange24h: "Variação percentual do TVL nas últimas 24 horas. Mostra entrada/saída de capital do protocolo.",
  tvlChange7d: "Variação percentual do TVL nos últimos 7 dias. Tendência de uso do protocolo.",
  tvlChange30d: "Variação percentual do TVL nos últimos 30 dias. Crescimento ou declínio de longo prazo.",

  // Advanced Metrics
  volumeMarketCapRatio: "Razão entre volume 24h e market cap. Valores >1 indicam alta atividade de trading.",
  fdv: "Fully Diluted Valuation: market cap se todos os tokens max supply estivessem em circulação.",
  "fdvFull": "FDV (Fully Diluted Valuation): valor total do projeto se TODOS os tokens max supply estivessem em circulação agora.",
  liquidityScore: "Score de 0-100 que mede facilidade de compra/venda sem afetar muito o preço.",
  concentrationRisk: "Indica se há muitos tokens nas mãos de poucos holders (risco de dump).",
  mcapTvlRatio: "Market Cap dividido por TVL. <1 pode indicar subvalorização em protocolos DeFi.",
  capCategory: "Classificação do tamanho do projeto: Large Cap (>$10B), Mid Cap ($1B-$10B), Small Cap ($100M-$1B), Micro Cap (<$100M).",
  fdvMcapRatio: "FDV dividido por Market Cap. Quanto maior que 1, mais tokens ainda serão liberados (risco de diluição).",
  volumeMcapRatio: "Volume 24h dividido por Market Cap. Mede o quão ativamente o token é negociado.",
  circulatingPercentage: "Percentual do max supply que já está em circulação. 100% = todos tokens liberados, <50% = muita diluição futura.",

  // Others
  holders: "Número total de endereços únicos que possuem o token. Mais holders = mais descentralização.",
  transactions24h: "Número de transações do token nas últimas 24 horas. Indica adoção e uso real.",
  avgTransactionValue: "Valor médio em USD das transações. Ajuda a entender perfil de uso (retail vs whale).",
  tokenAge: "Tempo desde o lançamento do token. Projetos mais antigos podem ter mais histórico/confiabilidade.",
}

// Helper para obter nome da source
export function getSourceName(source: string): string {
  const sources: Record<string, string> = {
    defillama: "DeFiLlama",
    coingecko: "CoinGecko",
    etherscan: "Etherscan",
    bscscan: "BscScan",
    polygonscan: "PolygonScan",
    unknown: "Source Unknown"
  }
  return sources[source.toLowerCase()] || source
}

// Helper para obter URL da source
export function getSourceUrl(source: string, id?: string): string | undefined {
  const baseUrls: Record<string, string> = {
    defillama: "https://defillama.com/protocol/",
    coingecko: "https://coingecko.com/en/coins/",
    etherscan: "https://etherscan.io/token/",
    bscscan: "https://bscscan.com/token/",
    polygonscan: "https://polygonscan.com/token/"
  }

  const baseUrl = baseUrls[source.toLowerCase()]
  return baseUrl && id ? `${baseUrl}${id}` : undefined
}

// Helper para obter cor da source
export function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    defillama: "bg-purple-500/20 text-purple-300",
    coingecko: "bg-green-500/20 text-green-300",
    etherscan: "bg-blue-500/20 text-blue-300",
    bscscan: "bg-yellow-500/20 text-yellow-300",
    polygonscan: "bg-violet-500/20 text-violet-300"
  }
  return colors[source.toLowerCase()] || "bg-accent/20 text-accent"
}
