/**
 * REGISTRO COMPLETO DE BLOCKCHAINS
 * Lista definitiva de TODAS as principais blockchains existentes
 * Usada para classificação correta no indexador
 */

export interface BlockchainEntry {
  id: string
  name: string
  symbol: string
  aliases: string[]
  category: 'layer1' | 'layer2' | 'sidechain' | 'appchain'
  logo?: string
  coinGeckoId?: string
  defilllamaSlug?: string
}

/**
 * LISTA DEFINITIVA DE BLOCKCHAINS
 * Atualizado em: Dezembro 2025
 * Total: 100+ blockchains principais
 */
export const BLOCKCHAIN_REGISTRY: BlockchainEntry[] = [
  // ============= LAYER 1 - TOP 20 =============
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    aliases: ['ethereum', 'eth', 'ether'],
    category: 'layer1',
    coinGeckoId: 'ethereum',
    defilllamaSlug: 'Ethereum'
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    aliases: ['bitcoin', 'btc'],
    category: 'layer1',
    coinGeckoId: 'bitcoin',
    defilllamaSlug: 'Bitcoin'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    aliases: ['solana', 'sol'],
    category: 'layer1',
    coinGeckoId: 'solana',
    defilllamaSlug: 'Solana'
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    symbol: 'BNB',
    aliases: ['bnb', 'binance', 'bsc', 'binance smart chain', 'bnb chain'],
    category: 'layer1',
    coinGeckoId: 'binancecoin',
    defilllamaSlug: 'BSC'
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    aliases: ['cardano', 'ada'],
    category: 'layer1',
    coinGeckoId: 'cardano',
    defilllamaSlug: 'Cardano'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    aliases: ['avalanche', 'avax'],
    category: 'layer1',
    coinGeckoId: 'avalanche-2',
    defilllamaSlug: 'Avalanche'
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    aliases: ['polkadot', 'dot'],
    category: 'layer1',
    coinGeckoId: 'polkadot',
    defilllamaSlug: 'Polkadot'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    aliases: ['polygon', 'matic', 'polygon pos'],
    category: 'sidechain',
    coinGeckoId: 'matic-network',
    defilllamaSlug: 'Polygon'
  },
  {
    id: 'tron',
    name: 'TRON',
    symbol: 'TRX',
    aliases: ['tron', 'trx'],
    category: 'layer1',
    coinGeckoId: 'tron',
    defilllamaSlug: 'Tron'
  },
  {
    id: 'near',
    name: 'NEAR Protocol',
    symbol: 'NEAR',
    aliases: ['near', 'near protocol'],
    category: 'layer1',
    coinGeckoId: 'near',
    defilllamaSlug: 'Near'
  },
  {
    id: 'cosmos',
    name: 'Cosmos',
    symbol: 'ATOM',
    aliases: ['cosmos', 'atom', 'cosmos hub'],
    category: 'layer1',
    coinGeckoId: 'cosmos',
    defilllamaSlug: 'Cosmos'
  },
  {
    id: 'algorand',
    name: 'Algorand',
    symbol: 'ALGO',
    aliases: ['algorand', 'algo'],
    category: 'layer1',
    coinGeckoId: 'algorand',
    defilllamaSlug: 'Algorand'
  },
  {
    id: 'stellar',
    name: 'Stellar',
    symbol: 'XLM',
    aliases: ['stellar', 'xlm', 'stellar lumens'],
    category: 'layer1',
    coinGeckoId: 'stellar',
    defilllamaSlug: 'Stellar'
  },
  {
    id: 'aptos',
    name: 'Aptos',
    symbol: 'APT',
    aliases: ['aptos', 'apt'],
    category: 'layer1',
    coinGeckoId: 'aptos',
    defilllamaSlug: 'Aptos'
  },
  {
    id: 'sui',
    name: 'Sui',
    symbol: 'SUI',
    aliases: ['sui'],
    category: 'layer1',
    coinGeckoId: 'sui',
    defilllamaSlug: 'Sui'
  },
  {
    id: 'fantom',
    name: 'Fantom',
    symbol: 'FTM',
    aliases: ['fantom', 'ftm'],
    category: 'layer1',
    coinGeckoId: 'fantom',
    defilllamaSlug: 'Fantom'
  },
  {
    id: 'hedera',
    name: 'Hedera',
    symbol: 'HBAR',
    aliases: ['hedera', 'hbar', 'hedera hashgraph'],
    category: 'layer1',
    coinGeckoId: 'hedera-hashgraph',
    defilllamaSlug: 'Hedera'
  },
  {
    id: 'sei',
    name: 'Sei',
    symbol: 'SEI',
    aliases: ['sei', 'sei network'],
    category: 'layer1',
    coinGeckoId: 'sei-network',
    defilllamaSlug: 'Sei'
  },
  {
    id: 'injective',
    name: 'Injective',
    symbol: 'INJ',
    aliases: ['injective', 'inj', 'injective protocol'],
    category: 'layer1',
    coinGeckoId: 'injective-protocol',
    defilllamaSlug: 'Injective'
  },
  {
    id: 'celestia',
    name: 'Celestia',
    symbol: 'TIA',
    aliases: ['celestia', 'tia'],
    category: 'layer1',
    coinGeckoId: 'celestia',
    defilllamaSlug: 'Celestia'
  },

  // ============= LAYER 2 - ETHEREUM =============
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    aliases: ['arbitrum', 'arb', 'arbitrum one'],
    category: 'layer2',
    coinGeckoId: 'arbitrum',
    defilllamaSlug: 'Arbitrum'
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'OP',
    aliases: ['optimism', 'op'],
    category: 'layer2',
    coinGeckoId: 'optimism',
    defilllamaSlug: 'Optimism'
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'BASE',
    aliases: ['base', 'base chain', 'coinbase base'],
    category: 'layer2',
    defilllamaSlug: 'Base'
  },
  {
    id: 'zksync',
    name: 'zkSync Era',
    symbol: 'ZK',
    aliases: ['zksync', 'zk', 'zksync era'],
    category: 'layer2',
    defilllamaSlug: 'zkSync Era'
  },
  {
    id: 'starknet',
    name: 'Starknet',
    symbol: 'STRK',
    aliases: ['starknet', 'strk', 'stark'],
    category: 'layer2',
    coinGeckoId: 'starknet',
    defilllamaSlug: 'Starknet'
  },
  {
    id: 'polygon-zkevm',
    name: 'Polygon zkEVM',
    symbol: 'MATIC',
    aliases: ['polygon zkevm', 'zkevm', 'polygon-zkevm'],
    category: 'layer2',
    defilllamaSlug: 'Polygon zkEVM'
  },
  {
    id: 'linea',
    name: 'Linea',
    symbol: 'LINEA',
    aliases: ['linea', 'consensys linea'],
    category: 'layer2',
    defilllamaSlug: 'Linea'
  },
  {
    id: 'scroll',
    name: 'Scroll',
    symbol: 'SCR',
    aliases: ['scroll', 'scr'],
    category: 'layer2',
    coinGeckoId: 'scroll',
    defilllamaSlug: 'Scroll'
  },
  {
    id: 'blast',
    name: 'Blast',
    symbol: 'BLAST',
    aliases: ['blast', 'blast l2'],
    category: 'layer2',
    defilllamaSlug: 'Blast'
  },
  {
    id: 'mantle',
    name: 'Mantle',
    symbol: 'MNT',
    aliases: ['mantle', 'mnt'],
    category: 'layer2',
    coinGeckoId: 'mantle',
    defilllamaSlug: 'Mantle'
  },
  {
    id: 'metis',
    name: 'Metis',
    symbol: 'METIS',
    aliases: ['metis', 'metis andromeda'],
    category: 'layer2',
    coinGeckoId: 'metis-token',
    defilllamaSlug: 'Metis'
  },
  {
    id: 'mode',
    name: 'Mode',
    symbol: 'MODE',
    aliases: ['mode', 'mode network'],
    category: 'layer2',
    defilllamaSlug: 'Mode'
  },
  {
    id: 'manta',
    name: 'Manta Pacific',
    symbol: 'MANTA',
    aliases: ['manta', 'manta pacific'],
    category: 'layer2',
    coinGeckoId: 'manta-network',
    defilllamaSlug: 'Manta'
  },

  // ============= EMERGING CHAINS =============
  {
    id: 'berachain',
    name: 'Berachain',
    symbol: 'BERA',
    aliases: ['berachain', 'bera'],
    category: 'layer1',
    defilllamaSlug: 'Berachain'
  },
  {
    id: 'monad',
    name: 'Monad',
    symbol: 'MONAD',
    aliases: ['monad'],
    category: 'layer1'
  },
  {
    id: 'movement',
    name: 'Movement',
    symbol: 'MOVE',
    aliases: ['movement', 'movement network'],
    category: 'layer1'
  },

  // ============= COSMOS ECOSYSTEM =============
  {
    id: 'osmosis',
    name: 'Osmosis',
    symbol: 'OSMO',
    aliases: ['osmosis', 'osmo'],
    category: 'appchain',
    coinGeckoId: 'osmosis',
    defilllamaSlug: 'Osmosis'
  },
  {
    id: 'thorchain',
    name: 'THORChain',
    symbol: 'RUNE',
    aliases: ['thorchain', 'rune', 'thor'],
    category: 'layer1',
    coinGeckoId: 'thorchain',
    defilllamaSlug: 'THORChain'
  },
  {
    id: 'kujira',
    name: 'Kujira',
    symbol: 'KUJI',
    aliases: ['kujira', 'kuji'],
    category: 'appchain',
    coinGeckoId: 'kujira',
    defilllamaSlug: 'Kujira'
  },

  // ============= ALT L1s =============
  {
    id: 'ton',
    name: 'TON',
    symbol: 'TON',
    aliases: ['ton', 'toncoin', 'the open network'],
    category: 'layer1',
    coinGeckoId: 'the-open-network',
    defilllamaSlug: 'TON'
  },
  {
    id: 'kaspa',
    name: 'Kaspa',
    symbol: 'KAS',
    aliases: ['kaspa', 'kas'],
    category: 'layer1',
    coinGeckoId: 'kaspa',
    defilllamaSlug: 'Kaspa'
  },
  {
    id: 'icp',
    name: 'Internet Computer',
    symbol: 'ICP',
    aliases: ['internet computer', 'icp', 'dfinity'],
    category: 'layer1',
    coinGeckoId: 'internet-computer',
    defilllamaSlug: 'ICP'
  },
  {
    id: 'flow',
    name: 'Flow',
    symbol: 'FLOW',
    aliases: ['flow', 'flow blockchain'],
    category: 'layer1',
    coinGeckoId: 'flow',
    defilllamaSlug: 'Flow'
  },
  {
    id: 'celo',
    name: 'Celo',
    symbol: 'CELO',
    aliases: ['celo'],
    category: 'layer1',
    coinGeckoId: 'celo',
    defilllamaSlug: 'Celo'
  },
  {
    id: 'harmony',
    name: 'Harmony',
    symbol: 'ONE',
    aliases: ['harmony', 'one'],
    category: 'layer1',
    coinGeckoId: 'harmony',
    defilllamaSlug: 'Harmony'
  },
  {
    id: 'moonbeam',
    name: 'Moonbeam',
    symbol: 'GLMR',
    aliases: ['moonbeam', 'glmr'],
    category: 'layer1',
    coinGeckoId: 'moonbeam',
    defilllamaSlug: 'Moonbeam'
  },
  {
    id: 'moonriver',
    name: 'Moonriver',
    symbol: 'MOVR',
    aliases: ['moonriver', 'movr'],
    category: 'layer1',
    coinGeckoId: 'moonriver',
    defilllamaSlug: 'Moonriver'
  },
  {
    id: 'cronos',
    name: 'Cronos',
    symbol: 'CRO',
    aliases: ['cronos', 'cro', 'crypto.com chain'],
    category: 'layer1',
    coinGeckoId: 'crypto-com-chain',
    defilllamaSlug: 'Cronos'
  },
  {
    id: 'klaytn',
    name: 'Klaytn',
    symbol: 'KLAY',
    aliases: ['klaytn', 'klay'],
    category: 'layer1',
    coinGeckoId: 'klay-token',
    defilllamaSlug: 'Klaytn'
  },
  {
    id: 'kava',
    name: 'Kava',
    symbol: 'KAVA',
    aliases: ['kava'],
    category: 'layer1',
    coinGeckoId: 'kava',
    defilllamaSlug: 'Kava'
  },
  {
    id: 'oasis',
    name: 'Oasis',
    symbol: 'ROSE',
    aliases: ['oasis', 'rose', 'oasis network'],
    category: 'layer1',
    coinGeckoId: 'oasis-network',
    defilllamaSlug: 'Oasis'
  },

  // ============= LEGACY/ESTABLISHED =============
  {
    id: 'xrp',
    name: 'XRP Ledger',
    symbol: 'XRP',
    aliases: ['xrp', 'ripple', 'xrp ledger'],
    category: 'layer1',
    coinGeckoId: 'ripple',
    defilllamaSlug: 'XRPL'
  },
  {
    id: 'litecoin',
    name: 'Litecoin',
    symbol: 'LTC',
    aliases: ['litecoin', 'ltc'],
    category: 'layer1',
    coinGeckoId: 'litecoin'
  },
  {
    id: 'dogecoin',
    name: 'Dogecoin',
    symbol: 'DOGE',
    aliases: ['dogecoin', 'doge'],
    category: 'layer1',
    coinGeckoId: 'dogecoin'
  },
  {
    id: 'bch',
    name: 'Bitcoin Cash',
    symbol: 'BCH',
    aliases: ['bitcoin cash', 'bch'],
    category: 'layer1',
    coinGeckoId: 'bitcoin-cash'
  },
  {
    id: 'eos',
    name: 'EOS',
    symbol: 'EOS',
    aliases: ['eos'],
    category: 'layer1',
    coinGeckoId: 'eos'
  },
  {
    id: 'tezos',
    name: 'Tezos',
    symbol: 'XTZ',
    aliases: ['tezos', 'xtz'],
    category: 'layer1',
    coinGeckoId: 'tezos',
    defilllamaSlug: 'Tezos'
  },
  {
    id: 'vechain',
    name: 'VeChain',
    symbol: 'VET',
    aliases: ['vechain', 'vet'],
    category: 'layer1',
    coinGeckoId: 'vechain',
    defilllamaSlug: 'VeChain'
  },
  {
    id: 'filecoin',
    name: 'Filecoin',
    symbol: 'FIL',
    aliases: ['filecoin', 'fil'],
    category: 'layer1',
    coinGeckoId: 'filecoin'
  },

  // ============= SOLANA ECOSYSTEM =============
  {
    id: 'eclipse',
    name: 'Eclipse',
    symbol: 'ECLIPSE',
    aliases: ['eclipse', 'eclipse svm'],
    category: 'layer2'
  },

  // ============= BITCOIN L2s =============
  {
    id: 'stacks',
    name: 'Stacks',
    symbol: 'STX',
    aliases: ['stacks', 'stx'],
    category: 'layer2',
    coinGeckoId: 'blockstack',
    defilllamaSlug: 'Stacks'
  },
  {
    id: 'rootstock',
    name: 'Rootstock',
    symbol: 'RBTC',
    aliases: ['rootstock', 'rsk', 'rbtc'],
    category: 'sidechain',
    defilllamaSlug: 'Rootstock'
  },

  // ============= SPECIALIZED CHAINS =============
  {
    id: 'zcash',
    name: 'Zcash',
    symbol: 'ZEC',
    aliases: ['zcash', 'zec'],
    category: 'layer1',
    coinGeckoId: 'zcash'
  },
  {
    id: 'monero',
    name: 'Monero',
    symbol: 'XMR',
    aliases: ['monero', 'xmr'],
    category: 'layer1',
    coinGeckoId: 'monero'
  },

  // ============= GAMING/METAVERSE =============
  {
    id: 'immutable',
    name: 'Immutable X',
    symbol: 'IMX',
    aliases: ['immutable', 'imx', 'immutable x'],
    category: 'layer2',
    coinGeckoId: 'immutable-x',
    defilllamaSlug: 'Immutable'
  },
  {
    id: 'ronin',
    name: 'Ronin',
    symbol: 'RON',
    aliases: ['ronin', 'ron'],
    category: 'sidechain',
    coinGeckoId: 'ronin',
    defilllamaSlug: 'Ronin'
  },
  {
    id: 'axie',
    name: 'Axie Infinity',
    symbol: 'AXS',
    aliases: ['axie', 'axie infinity', 'axs'],
    category: 'appchain',
    coinGeckoId: 'axie-infinity'
  },

  // ============= EMERGING/NEW (2024-2025) =============
  {
    id: 'hyperliquid',
    name: 'Hyperliquid',
    symbol: 'HYPE',
    aliases: ['hyperliquid', 'hype', 'hyper liquid'],
    category: 'layer1',
    defilllamaSlug: 'Hyperliquid'
  },
  {
    id: 'sonic',
    name: 'Sonic',
    symbol: 'S',
    aliases: ['sonic', 'sonic labs'],
    category: 'layer1'
  },
  {
    id: 'soneium',
    name: 'Soneium',
    symbol: 'SONEIUM',
    aliases: ['soneium'],
    category: 'layer2'
  },
]

