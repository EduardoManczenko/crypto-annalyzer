/**
 * Sistema ultra robusto de fetching com múltiplos fallbacks e retry
 * Garante que dados sejam obtidos mesmo em caso de falhas parciais
 */

import axios, { AxiosRequestConfig } from 'axios'
import { withCache } from './persistent-cache'

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
  maxRetries: number = 4,
  initialDelay: number = 1000,
  operationName: string = 'operation'
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries - 1

      if (isLastAttempt) {
        console.error(`[Retry] ✗ ${operationName} falhou após ${maxRetries} tentativas:`, error.message)
        throw error
      }

      const delay = initialDelay * Math.pow(2, attempt)
      console.log(`[Retry] ⚠ ${operationName} falhou (tentativa ${attempt + 1}/${maxRetries}), retry em ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new Error(`Max retries exceeded for ${operationName}`)
}

/**
 * Busca DeFiLlama com múltiplos fallbacks
 */
export async function fetchDeFiLlamaProtocol(slug: string) {
  const cacheKey = `defillama_protocol_${slug}`

  return withCache(cacheKey, async () => {
    console.log(`[DeFiLlama] Buscando protocolo: ${slug}`)

    // FALLBACK 1: Endpoint padrão de protocolo
    try {
      const response = await retryWithBackoff(
        () => axiosInstance.get(`https://api.llama.fi/protocol/${slug}`),
        3,
        1000,
        `DeFiLlama protocol ${slug}`
      )
      console.log(`[DeFiLlama] ✓ Dados obtidos via endpoint principal`)
      return response.data
    } catch (error) {
      console.log(`[DeFiLlama] ⚠ Endpoint principal falhou, tentando fallbacks...`)
    }

    // FALLBACK 2: Buscar na lista de todos os protocolos
    try {
      console.log(`[DeFiLlama] Tentando via lista de protocolos...`)
      const response = await retryWithBackoff(
        () => axiosInstance.get('https://api.llama.fi/protocols'),
        2,
        1000,
        'DeFiLlama protocols list'
      )

      const protocol = response.data.find((p: any) =>
        p.slug === slug ||
        p.name.toLowerCase() === slug.toLowerCase() ||
        p.name.toLowerCase().replace(/\s+/g, '-') === slug
      )

      if (protocol) {
        console.log(`[DeFiLlama] ✓ Protocolo encontrado na lista`)
        // Tentar buscar detalhes completos
        try {
          const detailsResponse = await axiosInstance.get(`https://api.llama.fi/protocol/${protocol.slug}`)
          return detailsResponse.data
        } catch {
          // Retornar dados básicos se detalhes falharem
          return protocol
        }
      }
    } catch (error) {
      console.log(`[DeFiLlama] ⚠ Fallback lista de protocolos falhou`)
    }

    // FALLBACK 3: Tentar endpoint de TVL histórico
    try {
      console.log(`[DeFiLlama] Tentando endpoint de TVL histórico...`)
      const response = await retryWithBackoff(
        () => axiosInstance.get(`https://api.llama.fi/tvl/${slug}`),
        2,
        1000,
        `DeFiLlama TVL ${slug}`
      )
      console.log(`[DeFiLlama] ✓ Dados de TVL obtidos`)
      return { tvl: response.data, name: slug }
    } catch (error) {
      console.log(`[DeFiLlama] ⚠ Endpoint de TVL falhou`)
    }

    console.log(`[DeFiLlama] ✗ Todos os fallbacks falharam para ${slug}`)
    return null
  }, 3600) // Cache de 1 hora
}

/**
 * Busca dados históricos de TVL do DeFiLlama
 */
export async function fetchDeFiLlamaTVLHistory(slug: string) {
  const cacheKey = `defillama_tvl_history_${slug}`

  return withCache(cacheKey, async () => {
    console.log(`[DeFiLlama] Buscando histórico de TVL: ${slug}`)

    // Tentar múltiplos endpoints
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

        // Se tem array de TVL, sucesso
        if (response.data.tvl && Array.isArray(response.data.tvl)) {
          console.log(`[DeFiLlama] ✓ Histórico de TVL obtido: ${response.data.tvl.length} pontos`)
          return response.data.tvl
        }
      } catch (error) {
        console.log(`[DeFiLlama] Endpoint ${endpoint} falhou para histórico`)
      }
    }

    console.log(`[DeFiLlama] ✗ Nenhum histórico de TVL disponível para ${slug}`)
    return null
  }, 7200) // Cache de 2 horas para histórico
}

/**
 * Busca chains do DeFiLlama
 */
