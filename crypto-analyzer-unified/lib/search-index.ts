/**
 * Sistema de indexação massivo para crypto
 * Indexa protocolos, chains, tokens de múltiplas fontes
 * COM CLASSIFICAÇÃO INTELIGENTE AUTOMÁTICA
 */

import axios from 'axios'
import { fuzzySearch } from './fuzzy-search'
import { classifyItem, shouldReclassify, ItemType } from './smart-classifier'
import { BLOCKCHAIN_REGISTRY } from './blockchain-registry'

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

const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'CryptoAnalyzer/2.0',
    'Accept': 'application/json',
  }
})

/**
 * Busca TODOS os protocolos do DeFiLlama
 */
async function indexDeFiLlamaProtocols(): Promise<IndexedItem[]> {
  try {
    console.log('[Indexer] Buscando protocolos do DeFiLlama...')
    const response = await axiosInstance.get('https://api.llama.fi/protocols')
    const protocols = response.data

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
    const response = await axiosInstance.get('https://api.llama.fi/v2/chains')
    const chains = response.data

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
        const response = await axiosInstance.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: 250,
              page,
              sparkline: false
            }
          }
        )

        const tokens = response.data.map((t: any) => ({
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
    const response = await axiosInstance.get('https://api.coingecko.com/api/v3/coins/list', {
      params: { include_platform: false }
    })

    const coins = response.data
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
 * INCLUI TODAS AS BLOCKCHAINS DO REGISTRY para garantir classificação correta
 */
function getManualEntries(): IndexedItem[] {
  // Converter BLOCKCHAIN_REGISTRY para IndexedItems
  const blockchainEntries: IndexedItem[] = BLOCKCHAIN_REGISTRY.map(chain => ({
    id: chain.id,
    name: chain.name,
    symbol: chain.symbol,
    type: 'chain' as const,
    source: 'defillama' as const,
    aliases: chain.aliases,
    slug: chain.defilllamaSlug?.toLowerCase(),
    logo: chain.logo || `https://icons.llama.fi/${chain.id}.jpg`
  }))

  console.log(`[Indexer] ✓ Adicionando ${blockchainEntries.length} blockchains do BLOCKCHAIN_REGISTRY`)

  return blockchainEntries
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

  // Remover duplicatas + CLASSIFICAÇÃO INTELIGENTE
  const uniqueItems = new Map<string, IndexedItem>()
  let reclassifiedCount = 0

  for (const item of allItems) {
    const key = item.id.toLowerCase()
    const existing = uniqueItems.get(key)

    if (!existing) {
      // Classificar item antes de adicionar
      const classification = classifyItem({
        id: item.id,
        name: item.name,
        symbol: item.symbol,
        chains: item.chains,
        category: item.category,
        tvl: item.tvl,
        originalType: item.type
      })

      // Se a classificação é de alta confiança e diferente, usar a nova
      const finalType = classification.confidence === 'high'
        ? classification.type as IndexedItem['type']
        : item.type

      if (finalType !== item.type) {
        console.log(`[Classifier] 🔄 ${item.name}: ${item.type} → ${finalType} (${classification.reason})`)
        reclassifiedCount++
      }

      uniqueItems.set(key, { ...item, type: finalType })
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

      // RECLASSIFICAR com dados completos
      const reclassification = shouldReclassify(merged.type, {
        id: merged.id,
        name: merged.name,
        symbol: merged.symbol,
        chains: merged.chains,
        category: merged.category,
        tvl: merged.tvl
      })

      if (reclassification) {
        console.log(`[Classifier] 🔄 ${merged.name}: ${merged.type} → ${reclassification.newType} (${reclassification.reason})`)
        merged.type = reclassification.newType as IndexedItem['type']
        reclassifiedCount++
      }

      uniqueItems.set(key, merged)
    }
  }

  console.log(`[Classifier] ✓ Reclassificados: ${reclassifiedCount} itens`)

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
