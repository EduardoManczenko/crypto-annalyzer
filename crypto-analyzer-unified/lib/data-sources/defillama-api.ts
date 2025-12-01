/**
 * DefiLlama API Client
 * Responsável por todas as interações com a API do DefiLlama
 */

import { httpGet } from './http-client';

const API_BASE = 'https://api.llama.fi'

export interface DefiLlamaProtocol {
  id: string
  name: string
  address?: string
  symbol: string
  url: string
  description?: string
  chain: string
  logo?: string
  audits?: string
  audit_note?: string
  gecko_id?: string
  cmcId?: string
  category: string
  chains: string[]
  module?: string
  twitter?: string
  forkedFrom?: string[]
  oracles?: string[]
  slug: string
  tvl: number
  chainTvls: Record<string, number>
  change_1h?: number
  change_1d?: number
  change_7d?: number
  change_1m?: number
  staking?: number
  fdv?: number
  mcap?: number
}

export interface DefiLlamaProtocolDetails {
  id: string
  name: string
  address?: string
  symbol: string
  url: string
  description?: string
  chain: string
  logo?: string
  audits?: string
  gecko_id?: string
  cmcId?: string
  category: string
  chains: string[]
  slug: string
  tvl: number | Array<{ date: number; totalLiquidityUSD: number }>
  currentChainTvls?: Record<string, number>
  chainTvls?: Record<string, number | Array<{ date: number; tvl: number }>>
  change_1h?: number
  change_1d?: number
  change_7d?: number
  change_1m?: number
  mcap?: number
  twitter?: string
  audit_links?: string[]
}

export interface DefiLlamaChain {
  gecko_id: string
  tvl: number
  tokenSymbol: string
  cmcId: string
  name: string
  chainId?: number
}

/**
 * Busca lista de todos os protocolos
 */
export async function fetchProtocols(): Promise<DefiLlamaProtocol[]> {
  try {
    console.log('[DefiLlama API] Buscando lista de protocolos...')
    const data = await httpGet(`${API_BASE}/protocols`, { timeout: 15000 })
    console.log(`[DefiLlama API] ✓ ${data.length} protocolos obtidos`)
    return data
  } catch (error: any) {
    console.error('[DefiLlama API] Erro ao buscar protocolos:', error.message)
    throw error
  }
}

/**
 * Busca detalhes de um protocolo específico
 */
export async function fetchProtocolDetails(slug: string): Promise<DefiLlamaProtocolDetails> {
  try {
    console.log(`[DefiLlama API] Buscando detalhes de: ${slug}`)
    const data = await httpGet(`${API_BASE}/protocol/${slug}`, { timeout: 10000 })
    console.log(`[DefiLlama API] ✓ Detalhes obtidos para ${slug}`)

    // Log dos dados principais
    console.log(`[DefiLlama API] TVL type:`, typeof data.tvl)
    console.log(`[DefiLlama API] TVL value:`, Array.isArray(data.tvl)
      ? `Array com ${data.tvl.length} items`
      : data.tvl)

    if (Array.isArray(data.tvl) && data.tvl.length > 0) {
      const latest = data.tvl[data.tvl.length - 1]
      console.log(`[DefiLlama API] Último TVL do array: $${(latest.totalLiquidityUSD / 1e9).toFixed(3)}B`)
    }

    return data
  } catch (error: any) {
    console.error(`[DefiLlama API] Erro ao buscar protocolo ${slug}:`, error.message)
    throw error
  }
}

/**
 * Busca lista de chains
 */
export async function fetchChains(): Promise<DefiLlamaChain[]> {
  try {
    console.log('[DefiLlama API] Buscando lista de chains...')
    const data = await httpGet(`${API_BASE}/v2/chains`, { timeout: 15000 })
    console.log(`[DefiLlama API] ✓ ${data.length} chains obtidas`)
    return data
  } catch (error: any) {
    console.error('[DefiLlama API] Erro ao buscar chains:', error.message)
    throw error
  }
}

/**
 * Busca protocolo por nome ou slug
 */