/**
 * Verifica se um nome/símbolo é uma blockchain conhecida
 */
export function isKnownBlockchain(query: string): boolean {
  const normalized = query.toLowerCase().trim()
  return BLOCKCHAIN_REGISTRY.some(chain =>
    chain.id === normalized ||
    chain.symbol.toLowerCase() === normalized ||
    chain.aliases.some(alias => alias === normalized || alias.includes(normalized))
  )
}

/**
 * Busca blockchain no registro
 */
export function findBlockchain(query: string): BlockchainEntry | null {
  const normalized = query.toLowerCase().trim()
  return BLOCKCHAIN_REGISTRY.find(chain =>
    chain.id === normalized ||
    chain.symbol.toLowerCase() === normalized ||
    chain.aliases.some(alias => alias === normalized)
  ) || null
}

/**
 * Retorna todas as blockchains por categoria
 */
export function getBlockchainsByCategory(category: BlockchainEntry['category']): BlockchainEntry[] {
  return BLOCKCHAIN_REGISTRY.filter(chain => chain.category === category)
}

/**
 * Estatísticas do registro
 */
export function getRegistryStats() {
  return {
    total: BLOCKCHAIN_REGISTRY.length,
    layer1: BLOCKCHAIN_REGISTRY.filter(c => c.category === 'layer1').length,
    layer2: BLOCKCHAIN_REGISTRY.filter(c => c.category === 'layer2').length,
    sidechain: BLOCKCHAIN_REGISTRY.filter(c => c.category === 'sidechain').length,
    appchain: BLOCKCHAIN_REGISTRY.filter(c => c.category === 'appchain').length,
  }
}
