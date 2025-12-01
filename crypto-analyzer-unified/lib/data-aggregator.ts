/**
 * Agregador inteligente de dados de múltiplas fontes
 * Prioriza DeFiLlama para TVL, mescla o melhor de cada fonte
 */

import { resolveAlias } from './known-aliases'
import { fetchDeFiLlamaProtocol, fetchCoinGecko } from './robust-fetcher'
import { fetchCryptoCompare, fetchSupplyData, fetchDeFiLlamaExtended } from './data-sources'

export interface AggregatedData {
  // Identificação
  name: string
  symbol: string
  logo?: string
  category?: string

  // Preço e Market Cap
  price: number | null
  marketCap: number | null
  fdv: number | null
  volume24h: number | null

  // Supply
  circulating: number | null
  total: number | null
  max: number | null

  // TVL (prioridade DeFiLlama)
  tvl: number | null
  tvlChange: {
    '1d': number | null
    '7d': number | null
    '30d': number | null
    '365d': number | null
  }

  // Price Changes
  priceChange: {
    '24h': number | null
    '7d': number | null
    '30d': number | null
    '365d': number | null
  }

  // Chains e outros
  chains: Record<string, number> | null

  // Metadata
  dataSources: {
    defiLlama: boolean
    coinGecko: boolean
    cryptoCompare: boolean
    others: string[]
  }
}

/**
 * Merge inteligente de dados de múltiplas fontes
 * Prioriza fontes mais confiáveis para cada tipo de dado
 */
