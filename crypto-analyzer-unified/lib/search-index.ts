/**
 * Sistema de indexação massivo para crypto
 * Indexa protocolos, chains, tokens de múltiplas fontes
 */

import { fuzzySearch } from './fuzzy-search'

export interface IndexedItem {
  id: string
  name: string
  symbol?: string
  type: 'protocol' | 'chain' | 'token' | 'exchange'
  source: 'defillama' | 'coingecko'
  logo?: string
  tvl?: number
  marketCap?: number
  marketCapRank?: number
  chains?: string[]
  category?: string
  slug?: string
  aliases?: string[]
}

// Cache em memória do índice
let cachedIndex: IndexedItem[] | null = null
let lastIndexUpdate = 0
const INDEX_TTL = 1000 * 60 * 60 * 6 // 6 horas

// Fetch helper
async function fetchWithTimeout(url: string, timeout = 30000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      cache: 'no-store'
    })

    clearTimeout(id)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error: any) {
    clearTimeout(id)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

/**
 * Busca TODOS os protocolos do DeFiLlama
 */
async function indexDeFiLlamaProtocols(): Promise<IndexedItem[]> {
  try {
    console.log('[Indexer] Buscando protocolos do DeFiLlama...')
    const protocols = await fetchWithTimeout('https://api.llama.fi/protocols')

    console.log(`[Indexer] ✓ ${protocols.length} protocolos encontrados no DeFiLlama`)

    return protocols.map((p: any) => ({
      id: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
      name: p.name,
      symbol: p.symbol,
      type: 'protocol' as const,
      source: 'defillama' as const,
      logo: p.logo,
      tvl: p.tvl,
      chains: p.chains || [],
      category: p.category,
      slug: p.slug,
      aliases: [
        p.name.toLowerCase(),
        p.symbol?.toLowerCase(),
        ...(p.chains || []).map((c: string) => `${p.name} ${c}`.toLowerCase())
      ].filter(Boolean)
    }))
  } catch (error: any) {
    console.error('[Indexer] Erro ao buscar DeFiLlama:', error.message)
    return []
  }
}

/**
 * Busca chains do DeFiLlama
 */
async function indexDeFiLlamaChains(): Promise<IndexedItem[]> {
  try {
    console.log('[Indexer] Buscando chains do DeFiLlama...')
    const chains = await fetchWithTimeout('https://api.llama.fi/v2/chains')

    console.log(`[Indexer] ✓ ${chains.length} chains encontradas no DeFiLlama`)

    return chains.map((c: any) => ({
      id: c.gecko_id || c.name.toLowerCase().replace(/\s+/g, '-'),
      name: c.name,
      symbol: c.tokenSymbol,
      type: 'chain' as const,
      source: 'defillama' as const,
      logo: c.chainLogo,
      tvl: c.tvl,
      slug: c.name.toLowerCase().replace(/\s+/g, '-'),
      aliases: [
        c.name.toLowerCase(),
        c.tokenSymbol?.toLowerCase(),
        c.gecko_id?.toLowerCase()
      ].filter(Boolean)
    }))
  } catch (error: any) {
    console.error('[Indexer] Erro ao buscar chains DeFiLlama:', error.message)
    return []
  }
}

/**
 * Busca top tokens do CoinGecko
 */
async function indexCoinGeckoTokens(): Promise<IndexedItem[]> {
  try {
    console.log('[Indexer] Buscando tokens do CoinGecko...')

    // Buscar em múltiplas páginas para pegar mais tokens
    const pages = [1, 2, 3, 4, 5] // Top 1250 tokens
    const allTokens: IndexedItem[] = []

    for (const page of pages) {
      try {
        const data = await fetchWithTimeout(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`
        )

        const tokens = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          symbol: t.symbol?.toUpperCase(),
          type: 'token' as const,
          source: 'coingecko' as const,
          logo: t.image,
          marketCap: t.market_cap,
          marketCapRank: t.market_cap_rank,
          aliases: [
            t.name.toLowerCase(),
            t.symbol?.toLowerCase(),
            t.id.toLowerCase()
          ].filter(Boolean)
        }))

        allTokens.push(...tokens)
        console.log(`[Indexer] ✓ Página ${page}/5 do CoinGecko (${tokens.length} tokens)`)

        // Delay para não bater rate limit
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error: any) {
        console.error(`[Indexer] Erro na página ${page} do CoinGecko:`, error.message)
      }
    }

    console.log(`[Indexer] ✓ Total ${allTokens.length} tokens do CoinGecko`)
    return allTokens
  } catch (error: any) {
    console.error('[Indexer] Erro ao buscar CoinGecko:', error.message)
    return []
  }
}

/**
 * Busca lista completa de tokens do CoinGecko (mais completo)
 */
async function indexCoinGeckoList(): Promise<IndexedItem[]> {
  try {
    console.log('[Indexer] Buscando lista completa do CoinGecko...')
    const coins = await fetchWithTimeout('https://api.coingecko.com/api/v3/coins/list?include_platform=false')

    console.log(`[Indexer] ✓ ${coins.length} coins na lista CoinGecko`)

    // Pegar apenas os primeiros 5000 para não sobrecarregar
    return coins.slice(0, 5000).map((c: any) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol?.toUpperCase(),
      type: 'token' as const,
      source: 'coingecko' as const,
      aliases: [
        c.name.toLowerCase(),
        c.symbol?.toLowerCase(),
        c.id.toLowerCase()
      ].filter(Boolean)
    }))
  } catch (error: any) {
    console.error('[Indexer] Erro ao buscar lista CoinGecko:', error.message)
    return []
  }
}

/**
 * Adiciona manualmente itens conhecidos importantes
 */
function getManualEntries(): IndexedItem[] {
  return [
    // Berachain (exemplo do usuário)
    {
      id: 'berachain',
      name: 'Berachain',
      symbol: 'BERA',
      type: 'chain',
      source: 'defillama',
      aliases: ['bera', 'berachain', 'bera chain'],
      logo: 'https://icons.llama.fi/berachain.jpg'
    },
    // Outras chains importantes que podem não estar bem indexadas
    {
      id: 'base',
      name: 'Base',
      symbol: 'BASE',
      type: 'chain',
      source: 'defillama',
      aliases: ['base', 'base chain', 'coinbase base'],
      logo: 'https://icons.llama.fi/base.jpg'
    },
    {
      id: 'blast',
      name: 'Blast',
      symbol: 'BLAST',
      type: 'chain',
      source: 'defillama',
      aliases: ['blast', 'blast chain'],
      logo: 'https://icons.llama.fi/blast.jpg'
    },
    {
      id: 'scroll',
      name: 'Scroll',
      symbol: 'SCR',
      type: 'chain',
      source: 'defillama',
      aliases: ['scroll', 'scroll chain'],
      logo: 'https://icons.llama.fi/scroll.jpg'
    },
    // Protocolos importantes
    {
      id: 'hyperliquid',
      name: 'Hyperliquid',
      symbol: 'HYPE',
      type: 'protocol',
      source: 'defillama',
      aliases: ['hyperliquid', 'hyper liquid', 'hype'],
      logo: 'https://icons.llama.fi/hyperliquid.jpg'
    }
  ]
}

/**
 * Constrói índice completo de todas as fontes
 */
export async function buildSearchIndex(): Promise<IndexedItem[]> {
  console.log('[Indexer] ========== INICIANDO INDEXAÇÃO MASSIVA ==========')
  const startTime = Date.now()

  // Executar todas as buscas em paralelo
  const [defiProtocols, defiChains, coinGeckoMarkets, coinGeckoList] = await Promise.all([
    indexDeFiLlamaProtocols(),
    indexDeFiLlamaChains(),
    indexCoinGeckoTokens(),
    indexCoinGeckoList()
  ])

  // Combinar todos os resultados
  const allItems = [
    ...getManualEntries(),
    ...defiProtocols,
    ...defiChains,
    ...coinGeckoMarkets,
    ...coinGeckoList
  ]

  // Remover duplicatas (priorizar entries com mais dados)
  const uniqueItems = new Map<string, IndexedItem>()

  for (const item of allItems) {
    const key = item.id.toLowerCase()
    const existing = uniqueItems.get(key)

    if (!existing) {
      uniqueItems.set(key, item)
    } else {
      // Mesclar dados, preferindo o que tem mais informação
      const merged = {
        ...existing,
        logo: item.logo || existing.logo,
        tvl: item.tvl || existing.tvl,
        marketCap: item.marketCap || existing.marketCap,
        marketCapRank: item.marketCapRank || existing.marketCapRank,
        chains: item.chains || existing.chains,
        category: item.category || existing.category,
        aliases: [...new Set([...(existing.aliases || []), ...(item.aliases || [])])]
      }
      uniqueItems.set(key, merged)
    }
  }

  const finalIndex = Array.from(uniqueItems.values())
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log('[Indexer] ========== INDEXAÇÃO COMPLETA ==========')
  console.log(`[Indexer] Total de itens: ${finalIndex.length}`)
  console.log(`[Indexer] - Protocolos: ${finalIndex.filter(i => i.type === 'protocol').length}`)
  console.log(`[Indexer] - Chains: ${finalIndex.filter(i => i.type === 'chain').length}`)
  console.log(`[Indexer] - Tokens: ${finalIndex.filter(i => i.type === 'token').length}`)
  console.log(`[Indexer] Tempo: ${elapsed}s`)
  console.log('[Indexer] ===============================================')

  return finalIndex
}

/**
 * Obtém índice (usa cache se disponível)
 */
export async function getSearchIndex(): Promise<IndexedItem[]> {
  const now = Date.now()

  // Se cache válido, retorna
  if (cachedIndex && (now - lastIndexUpdate) < INDEX_TTL) {
    console.log('[Indexer] Usando cache (idade: ' + ((now - lastIndexUpdate) / 1000 / 60).toFixed(1) + 'min)')
    return cachedIndex
  }

  // Rebuildar índice
  console.log('[Indexer] Cache expirado ou inexistente, rebuilding...')
  cachedIndex = await buildSearchIndex()
  lastIndexUpdate = now

  return cachedIndex
}

/**
 * Busca no índice com fuzzy matching
 */
export async function searchIndex(query: string, limit: number = 15): Promise<IndexedItem[]> {
  const index = await getSearchIndex()

  // Busca fuzzy
  const results = fuzzySearch(query, index, 25) // threshold 25

  // Aplicar boost de score baseado em tipo e dados
  const boostedResults = results.map(item => {
    let boost = 0

    // Boost para chains (prioridade alta)
    if (item.type === 'chain') boost += 10

    // Boost para itens com TVL alto
    if (item.tvl && item.tvl > 1000000000) boost += 5 // >$1B
    else if (item.tvl && item.tvl > 100000000) boost += 3 // >$100M

    // Boost para tokens bem ranqueados
    if (item.marketCapRank && item.marketCapRank <= 100) boost += 5
    else if (item.marketCapRank && item.marketCapRank <= 500) boost += 3

    // Boost para itens com logo (mais completos)
    if (item.logo) boost += 2

    return {
      ...item,
      score: item.score + boost
    }
  })

  // Reordenar e limitar
  return boostedResults
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Força rebuild do cache
 */
export async function rebuildIndex(): Promise<void> {
  console.log('[Indexer] Forçando rebuild do índice...')
  cachedIndex = null
  lastIndexUpdate = 0
  await getSearchIndex()
}
