/**
 * Múltiplas fontes de dados para crypto
 * Adiciona CoinMarketCap, CryptoCompare e outros além de DeFiLlama/CoinGecko
 */

import axios from 'axios'
import { withCache } from './persistent-cache'

const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
  }
})

/**
 * FONTE 3: CryptoCompare
 * Excelente para preços, supply e dados de mercado
 */
export async function fetchCryptoCompare(symbol: string) {
  const cacheKey = `cryptocompare_${symbol.toLowerCase()}`

  return withCache(cacheKey, async () => {
    console.log(`\n[CryptoCompare] ========== BUSCANDO: ${symbol} ==========`)

    try {
      // Buscar dados de preço e mercado
      const response = await axiosInstance.get(
        `https://min-api.cryptocompare.com/data/pricemultifull`,
        {
          params: {
            fsyms: symbol.toUpperCase(),
            tsyms: 'USD'
          }
        }
      )

      const data = response.data.RAW?.[symbol.toUpperCase()]?.USD

      if (!data) {
        console.log(`[CryptoCompare] ✗ Nenhum dado para: ${symbol}`)
        return null
      }

      console.log(`[CryptoCompare] ✓ Dados obtidos para ${symbol}`)
      console.log(`  - Preço: $${data.PRICE}`)
      console.log(`  - Market Cap: $${data.MKTCAP}`)
      console.log(`  - Supply: ${data.SUPPLY}`)

      return {
        price: data.PRICE,
        marketCap: data.MKTCAP,
        volume24h: data.TOTALVOLUME24HTO,
        supply: data.SUPPLY,
        change24h: data.CHANGEPCT24HOUR,
        high24h: data.HIGH24HOUR,
        low24h: data.LOW24HOUR,
        source: 'cryptocompare'
      }
    } catch (error: any) {
      console.log(`[CryptoCompare] ✗ Erro:`, error.message)
      return null
    }
  }, 1800) // Cache 30min
}

/**
 * FONTE 4: CoinMarketCap (via API pública)
 * Muito usado por analistas
 */
