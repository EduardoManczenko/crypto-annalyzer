/**
 * Data Aggregator
 * Combina dados de múltiplas fontes (DefiLlama, CoinGecko, Web Scraping)
 * e retorna dados consolidados e validados
 */

import {
  searchProtocol,
  searchChain,
  searchChainByExactName,
  extractLatestTVL,
  extractChainTvls,
  getProtocolUrl,
  getProtocolApiUrl,
  getChainUrl,
  type DefiLlamaProtocolDetails,
  type DefiLlamaChain
} from './defillama-api'

import {
  scrapeProtocolPage,
  scrapeChainPage,
  scrapeWithVariations,
  type ScrapedProtocolData
} from './defillama-scraper'

import {
  searchCoin,
  fetchPriceHistory,
  extractCoinId,
  getCoinUrl,
  getCoinApiUrl,
  type CoinGeckoCoinData,
  type ChartData
} from './coingecko-api'

import {
  identifyAssetType,
  isChain,
  isProtocol,
  normalizeChainName
} from './asset-identifier'

import {
  findChainMapping,
  isKnownChain as isKnownChainMapping,
  getCoinGeckoChainId
} from './chain-mappings'

export interface AggregatedData {
  // Informações básicas
  name: string
  symbol: string
  logo?: string
  category: string

  // Dados de preço (CoinGecko)
  price: number | null
  marketCap: number | null
  fdv: number | null
  volume24h: number | null

  // Supply (CoinGecko)
  circulating: number | null
  total: number | null
  max: number | null

  // TVL (DefiLlama)
  tvl: number | null
  tvlChange: {
    '1d': number | null
    '7d': number | null
    '30d': number | null
    '365d': number | null
  }

  // Variações de preço (CoinGecko)
  priceChange: {
    '24h': number | null
    '7d': number | null
    '30d': number | null
    '365d': number | null
  }

  // Histórico de preços (CoinGecko)
  priceHistory?: ChartData

  // Distribuição por chains (DefiLlama)
  chains: Record<string, number> | null

  // Metadados de fonte
  sources: {
    defiLlama?: {
      url: string
      apiUrl: string
      slug?: string
      type: 'protocol' | 'chain'
    }
    coinGecko?: {
      url: string
      apiUrl: string
      coinId: string
    }
    scraped?: boolean
  }
}

/**
 * Calcula mudanças de TVL a partir do histórico
 */
function calculateTVLChanges(
  protocol: DefiLlamaProtocolDetails
): AggregatedData['tvlChange'] {
  // Tentar usar valores diretos primeiro
  if (protocol.change_1d !== undefined || protocol.change_7d !== undefined) {
    return {
      '1d': protocol.change_1d ?? null,
      '7d': protocol.change_7d ?? null,
      '30d': protocol.change_1m ?? null,
      '365d': null
    }
  }

  // Se não tem valores diretos, tentar calcular do histórico
  if (Array.isArray(protocol.tvl) && protocol.tvl.length > 1) {
    const now = Date.now() / 1000
    const currentTvl = protocol.tvl[protocol.tvl.length - 1]?.totalLiquidityUSD

    if (!currentTvl) {
      return { '1d': null, '7d': null, '30d': null, '365d': null }
    }

    const findClosestTvl = (targetTime: number) => {
      let closest = null
      let minDiff = Infinity

      for (const item of protocol.tvl as any[]) {
        const diff = Math.abs(item.date - targetTime)
        if (diff < minDiff) {
          minDiff = diff
          closest = item
        }
      }

      return closest?.totalLiquidityUSD
    }

    const calculate = (oldTvl: number | null) => {
      if (!oldTvl || oldTvl === 0) return null
      return ((currentTvl - oldTvl) / oldTvl) * 100
    }

    return {
      '1d': calculate(findClosestTvl(now - 86400)),
      '7d': calculate(findClosestTvl(now - 7 * 86400)),
      '30d': calculate(findClosestTvl(now - 30 * 86400)),
      '365d': null
    }
  }

  return { '1d': null, '7d': null, '30d': null, '365d': null }
}

