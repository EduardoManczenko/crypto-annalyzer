/**
 * CoinGecko API Client
 * Responsável por todas as interações com a API do CoinGecko
 */

import { httpGet } from './http-client';

const API_BASE = 'https://api.coingecko.com/api/v3'

export interface PricePoint {
  timestamp: number
  price: number
}

export interface ChartData {
  '24h': PricePoint[]
  '7d': PricePoint[]
  '30d': PricePoint[]
  '365d': PricePoint[]
}

export interface CoinGeckoSearchResult {
  id: string
  name: string
  symbol: string
  market_cap_rank: number | null
  thumb: string
  large: string
}

export interface CoinGeckoMarketData {
  current_price?: { usd: number }
  market_cap?: { usd: number }
  fully_diluted_valuation?: { usd: number | null }
  total_volume?: { usd: number }
  circulating_supply?: number
  total_supply?: number | null
  max_supply?: number | null
  price_change_percentage_24h?: number
  price_change_percentage_7d?: number
  price_change_percentage_30d?: number
  price_change_percentage_1y?: number
}

export interface CoinGeckoCoinData {
  id: string
  symbol: string
  name: string
  image?: {
    thumb: string
    small: string
    large: string
  }
  market_data?: CoinGeckoMarketData
  categories?: string[]
  description?: {
    en: string
  }
}

/**
 * Busca moeda no CoinGecko
 */
export async function searchCoin(query: string): Promise<CoinGeckoCoinData | null> {
  try {
    console.log(`[CoinGecko API] Buscando: ${query}`)

    // Buscar
    const searchData = await httpGet(`${API_BASE}/search?query=${encodeURIComponent(query)}`, { timeout: 15000 })

    const coins = searchData.coins
    if (!coins || coins.length === 0) {
      console.log(`[CoinGecko API] Nenhuma moeda encontrada para: ${query}`)
      return null
    }

    const coin = coins[0]
    console.log(`[CoinGecko API] Moeda encontrada: ${coin.name} (${coin.id})`)

    // Obter detalhes
    const coinData = await httpGet(
      `${API_BASE}/coins/${coin.id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`,
      { timeout: 15000 }
    )

    console.log(`[CoinGecko API] ✓ Dados obtidos para ${coin.id}`)

    return coinData
  } catch (error: any) {
    console.error('[CoinGecko API] Erro na busca:', error.message)
    return null
  }
}

/**
 * Busca histórico de preços para um período específico
 */
async function fetchPeriodPrices(
  coinId: string,
  days: number,
  label: string
): Promise<PricePoint[]> {
  try {
    console.log(`[CoinGecko API] Buscando ${label} para ${coinId}...`)

    const interval = days === 1 ? 'hourly' : 'daily'
    const data = await httpGet(
      `${API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`,
      { timeout: 15000 }
    )

    const prices = data.prices || []
    const formatted = prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price
    }))

    console.log(`[CoinGecko API] ✓ ${label}: ${formatted.length} pontos`)
    return formatted
  } catch (error: any) {
    console.error(`[CoinGecko API] Erro ao buscar ${label}:`, error.message)
    return []
  }
}

/**
 * Busca histórico de preços completo (todos os períodos)
 */
export async function fetchPriceHistory(coinId: string): Promise<ChartData | null> {
  try {
    console.log(`[CoinGecko API] Buscando histórico completo para: ${coinId}`)

    // Buscar todos os períodos em paralelo
    const [data24h, data7d, data30d, data365d] = await Promise.all([
      fetchPeriodPrices(coinId, 1, '24h'),
      fetchPeriodPrices(coinId, 7, '7d'),
      fetchPeriodPrices(coinId, 30, '30d'),
      fetchPeriodPrices(coinId, 365, '365d')
    ])

    // Verificar se obtivemos algum dado
    const hasAnyData = data24h.length > 0 || data7d.length > 0 || data30d.length > 0 || data365d.length > 0

    if (!hasAnyData) {
      console.log('[CoinGecko API] ✗ Nenhum histórico de preços disponível')
      return null
    }

    console.log('[CoinGecko API] ✓ Histórico completo obtido:', {
      '24h': data24h.length,
      '7d': data7d.length,
      '30d': data30d.length,
      '365d': data365d.length
    })

    return {
      '24h': data24h,
      '7d': data7d,
      '30d': data30d,
      '365d': data365d
    }
  } catch (error: any) {
    console.error('[CoinGecko API] Erro ao buscar histórico:', error.message)
    return null
  }
}

/**
 * Busca dados de mercado simplificados
 */
export async function fetchMarketData(coinId: string): Promise<CoinGeckoMarketData | null> {
  try {
    console.log(`[CoinGecko API] Buscando dados de mercado para: ${coinId}`)

    const data = await httpGet(
      `${API_BASE}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`,
      { timeout: 15000 }
    )

    const marketData = data.market_data
    if (!marketData) {
      console.log('[CoinGecko API] ✗ Sem dados de mercado')
      return null
    }

    console.log('[CoinGecko API] ✓ Dados de mercado obtidos')
    return marketData
  } catch (error: any) {
    console.error('[CoinGecko API] Erro ao buscar dados de mercado:', error.message)
    return null
  }
}

/**
 * Gera URL da página da moeda no CoinGecko
 */
export function getCoinUrl(coinId: string): string {
  return `https://www.coingecko.com/en/coins/${coinId}`
}

/**
 * Gera URL da API da moeda
 */
export function getCoinApiUrl(coinId: string): string {
  return `${API_BASE}/coins/${coinId}`
}

/**
 * Extrai ID da moeda a partir dos dados de busca
 */
export function extractCoinId(coinData: CoinGeckoCoinData | null): string | null {
  return coinData?.id || null
}