export async function fetchDeFiLlamaChain(chainName: string) {
  const cacheKey = `defillama_chain_${chainName.toLowerCase()}`

  return withCache(cacheKey, async () => {
    console.log(`[DeFiLlama] Buscando chain: ${chainName}`)

    try {
      const response = await retryWithBackoff(
        () => axiosInstance.get('https://api.llama.fi/v2/chains'),
        3,
        1000,
        'DeFiLlama chains'
      )

      const chain = response.data.find((c: any) =>
        c.name.toLowerCase() === chainName.toLowerCase() ||
        c.gecko_id?.toLowerCase() === chainName.toLowerCase()
      )

      if (chain) {
        console.log(`[DeFiLlama] ✓ Chain encontrada: ${chain.name}`)
        return chain
      }

      console.log(`[DeFiLlama] ✗ Chain não encontrada: ${chainName}`)
      return null
    } catch (error: any) {
      console.error(`[DeFiLlama] Erro ao buscar chain:`, error.message)
      return null
    }
  }, 3600)
}

/**
 * Busca CoinGecko com fallbacks
 */
export async function fetchCoinGecko(query: string) {
  const cacheKey = `coingecko_${query.toLowerCase()}`

  return withCache(cacheKey, async () => {
    console.log(`[CoinGecko] Buscando: ${query}`)

    // FALLBACK 1: Buscar por nome/símbolo
    try {
      const searchResponse = await retryWithBackoff(
        () => axiosInstance.get('https://api.coingecko.com/api/v3/search', {
          params: { query }
        }),
        3,
        2000, // CoinGecko tem rate limit mais agressivo
        `CoinGecko search ${query}`
      )

      const coin = searchResponse.data.coins?.[0]
      if (!coin) {
        console.log(`[CoinGecko] ✗ Nenhuma moeda encontrada para: ${query}`)
        return null
      }

      console.log(`[CoinGecko] ✓ Moeda encontrada: ${coin.name} (${coin.id})`)

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
        3,
        2000,
        `CoinGecko coin ${coin.id}`
      )

      console.log(`[CoinGecko] ✓ Dados completos obtidos para ${coin.id}`)
      return {
        ...coinResponse.data,
        _coinId: coin.id
      }
    } catch (error: any) {
      console.error(`[CoinGecko] Erro:`, error.message)
      return null
    }
  }, 1800) // Cache de 30 minutos (CoinGecko muda mais rápido)
}

/**
 * Busca histórico de preços do CoinGecko com fallbacks
 */
export async function fetchCoinGeckoPriceHistory(coinId: string) {
  const cacheKey = `coingecko_history_${coinId}`

  return withCache(cacheKey, async () => {
    console.log(`[CoinGecko] Buscando histórico de preços: ${coinId}`)

    const periods = [
      { days: 1, label: '24h' },
      { days: 7, label: '7d' },
      { days: 30, label: '30d' },
      { days: 365, label: '365d' }
    ]

    const results: any = {}

    // Buscar cada período independentemente
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
          `CoinGecko ${period.label} ${coinId}`
        )

        results[period.label] = response.data.prices?.map(([timestamp, price]: [number, number]) => ({
          timestamp,
          price
        })) || []

        console.log(`[CoinGecko] ✓ ${period.label}: ${results[period.label].length} pontos`)

        // Delay para evitar rate limit
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error: any) {
        console.log(`[CoinGecko] ⚠ Erro ao buscar ${period.label}:`, error.message)
        results[period.label] = []
      }
    }

    const hasAnyData = Object.values(results).some((arr: any) => arr.length > 0)

    if (!hasAnyData) {
      console.log(`[CoinGecko] ✗ Nenhum histórico disponível para ${coinId}`)
      return null
    }

    console.log(`[CoinGecko] ✓ Histórico obtido com sucesso`)
    return results
  }, 1800) // Cache de 30 minutos
}

/**
 * Busca dados de múltiplas fontes em paralelo com tratamento de erros individual
 */
export async function fetchMultiSource(query: string) {
  console.log(`[MultiSource] Buscando em múltiplas fontes: ${query}`)

  // Buscar em paralelo, mas com tratamento individual de erros
  const [defiData, coinData] = await Promise.allSettled([
    fetchDeFiLlamaProtocol(query.toLowerCase().replace(/\s+/g, '-')),
    fetchCoinGecko(query)
  ])

  return {
    defiData: defiData.status === 'fulfilled' ? defiData.value : null,
    coinData: coinData.status === 'fulfilled' ? coinData.value : null
  }
}
