/**
 * DefiLlama Web Scraper
 * Fallback para quando a API não retorna dados precisos
 * Faz scraping direto da página HTML do DefiLlama
 */

import { httpGetHTML } from './http-client';

export interface ScrapedProtocolData {
  tvl: number | null
  tvlChange24h: number | null
  tvlChange7d: number | null
  tvlChange30d: number | null
  category?: string
  chains?: Record<string, number>
  mcap?: number | null
}

/**
 * Extrai número de string formatada
 * Ex: "$6.28B" -> 6280000000
 */
function parseFormattedNumber(str: string): number | null {
  if (!str || typeof str !== 'string') return null

  // Remover símbolo de moeda e espaços
  let cleaned = str.replace(/[$,\s]/g, '').trim()

  // Extrair multiplicador (K, M, B, T)
  const multipliers: Record<string, number> = {
    'K': 1000,
    'M': 1000000,
    'B': 1000000000,
    'T': 1000000000000
  }

  let multiplier = 1
  const lastChar = cleaned.slice(-1).toUpperCase()

  if (multipliers[lastChar]) {
    multiplier = multipliers[lastChar]
    cleaned = cleaned.slice(0, -1)
  }

  const number = parseFloat(cleaned)
  if (isNaN(number)) return null

  return number * multiplier
}

/**
 * Extrai porcentagem de string
 * Ex: "+5.23%" -> 5.23, "-3.14%" -> -3.14
 */
function parsePercentage(str: string): number | null {
  if (!str || typeof str !== 'string') return null

  const cleaned = str.replace(/%/g, '').trim()
  const number = parseFloat(cleaned)

  return isNaN(number) ? null : number
}

/**
 * Faz scraping da página de protocolo do DefiLlama
 */
export async function scrapeProtocolPage(slug: string): Promise<ScrapedProtocolData | null> {
  try {
    console.log(`[DefiLlama Scraper] Fazendo scraping de: ${slug}`)

    const url = `https://defillama.com/protocol/${slug}`
    const html = await httpGetHTML(url, { timeout: 20000 })

    console.log(`[DefiLlama Scraper] HTML obtido (${html.length} chars)`)

    // O DefiLlama renderiza dados em um script __NEXT_DATA__
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)

    if (nextDataMatch && nextDataMatch[1]) {
      try {
        const nextData = JSON.parse(nextDataMatch[1])
        const pageProps = nextData?.props?.pageProps

        if (pageProps) {
          console.log('[DefiLlama Scraper] Dados encontrados no __NEXT_DATA__')

          // Extrair TVL
          let tvl: number | null = null

          // Tentar de múltiplas fontes
          if (pageProps.tvl && Array.isArray(pageProps.tvl) && pageProps.tvl.length > 0) {
            const latest = pageProps.tvl[pageProps.tvl.length - 1]
            tvl = latest.totalLiquidityUSD || null
          } else if (typeof pageProps.tvl === 'number') {
            tvl = pageProps.tvl
          }

          // Extrair mudanças de TVL
          const tvlChange24h = pageProps.change_1d ?? null
          const tvlChange7d = pageProps.change_7d ?? null
          const tvlChange30d = pageProps.change_1m ?? null

          // Extrair chains
          let chains: Record<string, number> | undefined = undefined
          if (pageProps.currentChainTvls) {
            chains = {}
            Object.entries(pageProps.currentChainTvls).forEach(([chain, value]) => {
              if (typeof value === 'number') {
                // Filtrar chains especiais
                if (!chain.includes('-borrowed') &&
                    !chain.includes('-staking') &&
                    !chain.includes('-pool2') &&
                    chain !== 'staking' &&
                    chain !== 'pool2' &&
                    chain !== 'borrowed') {
                  chains![chain] = value
                }
              }
            })
          }

          const result = {
            tvl,
            tvlChange24h,
            tvlChange7d,
            tvlChange30d,
            category: pageProps.category || undefined,
            chains: chains && Object.keys(chains).length > 0 ? chains : undefined,
            mcap: pageProps.mcap || null
          }

          console.log('[DefiLlama Scraper] ✓ Dados extraídos:', {
            tvl: tvl ? `$${(tvl / 1e9).toFixed(3)}B` : 'N/A',
            tvlChange24h: tvlChange24h !== null ? `${tvlChange24h.toFixed(2)}%` : 'N/A',
            chains: chains ? Object.keys(chains).length : 0
          })

          return result
        }
      } catch (parseError) {
        console.error('[DefiLlama Scraper] Erro ao parsear __NEXT_DATA__:', parseError)
      }
    }

    // Fallback: tentar extrair do HTML usando regex (menos confiável)
    console.log('[DefiLlama Scraper] Tentando fallback de regex no HTML...')

    // Procurar por padrões comuns de TVL na página
    const tvlPatterns = [
      /TVL[:\s]*\$?([\d.]+[KMBTkmbt]?)/i,
      /Total Value Locked[:\s]*\$?([\d.]+[KMBTkmbt]?)/i,
      /"tvl"[:\s]*([\d.]+)/i
    ]

    let tvl: number | null = null

    for (const pattern of tvlPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        tvl = parseFormattedNumber(match[1])
        if (tvl) {
          console.log(`[DefiLlama Scraper] TVL encontrado via regex: $${(tvl / 1e9).toFixed(3)}B`)
          break
        }
      }
    }

    if (tvl) {
      return {
        tvl,
        tvlChange24h: null,
        tvlChange7d: null,
        tvlChange30d: null
      }
    }

    console.log('[DefiLlama Scraper] ✗ Nenhum dado extraído')
    return null
  } catch (error: any) {
    console.error(`[DefiLlama Scraper] Erro ao fazer scraping de ${slug}:`, error.message)
    return null
  }
}

