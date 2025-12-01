/**
 * Sistema ULTRA ROBUSTO de fetching - VERSÃO 2.0
 * Usa aliases, múltiplas estratégias e matching inteligente
 */

import axios from 'axios'
import { withCache } from './persistent-cache'
import { resolveAlias, generateQueryVariations, KNOWN_ALIASES } from './known-aliases'

const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
  }
})

/**
 * Retry com backoff exponencial
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  operationName: string = 'operation'
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries - 1

      if (isLastAttempt) {
        console.error(`[Retry] ✗ ${operationName} falhou após ${maxRetries} tentativas`)
        throw error
      }

      const delay = initialDelay * Math.pow(2, attempt)
      console.log(`[Retry] ⚠ ${operationName} tentativa ${attempt + 1}/${maxRetries}, retry em ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new Error(`Max retries exceeded for ${operationName}`)
}

/**
 * ESTRATÉGIA 1: Buscar protocolo DeFiLlama por slug direto
 */
async function fetchDeFiLlamaBySlug(slug: string): Promise<any> {
  console.log(`[DeFiLlama] Tentando buscar por slug: ${slug}`)

  try {
    const response = await retryWithBackoff(
      () => axiosInstance.get(`https://api.llama.fi/protocol/${slug}`),
      2,
      1000,
      `DeFiLlama protocol ${slug}`
    )
    console.log(`[DeFiLlama] ✓ Encontrado via slug: ${slug}`)
    return response.data
  } catch (error) {
    console.log(`[DeFiLlama] ✗ Slug ${slug} não encontrado`)
    return null
  }
}

/**
 * ESTRATÉGIA 2: Buscar na lista completa de protocolos
 */
async function fetchDeFiLlamaFromList(query: string): Promise<any> {
  console.log(`[DeFiLlama] Buscando "${query}" na lista completa...`)

  try {
    const response = await retryWithBackoff(
      () => axiosInstance.get('https://api.llama.fi/protocols'),
      2,
      1000,
      'DeFiLlama protocols list'
    )

    const protocols = response.data
    const queryLower = query.toLowerCase()

    // Tentar match exato de nome ou slug
    let found = protocols.find((p: any) =>
      p.slug === queryLower ||
      p.name.toLowerCase() === queryLower ||
      p.symbol?.toLowerCase() === queryLower
    )

    // Se não encontrou, tentar match parcial
    if (!found) {
      found = protocols.find((p: any) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.slug.includes(queryLower)
      )
    }

    if (found) {
      console.log(`[DeFiLlama] ✓ Encontrado na lista: ${found.name} (${found.slug})`)
      // Buscar detalhes completos
      try {
        const details = await axiosInstance.get(`https://api.llama.fi/protocol/${found.slug}`)
        return details.data
      } catch {
        return found // Retornar dados básicos se detalhes falharem
      }
    }

    console.log(`[DeFiLlama] ✗ Não encontrado na lista: ${query}`)
    return null
  } catch (error) {
    console.error(`[DeFiLlama] Erro ao buscar lista:`, error)
    return null
  }
}

/**
 * ESTRATÉGIA 3: Buscar chain no DeFiLlama
 */
async function fetchDeFiLlamaChain(query: string): Promise<any> {
  console.log(`[DeFiLlama] Buscando chain: ${query}`)

  try {
    const response = await retryWithBackoff(
      () => axiosInstance.get('https://api.llama.fi/v2/chains'),
      2,
      1000,
      'DeFiLlama chains'
    )

    const chains = response.data
    const queryLower = query.toLowerCase()

    const found = chains.find((c: any) =>
      c.name.toLowerCase() === queryLower ||
      c.gecko_id?.toLowerCase() === queryLower ||
      c.tokenSymbol?.toLowerCase() === queryLower
    )

    if (found) {
      console.log(`[DeFiLlama] ✓ Chain encontrada: ${found.name}`)
      return {
        name: found.name,
        symbol: found.tokenSymbol,
        tvl: found.tvl,
        type: 'chain',
        ...found
      }
    }

    console.log(`[DeFiLlama] ✗ Chain não encontrada: ${query}`)
    return null
  } catch (error) {
    console.error(`[DeFiLlama] Erro ao buscar chains:`, error)
    return null
  }
}

/**
 * Busca COMPLETA no DeFiLlama com múltiplas estratégias
 */
export async function fetchDeFiLlamaProtocol(query: string) {
  const cacheKey = `defillama_v2_${query.toLowerCase()}`

  return withCache(cacheKey, async () => {
    console.log(`\n[DeFiLlama] ========== BUSCANDO: ${query} ==========`)

    // PASSO 1: Verificar se temos alias conhecido
    const alias = resolveAlias(query)
    const searchQueries = alias?.defiLlamaSlug
      ? [alias.defiLlamaSlug, ...generateQueryVariations(query)]
      : generateQueryVariations(query)

    console.log(`[DeFiLlama] Tentando ${searchQueries.length} variações...`)

    // PASSO 2: Tentar buscar por cada variação
    for (const searchQuery of searchQueries) {
      // Estratégia 1: Slug direto
      const resultSlug = await fetchDeFiLlamaBySlug(searchQuery)
      if (resultSlug) return resultSlug

      // Delay para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    // PASSO 3: Buscar na lista completa
    const resultList = await fetchDeFiLlamaFromList(query)
    if (resultList) return resultList

    // PASSO 4: Tentar como chain
    const resultChain = await fetchDeFiLlamaChain(query)
    if (resultChain) return resultChain

    console.log(`[DeFiLlama] ✗ FALHOU - Nenhuma estratégia funcionou para: ${query}`)
    return null
  }, 3600)
}

/**
 * Busca histórico de TVL
 */
export async function fetchDeFiLlamaTVLHistory(slug: string) {
  const cacheKey = `defillama_tvl_history_v2_${slug}`

  return withCache(cacheKey, async () => {
    console.log(`[DeFiLlama TVL History] Buscando: ${slug}`)

    const endpoints = [
      `https://api.llama.fi/protocol/${slug}`,
      `https://api.llama.fi/tvl/${slug}`
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await retryWithBackoff(
          () => axiosInstance.get(endpoint),
          2,
          1000,
          `TVL history ${slug}`
        )

        if (response.data.tvl && Array.isArray(response.data.tvl)) {
          console.log(`[DeFiLlama TVL History] ✓ ${response.data.tvl.length} pontos`)
          return response.data.tvl
        }
      } catch (error) {
        console.log(`[DeFiLlama TVL History] ✗ Endpoint ${endpoint} falhou`)
      }
    }

    console.log(`[DeFiLlama TVL History] ✗ Nenhum histórico disponível`)
    return null
  }, 7200)
}

