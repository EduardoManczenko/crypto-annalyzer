/**
 * Mapeamento de aliases conhecidos para resolver problemas de matching
 * Cobre casos problemáticos onde nome != slug != símbolo
 */

export interface KnownAlias {
  // Query do usuário
  queries: string[]
  // Dados de resolução
  defiLlamaSlug?: string
  coinGeckoId?: string
  symbol?: string
  name?: string
  type: 'chain' | 'protocol' | 'token'
}

/**
 * Banco de aliases conhecidos
 * CRITICAL: Adicionar aqui qualquer caso que falhe
 */
export const KNOWN_ALIASES: KnownAlias[] = [
  // STELLAR - CASO PROBLEMÁTICO
  {
    queries: ['stellar', 'xlm', 'stellar lumens', 'stellar network'],
    defiLlamaSlug: 'stellar',
    coinGeckoId: 'stellar',
    symbol: 'XLM',
    name: 'Stellar',
    type: 'chain'
  },

  // SOLANA
  {
    queries: ['solana', 'sol'],
    defiLlamaSlug: 'solana',
    coinGeckoId: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    type: 'chain'
  },

  // ETHEREUM
  {
    queries: ['ethereum', 'eth', 'ether'],
    defiLlamaSlug: 'ethereum',
    coinGeckoId: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'chain'
  },

  // BSC / BINANCE SMART CHAIN
  {
    queries: ['bsc', 'binance smart chain', 'bnb chain', 'bnb'],
    defiLlamaSlug: 'bsc',
    coinGeckoId: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB Smart Chain',
    type: 'chain'
  },

  // POLYGON
  {
    queries: ['polygon', 'matic', 'pol'],
    defiLlamaSlug: 'polygon',
    coinGeckoId: 'matic-network',
    symbol: 'MATIC',
    name: 'Polygon',
    type: 'chain'
  },

  // ARBITRUM
  {
    queries: ['arbitrum', 'arb'],
    defiLlamaSlug: 'arbitrum',
    coinGeckoId: 'arbitrum',
    symbol: 'ARB',
    name: 'Arbitrum',
    type: 'chain'
  },

  // OPTIMISM
  {
    queries: ['optimism', 'op'],
    defiLlamaSlug: 'optimism',
    coinGeckoId: 'optimism',
    symbol: 'OP',
    name: 'Optimism',
    type: 'chain'
  },

  // BASE
  {
    queries: ['base', 'base chain', 'coinbase base'],
    defiLlamaSlug: 'base',
    coinGeckoId: 'base', // Base não tem token próprio no CoinGecko
    symbol: 'BASE',
    name: 'Base',
    type: 'chain'
  },

  // AVALANCHE
  {
    queries: ['avalanche', 'avax', 'avalanche c-chain'],
    defiLlamaSlug: 'avalanche',
    coinGeckoId: 'avalanche-2',
    symbol: 'AVAX',
    name: 'Avalanche',
    type: 'chain'
  },

  // BERACHAIN
  {
    queries: ['berachain', 'bera', 'bera chain'],
    defiLlamaSlug: 'berachain',
    coinGeckoId: 'berachain', // Pode não existir ainda
    symbol: 'BERA',
    name: 'Berachain',
    type: 'chain'
  },

  // BLAST
  {
    queries: ['blast', 'blast chain'],
    defiLlamaSlug: 'blast',
    coinGeckoId: 'blast',
    symbol: 'BLAST',
    name: 'Blast',
    type: 'chain'
  },

  // SCROLL
  {
    queries: ['scroll', 'scr'],
    defiLlamaSlug: 'scroll',
    coinGeckoId: 'scroll',
    symbol: 'SCR',
    name: 'Scroll',
    type: 'chain'
  },

  // AAVE
  {
    queries: ['aave', 'aave v3', 'aave-v3'],
    defiLlamaSlug: 'aave-v3', // V3 é o principal
    coinGeckoId: 'aave',
    symbol: 'AAVE',
    name: 'Aave',
    type: 'protocol'
  },

  // UNISWAP
  {
    queries: ['uniswap', 'uni', 'uniswap v3'],
    defiLlamaSlug: 'uniswap-v3',
    coinGeckoId: 'uniswap',
    symbol: 'UNI',
    name: 'Uniswap',
    type: 'protocol'
  },

  // CURVE
  {
    queries: ['curve', 'crv', 'curve finance'],
    defiLlamaSlug: 'curve-dex',
    coinGeckoId: 'curve-dao-token',
    symbol: 'CRV',
    name: 'Curve',
    type: 'protocol'
  },

  // LIDO
  {
    queries: ['lido', 'ldo', 'lido finance'],
    defiLlamaSlug: 'lido',
    coinGeckoId: 'lido-dao',
    symbol: 'LDO',
    name: 'Lido',
    type: 'protocol'
  },

  // MAKER / SKY
  {
    queries: ['maker', 'makerdao', 'mkr', 'sky'],
    defiLlamaSlug: 'makerdao',
    coinGeckoId: 'maker',
    symbol: 'MKR',
    name: 'MakerDAO',
    type: 'protocol'
  },

  // COMPOUND
  {
    queries: ['compound', 'comp', 'compound v3'],
    defiLlamaSlug: 'compound-v3',
    coinGeckoId: 'compound-governance-token',
    symbol: 'COMP',
    name: 'Compound',
    type: 'protocol'
  },

  // PANCAKESWAP
  {
    queries: ['pancakeswap', 'cake', 'pcs'],
    defiLlamaSlug: 'pancakeswap-amm-v3',
    coinGeckoId: 'pancakeswap-token',
    symbol: 'CAKE',
    name: 'PancakeSwap',
    type: 'protocol'
  },

  // JUPITER (SOLANA)
  {
    queries: ['jupiter', 'jup', 'jupiter exchange'],
    defiLlamaSlug: 'jupiter',
    coinGeckoId: 'jupiter-exchange-solana',
    symbol: 'JUP',
    name: 'Jupiter',
    type: 'protocol'
  },

  // RAYDIUM
  {
    queries: ['raydium', 'ray'],
    defiLlamaSlug: 'raydium',
    coinGeckoId: 'raydium',
    symbol: 'RAY',
    name: 'Raydium',
    type: 'protocol'
  },

  // HYPERLIQUID
  {
    queries: ['hyperliquid', 'hype', 'hyper liquid'],
    defiLlamaSlug: 'hyperliquid',
    coinGeckoId: 'hyperliquid',
    symbol: 'HYPE',
    name: 'Hyperliquid',
    type: 'protocol'
  },

  // BITCOIN
  {
    queries: ['bitcoin', 'btc'],
    coinGeckoId: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'token'
  },

  // CARDANO
  {
    queries: ['cardano', 'ada'],
    defiLlamaSlug: 'cardano',
    coinGeckoId: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    type: 'chain'
  },

  // POLKADOT
  {
    queries: ['polkadot', 'dot'],
    coinGeckoId: 'polkadot',
    symbol: 'DOT',
    name: 'Polkadot',
    type: 'chain'
  }
]