export async function aggregateData(query: string): Promise<AggregatedData | null> {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`[DATA AGGREGATOR] AGREGANDO DADOS PARA: ${query}`)
  console.log('='.repeat(70))

  const startTime = Date.now()

  // Resolver alias para otimizar buscas
  const alias = resolveAlias(query)
  const symbol = alias?.symbol || query.toUpperCase()

  // FASE 1: Buscar de TODAS as fontes em paralelo
  console.log('\n[FASE 1] Buscando de MÚLTIPLAS fontes...')

  const [defiData, coinGeckoData, cryptoCompareData] = await Promise.allSettled([
    fetchDeFiLlamaProtocol(query),
    fetchCoinGecko(query),
    fetchCryptoCompare(symbol)
  ])

  // Extrair dados com segurança
  const defi = defiData.status === 'fulfilled' ? defiData.value : null
  const coinGecko = coinGeckoData.status === 'fulfilled' ? coinGeckoData.value : null
  const cryptoCompare = cryptoCompareData.status === 'fulfilled' ? cryptoCompareData.value : null

  console.log(`[FASE 1] Resultados:`)
  console.log(`  - DeFiLlama: ${defi ? '✓' : '✗'}`)
  console.log(`  - CoinGecko: ${coinGecko ? '✓' : '✗'}`)
  console.log(`  - CryptoCompare: ${cryptoCompare ? '✓' : '✗'}`)

  // Se NENHUMA fonte retornou dados, falhar
  if (!defi && !coinGecko && !cryptoCompare) {
    console.log(`[DATA AGGREGATOR] ✗ NENHUMA fonte retornou dados para: ${query}`)
    return null
  }

  // FASE 2: Buscar supply de múltiplas fontes
  console.log('\n[FASE 2] Buscando dados de supply...')
  const supplyData = await fetchSupplyData(symbol, coinGecko?._coinId)

  // FASE 3: Merge inteligente
  console.log('\n[FASE 3] Mesclando dados de forma inteligente...')

  const aggregated: AggregatedData = {
    // IDENTIFICAÇÃO - Prioriza CoinGecko > DeFiLlama
    name: coinGecko?.name || defi?.name || alias?.name || query,
    symbol: coinGecko?.symbol?.toUpperCase() || defi?.symbol?.toUpperCase() || symbol,
    logo: coinGecko?.image?.large || coinGecko?.image?.small || defi?.logo || undefined,
    // CATEGORY - PRIORIZA ALIAS (manualmente definido) > APIs
    // Aliases foram criados justamente para resolver casos problemáticos!
    category: alias?.type ? (alias.type === 'chain' ? 'Chain' : alias.type === 'protocol' ? 'Protocol' : alias.type) : (defi?.category || coinGecko?.categories?.[0] || 'Crypto'),

    // PREÇO - Prioriza CoinGecko > CryptoCompare
    price: coinGecko?.market_data?.current_price?.usd || cryptoCompare?.price || null,

    // MARKET CAP - Prioriza CoinGecko > CryptoCompare > DeFiLlama
    marketCap:
      coinGecko?.market_data?.market_cap?.usd ||
      cryptoCompare?.marketCap ||
      defi?.mcap ||
      null,

    // FDV - Apenas CoinGecko fornece
    fdv: coinGecko?.market_data?.fully_diluted_valuation?.usd || null,

    // VOLUME 24H - Prioriza CoinGecko > CryptoCompare
    volume24h:
      coinGecko?.market_data?.total_volume?.usd ||
      cryptoCompare?.volume24h ||
      null,

    // SUPPLY - Prioriza dados específicos de supply > CoinGecko
    circulating:
      supplyData?.circulating ||
      coinGecko?.market_data?.circulating_supply ||
      null,

    total:
      supplyData?.total ||
      coinGecko?.market_data?.total_supply ||
      null,

    max:
      supplyData?.max ||
      coinGecko?.market_data?.max_supply ||
      null,

    // TVL - PRIORIZA DeFiLlama (melhor fonte para TVL)
    tvl: defi?.tvl || null,

    // TVL CHANGES - APENAS DeFiLlama
    tvlChange: {
      '1d': defi?.change_1d ?? null,
      '7d': defi?.change_7d ?? null,
      '30d': defi?.change_1m ?? null,
      '365d': null // Será calculado depois se tiver histórico
    },

    // PRICE CHANGES - Prioriza CoinGecko > CryptoCompare
    priceChange: {
      '24h':
        coinGecko?.market_data?.price_change_percentage_24h ||
        cryptoCompare?.change24h ||
        null,
      '7d': coinGecko?.market_data?.price_change_percentage_7d || null,
      '30d': coinGecko?.market_data?.price_change_percentage_30d || null,
      '365d': coinGecko?.market_data?.price_change_percentage_1y || null,
    },

    // CHAINS - Apenas DeFiLlama
    chains: defi?.currentChainTvls || defi?.chainTvls || null,

    // METADATA
    dataSources: {
      defiLlama: !!defi,
      coinGecko: !!coinGecko,
      cryptoCompare: !!cryptoCompare,
      others: []
    }
  }

  // FASE 4: Estatísticas e validação
  console.log('\n[FASE 4] Dados agregados:')
  console.log(`  ✓ Nome: ${aggregated.name} (${aggregated.symbol})`)
  console.log(`  ${aggregated.logo ? '✓' : '✗'} Logo: ${aggregated.logo ? 'sim' : 'não'}`)
  console.log(`  ${aggregated.price ? '✓' : '✗'} Preço: ${aggregated.price ? `$${aggregated.price.toFixed(2)}` : 'N/A'}`)
  console.log(`  ${aggregated.marketCap ? '✓' : '✗'} Market Cap: ${aggregated.marketCap ? `$${(aggregated.marketCap / 1e9).toFixed(2)}B` : 'N/A'}`)
  console.log(`  ${aggregated.fdv ? '✓' : '✗'} FDV: ${aggregated.fdv ? `$${(aggregated.fdv / 1e9).toFixed(2)}B` : 'N/A'}`)
  console.log(`  ${aggregated.volume24h ? '✓' : '✗'} Volume 24h: ${aggregated.volume24h ? `$${(aggregated.volume24h / 1e6).toFixed(2)}M` : 'N/A'}`)
  console.log(`  ${aggregated.circulating ? '✓' : '✗'} Circulating: ${aggregated.circulating ? aggregated.circulating.toLocaleString() : 'N/A'}`)
  console.log(`  ${aggregated.total ? '✓' : '✗'} Total Supply: ${aggregated.total ? aggregated.total.toLocaleString() : 'N/A'}`)
  console.log(`  ${aggregated.max ? '✓' : '✗'} Max Supply: ${aggregated.max ? aggregated.max.toLocaleString() : 'N/A'}`)
  console.log(`  ${aggregated.tvl ? '✓' : '✗'} TVL: ${aggregated.tvl ? `$${(aggregated.tvl / 1e9).toFixed(2)}B` : 'N/A'}`)

  const elapsed = Date.now() - startTime
  console.log(`\n${'='.repeat(70)}`)
  console.log(`[DATA AGGREGATOR] ✓ AGREGAÇÃO COMPLETA (${elapsed}ms)`)
  console.log(`Fontes usadas: DeFi=${aggregated.dataSources.defiLlama}, CoinGecko=${aggregated.dataSources.coinGecko}, CryptoCompare=${aggregated.dataSources.cryptoCompare}`)
  console.log('='.repeat(70) + '\n')

  return aggregated
}