/**
 * BUSCA COMPLETA no CoinGecko com aliases
 */
export async function fetchCoinGecko(query: string) {
  const cacheKey = `coingecko_v2_${query.toLowerCase()}`

  return withCache(cacheKey, async () => {
    console.log(`\n[CoinGecko] ========== BUSCANDO: ${query} ==========`)

    // PASSO 1: Verificar alias conhecido
    const alias = resolveAlias(query)
    const coinGeckoId = alias?.coinGeckoId

    // Se temos ID direto, tentar buscar
    if (coinGeckoId) {
      console.log(`[CoinGecko] Tentando ID do alias: ${coinGeckoId}`)
      try {
        const response = await retryWithBackoff(
          () => axiosInstance.get(`https://api.coingecko.com/api/v3/coins/${coinGeckoId}`, {
            params: {
              localization: false,
              tickers: false,
              community_data: false,
              developer_data: false
            }
          }),
          2,
          2000,
          `CoinGecko direct ${coinGeckoId}`
        )

        console.log(`[CoinGecko] ✓ Encontrado via alias: ${coinGeckoId}`)
        return {
          ...response.data,
          _coinId: coinGeckoId
        }
      } catch (error) {
        console.log(`[CoinGecko] ✗ ID do alias falhou: ${coinGeckoId}`)
      }
    }

    // PASSO 2: Buscar via search com múltiplas variações
    const searchQueries = generateQueryVariations(query)

    for (const searchQuery of searchQueries) {
      try {
        console.log(`[CoinGecko] Tentando busca: ${searchQuery}`)

        const searchResponse = await retryWithBackoff(
          () => axiosInstance.get('https://api.coingecko.com/api/v3/search', {
            params: { query: searchQuery }
          }),
          2,
          2000,
          `CoinGecko search ${searchQuery}`
        )

        const coin = searchResponse.data.coins?.[0]
        if (!coin) {
          console.log(`[CoinGecko] ✗ Nenhum resultado para: ${searchQuery}`)
          continue
        }

        console.log(`[CoinGecko] ✓ Encontrado: ${coin.name} (${coin.id})`)

        // Buscar dados completos
        const coinResponse = await retryWithBackoff(
          () => axiosInstance.get(`https://api.coingecko.com/api/v3/coins/${coin.id}`, {
            params: {
              localization: false,
              tickers: false,
              community_data: false,
              developer_data: false
            }
          }),
          2,
          2000,
          `CoinGecko coin ${coin.id}`
        )

        console.log(`[CoinGecko] ✓ Dados completos obtidos`)
        return {
          ...coinResponse.data,
          _coinId: coin.id
        }
      } catch (error) {
        console.log(`[CoinGecko] ✗ Falhou para: ${searchQuery}`)
      }

      // Delay entre tentativas
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`[CoinGecko] ✗ FALHOU - Nenhuma estratégia funcionou para: ${query}`)
    return null
  }, 1800)
}

/**
 * Busca histórico de preços do CoinGecko
 */
export async function fetchCoinGeckoPriceHistory(coinId: string) {
  const cacheKey = `coingecko_history_v2_${coinId}`

  return withCache(cacheKey, async () => {
    console.log(`[CoinGecko History] Buscando: ${coinId}`)

    const periods = [
      { days: 1, label: '24h' },
      { days: 7, label: '7d' },
      { days: 30, label: '30d' },
      { days: 365, label: '365d' }
    ]

    const results: any = {}

    for (const period of periods) {
      try {
        const response = await retryWithBackoff(
          () => axiosInstance.get(
            `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
            {
              params: {
                vs_currency: 'usd',
                days: period.days,
                interval: period.days === 1 ? 'hourly' : 'daily'
              }
            }
          ),
          2,
          2000,
          `CoinGecko ${period.label}`
        )

        results[period.label] = response.data.prices?.map(([timestamp, price]: [number, number]) => ({
          timestamp,
          price
        })) || []

        console.log(`[CoinGecko History] ✓ ${period.label}: ${results[period.label].length} pontos`)
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.log(`[CoinGecko History] ✗ ${period.label} falhou`)
        results[period.label] = []
      }
    }

    const hasAnyData = Object.values(results).some((arr: any) => arr.length > 0)
    if (!hasAnyData) {
      console.log(`[CoinGecko History] ✗ Nenhum histórico disponível`)
      return null
    }

    return results
  }, 1800)
}