/**
 * Resolve alias de uma query
 */
export function resolveAlias(query: string): KnownAlias | null {
  const queryLower = query.toLowerCase().trim()

  for (const alias of KNOWN_ALIASES) {
    if (alias.queries.some(q => q === queryLower || queryLower.includes(q))) {
      console.log(`[Aliases] ✓ Resolvido: "${query}" → ${alias.name} (${alias.type})`)
      return alias
    }
  }

  console.log(`[Aliases] ✗ Não encontrado alias para: "${query}"`)
  return null
}

/**
 * Gera variações de uma query para tentar em APIs
 */
export function generateQueryVariations(query: string): string[] {
  const variations = new Set<string>()
  const lower = query.toLowerCase().trim()

  // Variação original
  variations.add(lower)

  // Com hífens
  variations.add(lower.replace(/\s+/g, '-'))

  // Sem espaços
  variations.add(lower.replace(/\s+/g, ''))

  // Primeira palavra apenas
  const firstWord = lower.split(/[\s-]/)[0]
  if (firstWord && firstWord.length > 2) {
    variations.add(firstWord)
  }

  // Sem sufixos comuns
  const withoutSuffix = lower
    .replace(/\s+(chain|network|finance|protocol|token|coin|exchange)$/i, '')
  if (withoutSuffix !== lower) {
    variations.add(withoutSuffix)
    variations.add(withoutSuffix.replace(/\s+/g, '-'))
  }

  console.log(`[Query Variations] "${query}" → ${Array.from(variations).join(', ')}`)
  return Array.from(variations)
}