/**
 * Agrega dados de todas as fontes disponíveis
 */
export async function aggregateData(
  query: string,
  explicitType?: 'chain' | 'protocol' | 'token',
  forceRefresh: boolean = false
): Promise<AggregatedData | null> {
  console.log(`\n[Aggregator] ========== Agregando dados para: ${query}${explicitType ? ` (tipo: ${explicitType})` : ''}${forceRefresh ? ' ⚡ FORCE REFRESH' : ''} ==========`)

  try {
    // FASE 0: Identificar tipo de ativo
    const assetType = explicitType || identifyAssetType(query)
    console.log(`[Aggregator] Tipo de ativo ${explicitType ? 'EXPLÍCITO' : 'identificado'}: ${assetType}`)

    if (forceRefresh) {
      console.log('[Aggregator] ⚡ FORCE REFRESH ativado - buscando dados frescos, ignorando qualquer cache')
    }

    // FASE 0.5: Verificar se temos chainMapping (para busca EXATA)
    const chainMapping = findChainMapping(query)

    if (chainMapping && explicitType === 'chain') {
      console.log(`[Aggregator] 🎯🎯 CHAIN MAPPING ENCONTRADO + TIPO EXPLÍCITO = Busca EXATA`)
      console.log(`[Aggregator] Usando nome DeFiLlama: "${chainMapping.defillama}"`)
    }

    // FASE 1: Buscar em TODAS as fontes em paralelo (com priorização)
    // IMPORTANTE: Se tipo explícito foi fornecido, só buscamos nas fontes relevantes
    let defiProtocol: DefiLlamaProtocolDetails | null = null
    let defiChain: DefiLlamaChain | null = null
    let coinData: CoinGeckoCoinData | null = null

    if (explicitType === 'chain') {
      // Se usuário selecionou CHAIN explicitamente, IGNORAR protocolos completamente
      console.log('[Aggregator] 🎯 Busca RESTRITA a CHAINS (ignorando protocolos)')

      // Se temos chainMapping, usar busca EXATA pelo nome do DeFiLlama
      if (chainMapping && chainMapping.defillama) {
        console.log(`[Aggregator] 🚀 Usando BUSCA EXATA com nome DeFiLlama: ${chainMapping.defillama}`)
        ;[defiChain, coinData] = await Promise.race([
          Promise.all([
            searchChainByExactName(chainMapping.defillama),
            searchCoin(chainMapping.coingecko || query)
          ]),
          new Promise<[null, null]>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout global')), 25000)
          )
        ])
      } else {
        // Fallback: busca normal
        ;[defiChain, coinData] = await Promise.race([
          Promise.all([
            searchChain(query),
            searchCoin(query)
          ]),
          new Promise<[null, null]>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout global')), 25000)
          )
        ])
      }
    } else if (explicitType === 'protocol') {
      // Se usuário selecionou PROTOCOL explicitamente, IGNORAR chains completamente
      console.log('[Aggregator] 🎯 Busca RESTRITA a PROTOCOLS (ignorando chains)')
      ;[defiProtocol, coinData] = await Promise.race([
        Promise.all([
          searchProtocol(query),
          searchCoin(query)
        ]),
        new Promise<[null, null]>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout global')), 25000)
        )
      ])
    } else {
      // Busca normal: todas as fontes
      console.log('[Aggregator] 🔍 Busca AMPLA (todas as fontes)')
      ;[defiProtocol, defiChain, coinData] = await Promise.race([
        Promise.all([
          searchProtocol(query),
          searchChain(query),
          searchCoin(query)
        ]),
        new Promise<[null, null, null]>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout global')), 25000)
        )
      ])
    }

    console.log('[Aggregator] Resultados iniciais:', {
      defiProtocol: !!defiProtocol,
      defiChain: !!defiChain,
      coinData: !!coinData
    })

    // Verificar se temos pelo menos uma fonte de dados
    if (!defiProtocol && !defiChain && !coinData) {
      console.log('[Aggregator] ✗ Nenhuma fonte retornou dados, tentando scraping...')

      // FALLBACK: Tentar web scraping
      const scrapedData = await scrapeWithVariations(query)

      if (scrapedData && scrapedData.tvl) {
        console.log('[Aggregator] ✓ Dados obtidos via scraping')

        return {
          name: query,
          symbol: query.toUpperCase(),
          category: scrapedData.category || 'Unknown',
          price: null,
          marketCap: scrapedData.mcap || null,
          fdv: null,
          volume24h: null,
          circulating: null,
          total: null,
          max: null,
          tvl: scrapedData.tvl,
          tvlChange: {
            '1d': scrapedData.tvlChange24h,
            '7d': scrapedData.tvlChange7d,
            '30d': scrapedData.tvlChange30d,
            '365d': null
          },
          priceChange: {
            '24h': null,
            '7d': null,
            '30d': null,
            '365d': null
          },
          chains: scrapedData.chains || null,
          sources: {
            scraped: true
          }
        }
      }

      console.log('[Aggregator] ✗ Nenhum dado encontrado (incluindo scraping)')
      return null
    }

    // FASE 2: Determinar tipo de ativo usando mapeamento de chains e tipo explícito
    // chainMapping já foi obtido na FASE 0.5
    const isDefinitelyChain = chainMapping !== null || explicitType === 'chain'

    let primarySource: 'protocol' | 'chain' | 'coin' = 'coin'
    let defiData: DefiLlamaProtocolDetails | DefiLlamaChain | null = null

    // PRIORIDADE 1: Se tipo explícito foi fornecido, FORÇAR esse tipo
    if (explicitType === 'chain' && defiChain) {
      primarySource = 'chain'
      defiData = defiChain
      console.log(`[Aggregator] 🎯 CHAIN EXPLÍCITA selecionada pelo usuário`)

      // Tentar buscar dados do CoinGecko se não temos ainda
      if (!coinData && chainMapping?.coingecko) {
        console.log(`[Aggregator] Buscando no CoinGecko com ID mapeado: ${chainMapping.coingecko}`)
        try {
          coinData = await searchCoin(chainMapping.coingecko)
          if (coinData) {
            console.log('[Aggregator] ✓ Dados do CoinGecko obtidos via mapeamento')
          }
        } catch (error) {
          console.log('[Aggregator] ⚠ Erro ao buscar no CoinGecko via mapeamento')
        }
      }
    } else if (explicitType === 'protocol' && defiProtocol) {
      primarySource = 'protocol'
      defiData = defiProtocol
      console.log(`[Aggregator] 🎯 PROTOCOL EXPLÍCITO selecionado pelo usuário`)
    }
    // PRIORIDADE 2: Se for chain conhecida do mapeamento, priorizar chain
    else if (isDefinitelyChain && defiChain) {
      primarySource = 'chain'
      defiData = defiChain
      console.log(`[Aggregator] ✓ Chain conhecida detectada: ${chainMapping?.names[0]} (${chainMapping?.category})`)

      // Se não encontrou no CoinGecko ainda, tentar buscar com o ID do mapeamento
      if (!coinData && chainMapping?.coingecko) {
        console.log(`[Aggregator] Buscando no CoinGecko com ID mapeado: ${chainMapping.coingecko}`)
        try {
          coinData = await searchCoin(chainMapping.coingecko)
          if (coinData) {
            console.log('[Aggregator] ✓ Dados do CoinGecko obtidos via mapeamento')
          }
        } catch (error) {
          console.log('[Aggregator] ⚠ Erro ao buscar no CoinGecko via mapeamento')
        }
      }
    }
    // PRIORIDADE 3: Fallback normal
    else if (defiProtocol) {
      primarySource = 'protocol'
      defiData = defiProtocol
      console.log('[Aggregator] Fonte primária: DeFi Protocol')
    } else if (defiChain) {
      primarySource = 'chain'
      defiData = defiChain
      console.log('[Aggregator] Fonte primária: DeFi Chain')
    } else {
      primarySource = 'coin'
      console.log('[Aggregator] Fonte primária: CoinGecko')
    }

    console.log('[Aggregator] Dados disponíveis após fase 2:', {
      coinGecko: !!coinData,
      defiLlama: !!defiData,
      chainMapping: !!chainMapping
    })

    // FASE 3: Buscar histórico de preços se temos CoinGecko
    let priceHistory: ChartData | null = null
    const coinId = extractCoinId(coinData)

    if (coinId) {
      console.log('[Aggregator] Buscando histórico de preços...')
      priceHistory = await fetchPriceHistory(coinId)

      if (priceHistory) {
        console.log('[Aggregator] ✓ Histórico de preços obtido:', {
          '24h': priceHistory['24h']?.length || 0,
          '7d': priceHistory['7d']?.length || 0,
          '30d': priceHistory['30d']?.length || 0,
          '365d': priceHistory['365d']?.length || 0
        })
      }
    }

    // FASE 4: Extrair TVL (PRIORIZANDO SCRAPING para chains e protocolos importantes)
    let tvl: number | null = null
    let tvlChange = { '1d': null, '7d': null, '30d': null, '365d': null } as AggregatedData['tvlChange']
    let chains: Record<string, number> | null = null

    // Lista de assets importantes que SEMPRE devem usar scraping primeiro
    const PRIORITY_SCRAPING = [
      'solana', 'sol', 'ethereum', 'eth', 'bitcoin', 'btc',
      'binance', 'bnb', 'avalanche', 'avax', 'polygon', 'matic',
      'arbitrum', 'optimism', 'base', 'blast'
    ];
    const shouldPrioritizeScraping = PRIORITY_SCRAPING.some(term =>
      query.toLowerCase().includes(term)
    );

    if (primarySource === 'protocol' && defiProtocol) {
      // PRIORIZAR SCRAPING para assets importantes
      if (shouldPrioritizeScraping) {
        console.log('[Aggregator] Asset prioritário detectado - tentando scraping PRIMEIRO...')
        const scrapedData = await scrapeProtocolPage(defiProtocol.slug)

        if (scrapedData && scrapedData.tvl) {
          console.log(`[Aggregator] ✓ TVL obtido via scraping prioritário: $${(scrapedData.tvl / 1e9).toFixed(3)}B`)
          tvl = scrapedData.tvl
          tvlChange = {
            '1d': scrapedData.tvlChange24h,
            '7d': scrapedData.tvlChange7d,
            '30d': scrapedData.tvlChange30d,
            '365d': null
          }
          chains = scrapedData.chains || null
        }
      }

      // Se scraping não funcionou ou não foi tentado, usar API
      if (!tvl) {
        tvl = extractLatestTVL(defiProtocol)
        tvlChange = calculateTVLChanges(defiProtocol)
        chains = extractChainTvls(defiProtocol)

        // VALIDAÇÃO: Se TVL parece baixo ou suspeito, tentar scraping para confirmar
        if (tvl && tvl < 1000000) {
          console.log('[Aggregator] TVL parece baixo, validando com scraping...')
          const scrapedData = await scrapeProtocolPage(defiProtocol.slug)

          if (scrapedData && scrapedData.tvl && scrapedData.tvl > tvl) {
            console.log(`[Aggregator] ✓ Scraping retornou TVL maior: $${(scrapedData.tvl / 1e9).toFixed(3)}B vs $${(tvl / 1e9).toFixed(3)}B`)
            tvl = scrapedData.tvl
            chains = scrapedData.chains || chains
          }
        }
      }
    } else if (primarySource === 'chain' && defiChain) {
      // Para chains, SEMPRE priorizar scraping (chains geralmente têm dados mais precisos no site)
      console.log('[Aggregator] Chain detectada - tentando scraping PRIMEIRO...')
      const scrapedData = await scrapeChainPage(defiChain.name)

      if (scrapedData && scrapedData.tvl) {
        console.log(`[Aggregator] ✓ TVL da chain obtido via scraping: $${(scrapedData.tvl / 1e9).toFixed(3)}B`)
        tvl = scrapedData.tvl
        tvlChange = {
          '1d': scrapedData.tvlChange24h,
          '7d': scrapedData.tvlChange7d,
          '30d': scrapedData.tvlChange30d,
          '365d': null
        }
      }

      // Fallback para API se scraping falhar
      if (!tvl) {
        tvl = defiChain.tvl || null
        console.log(`[Aggregator] ✓ TVL da chain da API: $${tvl ? (tvl / 1e9).toFixed(3) + 'B' : 'null'}`)
      }
    }

    // FASE 5: Consolidar dados
    const aggregated: AggregatedData = {
      name: coinData?.name || defiData?.name || query,
      symbol: coinData?.symbol?.toUpperCase() || (defiData as any)?.symbol?.toUpperCase() || query.toUpperCase(),
      logo: coinData?.image?.large || coinData?.image?.small || (defiData as any)?.logo || undefined,
      // Priorizar categoria do DeFiLlama (mais descritiva), depois CoinGecko, depois inferir pelo tipo
      category: (defiData as any)?.category ||
                coinData?.categories?.[0] ||
                (isChain(query) ? 'Chain' : isProtocol(query) ? 'DeFi' : 'Token'),

      // Preço e mercado (CoinGecko)
      price: coinData?.market_data?.current_price?.usd || null,
      marketCap: coinData?.market_data?.market_cap?.usd || (defiData as any)?.mcap || null,
      fdv: coinData?.market_data?.fully_diluted_valuation?.usd || null,
      volume24h: coinData?.market_data?.total_volume?.usd || null,

      // Supply (CoinGecko)
      circulating: coinData?.market_data?.circulating_supply || null,
      total: coinData?.market_data?.total_supply || null,
      max: coinData?.market_data?.max_supply || null,

      // TVL (DefiLlama)
      tvl,
      tvlChange,

      // Variações de preço (CoinGecko)
      priceChange: {
        '24h': coinData?.market_data?.price_change_percentage_24h || null,
        '7d': coinData?.market_data?.price_change_percentage_7d || null,
        '30d': coinData?.market_data?.price_change_percentage_30d || null,
        '365d': coinData?.market_data?.price_change_percentage_1y || null
      },

      // Histórico
      priceHistory: priceHistory || undefined,

      // Chains
      chains,

      // Metadados de fonte
      sources: {
        ...(defiProtocol && {
          defiLlama: {
            url: getProtocolUrl(defiProtocol.slug),
            apiUrl: getProtocolApiUrl(defiProtocol.slug),
            slug: defiProtocol.slug,
            type: 'protocol' as const
          }
        }),
        ...(defiChain && !defiProtocol && {
          defiLlama: {
            url: getChainUrl(defiChain.name),
            apiUrl: `https://api.llama.fi/v2/chains`,
            type: 'chain' as const
          }
        }),
        ...(coinId && {
          coinGecko: {
            url: getCoinUrl(coinId),
            apiUrl: getCoinApiUrl(coinId),
            coinId
          }
        })
      }
    }

    // Log final
    console.log('[Aggregator] ========== Dados agregados ==========')
    console.log('[Aggregator] Nome:', aggregated.name)
    console.log('[Aggregator] Símbolo:', aggregated.symbol)
    console.log('[Aggregator] Preço:', aggregated.price ? `$${aggregated.price.toFixed(2)}` : 'N/A')
    console.log('[Aggregator] Market Cap:', aggregated.marketCap ? `$${(aggregated.marketCap / 1e9).toFixed(2)}B` : 'N/A')
    console.log('[Aggregator] TVL:', aggregated.tvl ? `$${(aggregated.tvl / 1e9).toFixed(3)}B` : 'N/A')
    console.log('[Aggregator] TVL Change 24h:', aggregated.tvlChange['1d'] !== null ? `${aggregated.tvlChange['1d'].toFixed(2)}%` : 'N/A')
    console.log('[Aggregator] Histórico:', priceHistory ? 'Sim' : 'Não')
    console.log('[Aggregator] Chains:', chains ? Object.keys(chains).length : 0)
    console.log('[Aggregator] Fontes:', Object.keys(aggregated.sources).join(', '))
    console.log('[Aggregator] =============================================\n')

    return aggregated
  } catch (error: any) {
    console.error('[Aggregator] ERRO:', error.message)
    return null
  }
}
