/**
 * CLASSIFICADOR INTELIGENTE
 * Sistema robusto para detectar automaticamente se algo é chain/protocol/token
 */

import { BLOCKCHAIN_REGISTRY, findBlockchain } from './blockchain-registry'
import { KNOWN_ALIASES, resolveAlias } from './known-aliases'

export type ItemType = 'chain' | 'protocol' | 'token' | 'exchange'

export interface ClassificationResult {
  type: ItemType
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

/**
 * CLASSIFICADOR PRINCIPAL
 * Usa múltiplas heurísticas para determinar o tipo correto
 */
export function classifyItem(item: {
  id?: string
  name: string
  symbol?: string
  chains?: string[]
  category?: string
  tvl?: number
  originalType?: ItemType
}): ClassificationResult {
  const name = item.name.toLowerCase()
  const symbol = item.symbol?.toLowerCase()
  const id = item.id?.toLowerCase()

  // ============= PRIORIDADE 1: BLOCKCHAIN REGISTRY =============
  // Se está no registro de blockchains, É CHAIN com 100% certeza
  const blockchainEntry = findBlockchain(name) || findBlockchain(symbol || '') || findBlockchain(id || '')
  if (blockchainEntry) {
    return {
      type: 'chain',
      confidence: 'high',
      reason: `Encontrado em BLOCKCHAIN_REGISTRY (${blockchainEntry.category})`
    }
  }

  // ============= PRIORIDADE 2: KNOWN ALIASES =============
  // Se está nos aliases conhecidos, usar tipo definido
  const alias = resolveAlias(name) || resolveAlias(symbol || '') || resolveAlias(id || '')
  if (alias?.type) {
    return {
      type: alias.type as ItemType,
      confidence: 'high',
      reason: `Definido em KNOWN_ALIASES como '${alias.type}'`
    }
  }

  // ============= PRIORIDADE 3: PADRÕES DE NOME =============

  // 3.1 - Chains têm padrões específicos
  const chainPatterns = [
    /chain$/i,
    /network$/i,
    /blockchain$/i,
    /^l1/i,
    /^l2/i,
    /layer[- ]?[12]/i,
    /rollup$/i,
    /^zk/i, // zkSync, zkEVM, etc
    /sidechain$/i,
  ]

  for (const pattern of chainPatterns) {
    if (pattern.test(name) || pattern.test(symbol || '')) {
      return {
        type: 'chain',
        confidence: 'medium',
        reason: `Nome/símbolo contém padrão de blockchain: ${pattern}`
      }
    }
  }

  // 3.2 - Exchanges têm padrões
  const exchangePatterns = [
    /exchange$/i,
    /swap$/i,
    /dex$/i,
    /^dex/i,
  ]

  for (const pattern of exchangePatterns) {
    if (pattern.test(name)) {
      // Mas se tiver TVL e chains, provavelmente é protocol
      if (item.tvl && item.chains && item.chains.length > 0) {
        return {
          type: 'protocol',
          confidence: 'medium',
          reason: 'Nome sugere exchange mas tem TVL multi-chain (protocol)'
        }
      }
    }
  }

  // ============= PRIORIDADE 4: ANÁLISE DE DADOS =============

  // 4.1 - Se tem TVL e múltiplas chains, é protocol
  if (item.tvl && item.chains && item.chains.length > 1) {
    return {
      type: 'protocol',
      confidence: 'high',
      reason: `Tem TVL ($${(item.tvl / 1e9).toFixed(2)}B) em ${item.chains.length} chains`
    }
  }

  // 4.2 - Se tem TVL mas apenas 1 chain, pode ser protocol ou chain
  if (item.tvl && item.chains && item.chains.length === 1) {
    // Se a única chain é o próprio nome, É CHAIN
    const onlyChain = item.chains[0].toLowerCase()
    if (onlyChain === name || onlyChain === symbol) {
      return {
        type: 'chain',
        confidence: 'high',
        reason: 'TVL reportado na própria chain (é a chain base)'
      }
    }

    return {
      type: 'protocol',
      confidence: 'medium',
      reason: `Protocol com TVL em ${item.chains[0]}`
    }
  }

  // 4.3 - Se tem apenas TVL sem chains, provavelmente é chain
  if (item.tvl && (!item.chains || item.chains.length === 0)) {
    return {
      type: 'chain',
      confidence: 'medium',
      reason: 'Tem TVL mas sem lista de chains (provavelmente é a chain base)'
    }
  }

  // 4.4 - Análise por categoria DeFiLlama
  if (item.category) {
    const category = item.category.toLowerCase()

    // Categorias que indicam protocol
    const protocolCategories = [
      'dex', 'lending', 'yield', 'derivatives', 'cdp', 'synthetics',
      'liquid staking', 'bridge', 'staking', 'options', 'prediction market',
      'insurance', 'algo-stables', 'indexes', 'reserve currency', 'launchpad'
    ]

    if (protocolCategories.some(cat => category.includes(cat))) {
      return {
        type: 'protocol',
        confidence: 'high',
        reason: `Categoria DeFiLlama: ${item.category}`
      }
    }

    // Categoria que indica chain
    if (category === 'chain') {
      return {
        type: 'chain',
        confidence: 'high',
        reason: 'Categoria DeFiLlama: Chain'
      }
    }
  }

  // ============= PRIORIDADE 5: TIPO ORIGINAL (SE DISPONÍVEL) =============
  if (item.originalType) {
    return {
      type: item.originalType,
      confidence: 'low',
      reason: `Tipo original da fonte: ${item.originalType}`
    }
  }

  // ============= FALLBACK: TOKEN =============
  // Se não conseguimos determinar, assume token (mais genérico)
  return {
    type: 'token',
    confidence: 'low',
    reason: 'Não encontrado em registros, assumindo token genérico'
  }
}

/**
 * Verifica se um item deve ser reclassificado
 * Retorna o tipo correto se precisar mudar, ou null se está correto
 */
export function shouldReclassify(
  currentType: ItemType,
  item: {
    name: string
    symbol?: string
    id?: string
    chains?: string[]
    category?: string
    tvl?: number
  }
): { newType: ItemType; reason: string } | null {
  const classification = classifyItem({ ...item, originalType: currentType })

  // Se a classificação tem alta confiança e é diferente do tipo atual
  if (classification.confidence === 'high' && classification.type !== currentType) {
    return {
      newType: classification.type,
      reason: classification.reason
    }
  }

  // Se é média confiança mas o tipo atual é de baixa prioridade
  if (classification.confidence === 'medium' && classification.type !== currentType) {
    // Chains e protocols têm prioridade sobre tokens
    if (classification.type === 'chain' || classification.type === 'protocol') {
      if (currentType === 'token') {
        return {
          newType: classification.type,
          reason: classification.reason
        }
      }
    }
  }

  return null
}

/**
 * Classifica em lote com estatísticas
 */
export function classifyBatch(items: Array<{
  name: string
  symbol?: string
  id?: string
  type?: ItemType
  chains?: string[]
  category?: string
  tvl?: number
}>): {
  items: Array<{ item: any; classification: ClassificationResult }>
  stats: {
    total: number
    chains: number
    protocols: number
    tokens: number
    exchanges: number
    highConfidence: number
    reclassified: number
  }
} {
  const results = items.map(item => {
    const classification = classifyItem({ ...item, originalType: item.type })
    return { item, classification }
  })

  const stats = {
    total: results.length,
    chains: results.filter(r => r.classification.type === 'chain').length,
    protocols: results.filter(r => r.classification.type === 'protocol').length,
    tokens: results.filter(r => r.classification.type === 'token').length,
    exchanges: results.filter(r => r.classification.type === 'exchange').length,
    highConfidence: results.filter(r => r.classification.confidence === 'high').length,
    reclassified: results.filter(r => r.item.type && r.classification.type !== r.item.type).length,
  }

  return { items: results, stats }
}

/**
 * Estatísticas do classificador
 */
export function getClassifierStats() {
  return {
    blockchainRegistry: BLOCKCHAIN_REGISTRY.length,
    knownAliases: KNOWN_ALIASES.length,
    totalKnownChains: BLOCKCHAIN_REGISTRY.length,
    coverage: {
      layer1: BLOCKCHAIN_REGISTRY.filter(c => c.category === 'layer1').length,
      layer2: BLOCKCHAIN_REGISTRY.filter(c => c.category === 'layer2').length,
      sidechain: BLOCKCHAIN_REGISTRY.filter(c => c.category === 'sidechain').length,
      appchain: BLOCKCHAIN_REGISTRY.filter(c => c.category === 'appchain').length,
    }
  }
}