export async function searchProtocol(query: string): Promise<DefiLlamaProtocolDetails | null> {
  try {
    const protocols = await fetchProtocols()

    const normalizedQuery = query.toLowerCase().trim()

    // Buscar por match exato primeiro
    const exactMatch = protocols.find(p =>
      p.slug.toLowerCase() === normalizedQuery ||
      p.name.toLowerCase() === normalizedQuery ||
      p.symbol?.toLowerCase() === normalizedQuery
    )

    if (exactMatch) {
      console.log(`[DefiLlama API] Match exato encontrado: ${exactMatch.name}`)
      return await fetchProtocolDetails(exactMatch.slug)
    }

    // Buscar por contém
    const partialMatch = protocols.find(p =>
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.slug.toLowerCase().includes(normalizedQuery)
    )

    if (partialMatch) {
      console.log(`[DefiLlama API] Match parcial encontrado: ${partialMatch.name}`)
      return await fetchProtocolDetails(partialMatch.slug)
    }

    console.log(`[DefiLlama API] Nenhum protocolo encontrado para: ${query}`)
    return null
  } catch (error: any) {
    console.error('[DefiLlama API] Erro na busca:', error.message)
    return null
  }
}

/**
 * Busca chain por nome
 */
export async function searchChain(query: string): Promise<DefiLlamaChain | null> {
  try {
    const chains = await fetchChains()

    const normalizedQuery = query.toLowerCase().trim()

    const found = chains.find(c =>
      c.name.toLowerCase() === normalizedQuery ||
      c.name.toLowerCase().includes(normalizedQuery) ||
      c.gecko_id?.toLowerCase() === normalizedQuery
    )

    if (found) {
      console.log(`[DefiLlama API] Chain encontrada: ${found.name}`)
    } else {
      console.log(`[DefiLlama API] Nenhuma chain encontrada para: ${query}`)
    }

    return found || null
  } catch (error: any) {
    console.error('[DefiLlama API] Erro ao buscar chain:', error.message)
    return null
  }
}

/**
 * Extrai TVL mais recente do protocolo
 */
export function extractLatestTVL(protocol: DefiLlamaProtocolDetails): number | null {
  if (!protocol) return null

  // Método 1: Array de TVL (mais preciso)
  if (Array.isArray(protocol.tvl) && protocol.tvl.length > 0) {
    const latest = protocol.tvl[protocol.tvl.length - 1]
    if (latest?.totalLiquidityUSD) {
      console.log(`[DefiLlama API] TVL extraído do array: $${(latest.totalLiquidityUSD / 1e9).toFixed(3)}B`)
      return latest.totalLiquidityUSD
    }
  }

  // Método 2: TVL direto
  if (typeof protocol.tvl === 'number') {
    console.log(`[DefiLlama API] TVL extraído direto: $${(protocol.tvl / 1e9).toFixed(3)}B`)
    return protocol.tvl
  }

  // Método 3: Somar currentChainTvls (fallback)
  if (protocol.currentChainTvls) {
    const filteredTvls = Object.entries(protocol.currentChainTvls)
      .filter(([chain, value]) => {
        if (typeof value !== 'number') return false
        if (chain.includes('-borrowed') || chain.includes('-staking') || chain.includes('-pool2')) return false
        if (chain === 'staking' || chain === 'pool2' || chain === 'borrowed') return false
        return true
      })
      .map(([, value]) => value as number)

    const total = filteredTvls.reduce((sum, tvl) => sum + tvl, 0)
    if (total > 0) {
      console.log(`[DefiLlama API] TVL calculado de chains: $${(total / 1e9).toFixed(3)}B`)
      return total
    }
  }

  console.log('[DefiLlama API] Nenhum TVL encontrado')
  return null
}

/**
 * Extrai chains TVLs filtrados
 */
export function extractChainTvls(protocol: DefiLlamaProtocolDetails): Record<string, number> | null {
  if (!protocol) return null

  const chainTvls = protocol.currentChainTvls || protocol.chainTvls
  if (!chainTvls || typeof chainTvls !== 'object') return null

  const filtered: Record<string, number> = {}

  Object.entries(chainTvls).forEach(([chain, value]) => {
    if (typeof value !== 'number') return
    if (chain.includes('-borrowed') || chain.includes('-staking') || chain.includes('-pool2')) return
    if (chain === 'staking' || chain === 'pool2' || chain === 'borrowed') return

    filtered[chain] = value
  })

  return Object.keys(filtered).length > 0 ? filtered : null
}

/**
 * Gera URL da página do protocolo no DefiLlama
 */
export function getProtocolUrl(slug: string): string {
  return `https://defillama.com/protocol/${slug}`
}

/**
 * Gera URL da API do protocolo
 */
export function getProtocolApiUrl(slug: string): string {
  return `${API_BASE}/protocol/${slug}`
}

/**
 * Gera URL da página da chain no DefiLlama
 */
export function getChainUrl(chainName: string): string {
  return `https://defillama.com/chain/${chainName}`
}
