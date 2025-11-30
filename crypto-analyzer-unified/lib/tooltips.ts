/**
 * Tooltips e explicações para transparência total da aplicação
 */

// Explicações das seções
export const sectionTooltips = {
  basicInfo: {
    title: "Informações Básicas",
    description:
      "Dados fundamentais sobre o ativo, incluindo nome, símbolo, categoria e blockchain de origem. Estas informações ajudam a identificar e classificar o protocolo ou token.",
  },
  marketMetrics: {
    title: "Métricas de Mercado",
    description:
      "Indicadores financeiros atuais do mercado, como capitalização de mercado, volume de negociação e TVL (Total Value Locked). Essas métricas mostram o tamanho e atividade do ativo.",
  },
  supplyAnalysis: {
    title: "Análise de Supply",
    description:
      "Informações sobre a distribuição e disponibilidade de tokens, incluindo supply circulante, máximo e bloqueado. Crucial para entender a economia do token e potencial inflacionário.",
  },
  performanceVariations: {
    title: "Variações de Performance",
    description:
      "Mudanças percentuais no preço e TVL em diferentes períodos (24h, 7d, 30d). Permite avaliar a volatilidade e tendência de curto/médio prazo do ativo.",
  },
  advancedMetrics: {
    title: "Métricas Avançadas",
    description:
      "Indicadores técnicos e fundamentalistas avançados como volume/market cap ratio, FDV (Fully Diluted Valuation) e métricas de liquidez. Para análise mais profunda do ativo.",
  },
  tvlDistribution: {
    title: "Distribuição de TVL",
    description:
      "Mostra como o valor total bloqueado (TVL) está distribuído entre diferentes blockchains. Indica diversificação e risco de concentração em uma única chain.",
  },
  riskScore: {
    title: "Score de Risco",
    description:
      "Avaliação automatizada do nível de risco do investimento, considerando fatores como volatilidade, liquidez, centralização e histórico. Escala de 0-100.",
  },
  warnings: {
    title: "Alertas e Avisos",
    description:
      "Red flags identificadas automaticamente que podem indicar riscos elevados, como baixa liquidez, alta concentração de supply, ou métricas suspeitas.",
  },
  positivePoints: {
    title: "Pontos Positivos",
    description:
      "Aspectos favoráveis identificados na análise, como boa liquidez, crescimento consistente, ou fundamentos sólidos. Green flags do investimento.",
  },
  recommendation: {
    title: "Recomendação Final",
    description:
      "Sugestão de ação baseada na análise completa de todos os indicadores. Lembre-se: não é conselho financeiro, apenas análise técnica automatizada.",
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
  liquidityScore: "Score de 0-100 que mede facilidade de compra/venda sem afetar muito o preço.",
  concentrationRisk: "Indica se há muitos tokens nas mãos de poucos holders (risco de dump).",
  mcapTvlRatio: "Market Cap dividido por TVL. <1 pode indicar subvalorização em protocolos DeFi.",

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