export async function fetchCoinMarketCapPublic(query: string) {
  const cacheKey = `coinmarketcap_${query.toLowerCase()}`

  return withCache(cacheKey, async () => {
    console.log(`\n[CoinMarketCap] ========== BUSCANDO: ${query} ==========`)

    try {
      // CMC tem API pública limitada, mas podemos tentar
      // Endpoint de quotes públicos
      const response = await axiosInstance.get(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`,
        {
          params: {
            symbol: query.toUpperCase()
          },
          headers: {
            'X-CMC_PRO_API_KEY': 'DEMO' // Modo demo limitado
          }
        }
      )

      const data = response.data.data?.[query.toUpperCase()]

      if (!data) {
        console.log(`[CoinMarketCap] ✗ Nenhum dado para: ${query}`)
        return null
      }

      console.log(`[CoinMarketCap] ✓ Dados obtidos`)
      return {
        price: data.quote.USD.price,
        marketCap: data.quote.USD.market_cap,
        volume24h: data.quote.USD.volume_24h,
        circulatingSupply: data.circulating_supply,
        totalSupply: data.total_supply,
        maxSupply: data.max_supply,
        change24h: data.quote.USD.percent_change_24h,
        change7d: data.quote.USD.percent_change_7d,
        source: 'coinmarketcap'
      }
    } catch (error: any) {
      console.log(`[CoinMarketCap] ✗ API indisponível (requer key)`)
      return null
    }
  }, 1800)
}

/**
 * FONTE 5: Dados adicionais do DeFiLlama
 * Endpoints alternativos para mais informações
 */
export async function fetchDeFiLlamaExtended(slug: string) {
  console.log(`[DeFiLlama Extended] Buscando dados extras: ${slug}`)

  try {
    // Endpoint de yields/pools para protocolos DeFi
    const poolsResponse = await axiosInstance.get(
      `https://yields.llama.fi/pools`
    )

    const pools = poolsResponse.data.data.filter((p: any) =>
      p.project?.toLowerCase() === slug.toLowerCase()
    )

    if (pools.length > 0) {
      console.log(`[DeFiLlama Extended] ✓ Encontrados ${pools.length} pools`)

      const totalTvl = pools.reduce((sum: number, p: any) => sum + (p.tvlUsd || 0), 0)

      return {
        pools: pools.length,
        totalPoolTvl: totalTvl,
        avgApy: pools.reduce((sum: number, p: any) => sum + (p.apy || 0), 0) / pools.length,
        source: 'defillama-extended'
      }
    }

    console.log(`[DeFiLlama Extended] ✗ Nenhum pool encontrado`)
    return null
  } catch (error) {
    console.log(`[DeFiLlama Extended] ✗ Erro ao buscar pools`)
    return null
  }
}

/**
 * FONTE 6: DeBank (dados de TVL e protocols)
 * Muito usado para análise de protocols
 */
export async function fetchDeBank(query: string) {
  const cacheKey = `debank_${query.toLowerCase()}`

  return withCache(cacheKey, async () => {
    console.log(`\n[DeBank] ========== BUSCANDO: ${query} ==========`)

    try {
      // DeBank tem API pública para alguns dados
      const response = await axiosInstance.get(
        `https://api.debank.com/project/v2/list`,
        {
          params: {
            chain: 'all'
          }
        }
      )

      const projects = response.data.data
      const found = projects.find((p: any) =>
        p.id.toLowerCase() === query.toLowerCase() ||
        p.name.toLowerCase().includes(query.toLowerCase())
      )

      if (found) {
        console.log(`[DeBank] ✓ Projeto encontrado: ${found.name}`)
        return {
          tvl: found.tvl_usd,
          chains: found.chain_list,
          category: found.tag,
          source: 'debank'
        }
      }

      console.log(`[DeBank] ✗ Projeto não encontrado`)
      return null
    } catch (error) {
      console.log(`[DeBank] ✗ API indisponível`)
      return null
    }
  }, 3600)
}

/**
 * Busca dados de supply de múltiplas fontes
 */
export async function fetchSupplyData(symbol: string, coinGeckoId?: string) {
  console.log(`\n[Supply Fetcher] ========== BUSCANDO SUPPLY: ${symbol} ==========`)

  const results: any[] = []

  // 1. CryptoCompare
  const ccData = await fetchCryptoCompare(symbol)
  if (ccData) {
    results.push({
      source: 'cryptocompare',
      circulating: ccData.supply,
      total: null,
      max: null
    })
  }

  // 2. CoinGecko (se temos ID)
  if (coinGeckoId) {
    try {
      const response = await axiosInstance.get(
        `https://api.coingecko.com/api/v3/coins/${coinGeckoId}`,
        {
          params: {
            localization: false,
            tickers: false,
            community_data: false,
            developer_data: false
          }
        }
      )

      results.push({
        source: 'coingecko',
        circulating: response.data.market_data?.circulating_supply,
        total: response.data.market_data?.total_supply,
        max: response.data.market_data?.max_supply
      })

      console.log(`[Supply Fetcher] ✓ CoinGecko:`, {
        circulating: response.data.market_data?.circulating_supply,
        total: response.data.market_data?.total_supply,
        max: response.data.market_data?.max_supply
      })
    } catch (error) {
      console.log(`[Supply Fetcher] ✗ CoinGecko falhou`)
    }
  }

  // Retornar o melhor resultado (o que tem mais dados)
  const best = results.reduce((prev, curr) => {
    const prevCount = [prev.circulating, prev.total, prev.max].filter(Boolean).length
    const currCount = [curr.circulating, curr.total, curr.max].filter(Boolean).length
    return currCount > prevCount ? curr : prev
  }, results[0])

  if (best) {
    console.log(`[Supply Fetcher] ✓ Melhor fonte: ${best.source}`)
    return best
  }

  console.log(`[Supply Fetcher] ✗ Nenhum supply encontrado`)
  return null
}
