// Tooltips informativos para seções
export const sectionTooltips = {
  basicInfo: 'Esta seção apresenta as informações fundamentais do projeto, incluindo nome, símbolo, categoria e preço atual. São dados essenciais para identificação rápida do ativo.',

  marketMetrics: 'Métricas de mercado mostram o tamanho e a relevância econômica do projeto. Market Cap indica o valor total de mercado, FDV mostra o valor se todos os tokens estivessem em circulação, Volume 24h demonstra a liquidez, e TVL (Total Value Locked) mostra quanto capital está depositado no protocolo.',

  supplyAnalysis: 'Análise de Supply examina a distribuição de tokens. Circulating Supply são os tokens já disponíveis no mercado, Total Supply são todos os tokens existentes, Max Supply é o limite máximo de tokens que existirão, e Tokens Locked são os tokens reservados que ainda não circulam.',

  performanceVariations: 'Variações de performance mostram como o preço e o TVL mudaram ao longo do tempo. Percentuais positivos indicam crescimento, enquanto negativos indicam queda. Períodos analisados: 24h, 7 dias e 30 dias.',

  chainDistribution: 'Distribuição por blockchain mostra em quais redes o protocolo opera e quanto valor (TVL) está depositado em cada uma. Maior diversificação pode indicar maior adoção e menor risco de concentração.',

  advancedRatios: 'Ratios e métricas avançadas são indicadores que ajudam a avaliar se o ativo está sobrevalorizado ou subvalorizado. FDV/Market Cap mostra risco de diluição, MCap/TVL indica valorização relativa, e Volume/MCap demonstra liquidez.',

  riskAnalysis: 'Análise de risco identifica automaticamente pontos críticos (Red Flags), avisos (Warnings) e aspectos positivos do projeto. Baseada em métricas objetivas como diluição, liquidez, e distribuição de tokens.',

  riskScore: 'Score de risco é uma nota de 0 a 100 que resume a qualidade do investimento. Quanto maior o score, menor o risco. Considera red flags, warnings e pontos positivos para gerar uma classificação e recomendação.'
};

// Tooltips explicativos para labels de campos
export const fieldTooltips = {
  // Básicos
  name: 'Nome oficial do projeto ou protocolo',
  symbol: 'Símbolo ticker usado nas exchanges (ex: BTC, ETH)',
  category: 'Categoria do projeto (ex: DeFi, Layer 1, DEX)',
  price: 'Preço atual em USD',

  // Market Metrics
  marketCap: 'Market Cap (Capitalização de Mercado): Valor total de todos os tokens em circulação. Calculado como: Preço × Circulating Supply. Indica o tamanho do projeto no mercado.',

  fdv: 'FDV (Fully Diluted Valuation): Valor de mercado se todos os tokens possíveis estivessem em circulação. Calculado como: Preço × Max Supply. Útil para avaliar diluição futura.',

  volume24h: 'Volume 24h: Total negociado nas últimas 24 horas. Maior volume = maior liquidez e facilidade para comprar/vender sem afetar muito o preço.',

  tvl: 'TVL (Total Value Locked): Total de fundos depositados no protocolo DeFi. Indica confiança dos usuários e utilidade real do protocolo. Quanto maior, mais capital está sendo usado.',

  // Supply
  circulating: 'Circulating Supply: Quantidade de tokens já disponíveis e circulando no mercado. São os tokens que podem ser comprados e vendidos livremente.',

  totalSupply: 'Total Supply: Quantidade total de tokens que existem atualmente, incluindo os bloqueados. Diferente do Max Supply que é o limite máximo futuro.',

  maxSupply: 'Max Supply: Quantidade máxima de tokens que existirão. Se for infinito (∞), significa que não há limite e novos tokens podem ser criados indefinidamente.',

  tokensLocked: 'Tokens Locked: Tokens que existem mas não estão em circulação. Podem estar reservados para equipe, investidores, ou serem liberados gradualmente. Alto % locked = risco de diluição futura.',

  // Performance
  priceChange24h: 'Variação do preço nas últimas 24 horas',
  priceChange7d: 'Variação do preço nos últimos 7 dias',
  priceChange30d: 'Variação do preço nos últimos 30 dias',
  tvlChange1d: 'Variação do TVL no último dia. Positivo = capital entrando, Negativo = capital saindo',
  tvlChange7d: 'Variação do TVL nos últimos 7 dias',
  tvlChange30d: 'Variação do TVL nos últimos 30 dias',

  // Ratios
  fdvMcapRatio: 'FDV/Market Cap Ratio: Compara o valor totalmente diluído com o valor atual. Valores acima de 3x indicam alto risco de diluição quando novos tokens forem liberados.',

  mcapTvlRatio: 'MCap/TVL Ratio: Compara capitalização com valor depositado. Abaixo de 0.5 = subvalorizado (bom), acima de 2 = sobrevalorizado (ruim). Válido principalmente para protocolos DeFi.',

  volumeToMcap: 'Volume/MCap 24h: Percentual do market cap que foi negociado. Acima de 10% = alta liquidez (bom), abaixo de 1% = baixa liquidez (ruim para compra/venda).',

  circulatingPercent: '% em Circulação: Percentual de tokens já em circulação. Acima de 70% = boa distribuição, abaixo de 40% = alto risco de diluição quando tokens locked forem liberados.'
};

// Função helper para obter fonte formatada
export function getSourceName(source: 'defillama' | 'coingecko' | 'calculated'): string {
  switch (source) {
    case 'defillama':
      return 'DeFiLlama';
    case 'coingecko':
      return 'CoinGecko';
    case 'calculated':
      return 'Calculado';
    default:
      return source;
  }
}

export function getSourceColor(source: 'defillama' | 'coingecko' | 'calculated'): string {
  switch (source) {
    case 'defillama':
      return 'text-purple-400';
    case 'coingecko':
      return 'text-green-400';
    case 'calculated':
      return 'text-cyan-400';
    default:
      return 'text-slate-400';
  }
}