/**
 * Faz scraping da página de chain do DefiLlama
 */
export async function scrapeChainPage(chainName: string): Promise<ScrapedProtocolData | null> {
  try {
    console.log(`[DefiLlama Scraper] Fazendo scraping da chain: ${chainName}`)

    const url = `https://defillama.com/chain/${chainName}`
    const html = await httpGetHTML(url, { timeout: 20000 })

    console.log(`[DefiLlama Scraper] HTML da chain obtido (${html.length} chars)`)

    // Tentar extrair dados do __NEXT_DATA__
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)

    if (nextDataMatch && nextDataMatch[1]) {
      try {
        const nextData = JSON.parse(nextDataMatch[1])
        const pageProps = nextData?.props?.pageProps

        if (pageProps) {
          const tvl = pageProps.tvl || null
          const change_1d = pageProps.change_1d ?? null
          const change_7d = pageProps.change_7d ?? null
          const change_1m = pageProps.change_1m ?? null

          console.log('[DefiLlama Scraper] ✓ Dados da chain extraídos:', {
            tvl: tvl ? `$${(tvl / 1e9).toFixed(3)}B` : 'N/A'
          })

          return {
            tvl,
            tvlChange24h: change_1d,
            tvlChange7d: change_7d,
            tvlChange30d: change_1m
          }
        }
      } catch (parseError) {
        console.error('[DefiLlama Scraper] Erro ao parsear dados da chain:', parseError)
      }
    }

    console.log('[DefiLlama Scraper] ✗ Nenhum dado da chain extraído')
    return null
  } catch (error: any) {
    console.error(`[DefiLlama Scraper] Erro ao fazer scraping da chain ${chainName}:`, error.message)
    return null
  }
}

/**
 * Tenta múltiplas variações do nome para scraping
 */
export async function scrapeWithVariations(query: string): Promise<ScrapedProtocolData | null> {
  // Normalizar query
  const normalized = query.toLowerCase().trim()

  // Gerar variações
  const variations = [
    normalized,
    normalized.replace(/\s+/g, '-'),
    normalized.replace(/\s+/g, ''),
    normalized.replace(/[^a-z0-9]/g, '-')
  ]

  // Tentar cada variação
  for (const variation of variations) {
    const data = await scrapeProtocolPage(variation)
    if (data && data.tvl) {
      console.log(`[DefiLlama Scraper] ✓ Sucesso com variação: ${variation}`)
      return data
    }
  }

  console.log('[DefiLlama Scraper] ✗ Nenhuma variação funcionou')
  return null
}
