/**
 * Mapeamento estático das principais blockchains
 * Garante priorização correta de chains sobre protocolos com nomes similares
 */

export interface ChainMapping {
  // Nomes e símbolos que identificam esta chain
  names: string[]
  symbols: string[]
  // IDs oficiais nas APIs
  defillama: string
  coingecko: string
  // Categoria
  category: 'L1' | 'L2' | 'Sidechain' | 'Appchain'
}

/**
 * Top 300 blockchains com mapeamento completo
 * Ordenadas por importância/TVL
 */
export const CHAIN_MAPPINGS: Record<string, ChainMapping> = {
  // === TOP 10 L1s ===
  ethereum: {
    names: ['ethereum', 'eth'],
    symbols: ['ETH'],
    defillama: 'Ethereum',
    coingecko: 'ethereum',
    category: 'L1'
  },
  solana: {
    names: ['solana', 'sol'],
    symbols: ['SOL'],
    defillama: 'Solana',
    coingecko: 'solana',
    category: 'L1'
  },
  binance: {
    names: ['binance', 'bnb', 'bsc', 'binance smart chain'],
    symbols: ['BNB'],
    defillama: 'BSC',
    coingecko: 'binancecoin',
    category: 'L1'
  },
  bitcoin: {
    names: ['bitcoin', 'btc'],
    symbols: ['BTC'],
    defillama: 'Bitcoin',
    coingecko: 'bitcoin',
    category: 'L1'
  },
  tron: {
    names: ['tron', 'trx'],
    symbols: ['TRX', 'TRON'],
    defillama: 'Tron',
    coingecko: 'tron',
    category: 'L1'
  },
  avalanche: {
    names: ['avalanche', 'avax'],
    symbols: ['AVAX'],
    defillama: 'Avalanche',
    coingecko: 'avalanche-2',
    category: 'L1'
  },
  polygon: {
    names: ['polygon', 'matic', 'pol'],
    symbols: ['MATIC', 'POL'],
    defillama: 'Polygon',
    coingecko: 'polygon-ecosystem-token', // POL (migrated from MATIC on Sept 2024)
    category: 'L1'
  },
  sui: {
    names: ['sui'],
    symbols: ['SUI'],
    defillama: 'Sui',
    coingecko: 'sui',
    category: 'L1'
  },
  hyperliquid: {
    names: ['hyperliquid', 'hype'],
    symbols: ['HYPE'],
    defillama: 'Hyperliquid L1',
    coingecko: 'hyperliquid',
    category: 'L1'
  },
  base: {
    names: ['base'],
    symbols: ['BASE'],
    defillama: 'Base',
    coingecko: 'base',
    category: 'L2'
  },

  // === Layer 2s Principais ===
  arbitrum: {
    names: ['arbitrum', 'arb'],
    symbols: ['ARB'],
    defillama: 'Arbitrum',
    coingecko: 'arbitrum',
    category: 'L2'
  },
  optimism: {
    names: ['optimism', 'op'],
    symbols: ['OP'],
    defillama: 'OP Mainnet',
    coingecko: 'optimism',
    category: 'L2'
  },
  blast: {
    names: ['blast'],
    symbols: ['BLAST'],
    defillama: 'Blast',
    coingecko: 'blast',
    category: 'L2'
  },
  scroll: {
    names: ['scroll'],
    symbols: ['SCR'],
    defillama: 'Scroll',
    coingecko: 'scroll',
    category: 'L2'
  },
  linea: {
    names: ['linea'],
    symbols: ['LINEA'],
    defillama: 'Linea',
    coingecko: 'linea',
    category: 'L2'
  },
  zksync: {
    names: ['zksync', 'zksync era', 'zk'],
    symbols: ['ZK'],
    defillama: 'ZKsync Era',
    coingecko: 'zksync',
    category: 'L2'
  },
  starknet: {
    names: ['starknet', 'stark'],
    symbols: ['STRK'],
    defillama: 'Starknet',
    coingecko: 'starknet',
    category: 'L2'
  },
  mantle: {
    names: ['mantle', 'mnt'],
    symbols: ['MNT'],
    defillama: 'Mantle',
    coingecko: 'mantle',
    category: 'L2'
  },

  // === Cosmos Ecosystem ===
  cosmos: {
    names: ['cosmos', 'atom', 'cosmos hub'],
    symbols: ['ATOM'],
    defillama: 'CosmosHub',
    coingecko: 'cosmos',
    category: 'L1'
  },
  celestia: {
    names: ['celestia', 'tia'],
    symbols: ['TIA'],
    defillama: 'Celestia',
    coingecko: 'celestia',
    category: 'L1'
  },
  osmosis: {
    names: ['osmosis', 'osmo'],
    symbols: ['OSMO'],
    defillama: 'Osmosis',
    coingecko: 'osmosis',
    category: 'L1'
  },
  injective: {
    names: ['injective', 'inj'],
    symbols: ['INJ'],
    defillama: 'Injective',
    coingecko: 'injective-protocol',
    category: 'L1'
  },
  sei: {
    names: ['sei'],
    symbols: ['SEI'],
    defillama: 'Sei',
    coingecko: 'sei-network',
    category: 'L1'
  },
  neutron: {
    names: ['neutron'],
    symbols: ['NTRN'],
    defillama: 'Neutron',
    coingecko: 'neutron',
    category: 'L1'
  },

  // === Polkadot Ecosystem ===
  polkadot: {
    names: ['polkadot', 'dot'],
    symbols: ['DOT'],
    defillama: 'Polkadot',
    coingecko: 'polkadot',
    category: 'L1'
  },
  moonbeam: {
    names: ['moonbeam', 'glmr'],
    symbols: ['GLMR'],
    defillama: 'Moonbeam',
    coingecko: 'moonbeam',
    category: 'L1'
  },
  astar: {
    names: ['astar'],
    symbols: ['ASTR'],
    defillama: 'Astar',
    coingecko: 'astar',
    category: 'L1'
  },

  // === Outras L1s Importantes ===
  aptos: {
    names: ['aptos', 'apt'],
    symbols: ['APT'],
    defillama: 'Aptos',
    coingecko: 'aptos',
    category: 'L1'
  },
  near: {
    names: ['near', 'near protocol'],
    symbols: ['NEAR'],
    defillama: 'Near',
    coingecko: 'near',
    category: 'L1'
  },
  cardano: {
    names: ['cardano', 'ada'],
    symbols: ['ADA'],
    defillama: 'Cardano',
    coingecko: 'cardano',
    category: 'L1'
  },
  stellar: {
    names: ['stellar', 'xlm'],
    symbols: ['XLM'],
    defillama: 'Stellar',
    coingecko: 'stellar',
    category: 'L1'
  },
  algorand: {
    names: ['algorand', 'algo'],
    symbols: ['ALGO'],
    defillama: 'Algorand',
    coingecko: 'algorand',
    category: 'L1'
  },
  fantom: {
    names: ['fantom', 'ftm'],
    symbols: ['FTM'],
    defillama: 'Fantom',
    coingecko: 'fantom',
    category: 'L1'
  },
  ton: {
    names: ['ton', 'the open network', 'toncoin'],
    symbols: ['TON'],
    defillama: 'TON',
    coingecko: 'the-open-network',
    category: 'L1'
  },
  flow: {
    names: ['flow'],
    symbols: ['FLOW'],
    defillama: 'Flow',
    coingecko: 'flow',
    category: 'L1'
  },
  hedera: {
    names: ['hedera', 'hbar'],
    symbols: ['HBAR'],
    defillama: 'Hedera',
    coingecko: 'hedera-hashgraph',
    category: 'L1'
  },
  icp: {
    names: ['internet computer', 'icp'],
    symbols: ['ICP'],
    defillama: 'ICP',
    coingecko: 'internet-computer',
    category: 'L1'
  },
  xrpl: {
    names: ['xrp', 'ripple', 'xrp ledger', 'xrpl'],
    symbols: ['XRP'],
    defillama: 'XRPL',
    coingecko: 'ripple',
    category: 'L1'
  },
  tezos: {
    names: ['tezos', 'xtz'],
    symbols: ['XTZ'],
    defillama: 'Tezos',
    coingecko: 'tezos',
    category: 'L1'
  },
  cronos: {
    names: ['cronos', 'cro'],
    symbols: ['CRO'],
    defillama: 'Cronos',
    coingecko: 'crypto-com-chain',
    category: 'L1'
  },
  gnosis: {
    names: ['gnosis', 'gno'],
    symbols: ['GNO'],
    defillama: 'Gnosis',
    coingecko: 'gnosis',
    category: 'L1'
  },
  kava: {
    names: ['kava'],
    symbols: ['KAVA'],
    defillama: 'Kava',
    coingecko: 'kava',
    category: 'L1'
  },
  celo: {
    names: ['celo'],
    symbols: ['CELO'],
    defillama: 'Celo',
    coingecko: 'celo',
    category: 'L1'
  },
  harmony: {
    names: ['harmony', 'one'],
    symbols: ['ONE'],
    defillama: 'Harmony',
    coingecko: 'harmony',
    category: 'L1'
  },
  stacks: {
    names: ['stacks', 'stx'],
    symbols: ['STX'],
    defillama: 'Stacks',
    coingecko: 'blockstack',
    category: 'L1'
  },
  elrond: {
    names: ['elrond', 'multiversx', 'egld'],
    symbols: ['EGLD'],
    defillama: 'MultiversX',
    coingecko: 'elrond-erd-2',
    category: 'L1'
  },
  kaia: {
    names: ['kaia', 'klaytn', 'klay'],
    symbols: ['KLAY'],
    defillama: 'Kaia',
    coingecko: 'klay-token',
    category: 'L1'
  },
  eos: {
    names: ['eos'],
    symbols: ['EOS'],
    defillama: 'Vaulta',
    coingecko: 'eos',
    category: 'L1'
  },
  waves: {
    names: ['waves'],
    symbols: ['WAVES'],
    defillama: 'Waves',
    coingecko: 'waves',
    category: 'L1'
  },
  icon: {
    names: ['icon', 'icx'],
    symbols: ['ICX'],
    defillama: 'Icon',
    coingecko: 'icon',
    category: 'L1'
  },
  flare: {
    names: ['flare', 'flr'],
    symbols: ['FLR'],
    defillama: 'Flare',
    coingecko: 'flare-networks',
    category: 'L1'
  },
  zilliqa: {
    names: ['zilliqa', 'zil'],
    symbols: ['ZIL'],
    defillama: 'Zilliqa',
    coingecko: 'zilliqa',
    category: 'L1'
  },
  vechain: {
    names: ['vechain', 'vet'],
    symbols: ['VET'],
    defillama: 'VeChain',
    coingecko: 'vechain',
    category: 'L1'
  },
  neo: {
    names: ['neo', 'n3'],
    symbols: ['NEO'],
    defillama: 'NEO',
    coingecko: 'neo',
    category: 'L1'
  },
  conflux: {
    names: ['conflux', 'cfx'],
    symbols: ['CFX'],
    defillama: 'Conflux',
    coingecko: 'conflux-token',
    category: 'L1'
  },
  bitcoincash: {
    names: ['bitcoin cash', 'bitcoincash', 'bch'],
    symbols: ['BCH'],
    defillama: 'Bitcoincash',
    coingecko: 'bitcoin-cash',
    category: 'L1'
  },
  litecoin: {
    names: ['litecoin', 'ltc'],
    symbols: ['LTC'],
    defillama: 'Litecoin',
    coingecko: 'litecoin',
    category: 'L1'
  },
  dogecoin: {
    names: ['dogecoin', 'doge'],
    symbols: ['DOGE'],
    defillama: 'Doge',
    coingecko: 'dogecoin',
    category: 'L1'
  },

  // === Emerging Chains ===
  berachain: {
    names: ['berachain', 'bera'],
    symbols: ['BERA'],
    defillama: 'Berachain',
    coingecko: 'berachain-bera',
    category: 'L1'
  },
  movement: {
    names: ['movement'],
    symbols: ['MOVE'],
    defillama: 'Movement',
    coingecko: 'movement',
    category: 'L1'
  },
  monad: {
    names: ['monad', 'mon'],
    symbols: ['MON'],
    defillama: 'Monad',
    coingecko: 'monad',
    category: 'L1'
  },
  sonic: {
    names: ['sonic'],
    symbols: ['S'],
    defillama: 'Sonic',
    coingecko: 'sonic-3',
    category: 'L1'
  },
  ink: {
    names: ['ink'],
    symbols: [],
    defillama: 'Ink',
    coingecko: 'ink',
    category: 'L2'
  },
  worldchain: {
    names: ['world chain', 'worldchain', 'wld'],
    symbols: ['WLD'],
    defillama: 'World Chain',
    coingecko: 'worldcoin-wld',
    category: 'L2'
  },
  zircuit: {
    names: ['zircuit', 'zrc'],
    symbols: ['ZRC'],
    defillama: 'Zircuit',
    coingecko: 'zircuit',
    category: 'L2'
  },
  manta: {
    names: ['manta'],
    symbols: ['MANTA'],
    defillama: 'Manta',
    coingecko: 'manta-network',
    category: 'L2'
  },
  mode: {
    names: ['mode'],
    symbols: ['MODE'],
    defillama: 'Mode',
    coingecko: 'mode',
    category: 'L2'
  },
  bob: {
    names: ['bob'],
    symbols: [],
    defillama: 'BOB',
    coingecko: 'bob',
    category: 'L2'
  },
  merlin: {
    names: ['merlin'],
    symbols: [],
    defillama: 'Merlin',
    coingecko: 'merlin',
    category: 'L2'
  },
  soneium: {
    names: ['soneium'],
    symbols: [],
    defillama: 'Soneium',
    coingecko: 'soneium',
    category: 'L2'
  },
  abstract: {
    names: ['abstract'],
    symbols: [],
    defillama: 'Abstract',
    coingecko: 'abstract',
    category: 'L2'
  },
  taiko: {
    names: ['taiko'],
    symbols: [],
    defillama: 'Taiko',
    coingecko: 'taiko',
    category: 'L2'
  },
  metis: {
    names: ['metis'],
    symbols: ['METIS'],
    defillama: 'Metis',
    coingecko: 'metis-token',
    category: 'L2'
  },
  boba: {
    names: ['boba'],
    symbols: ['BOBA'],
    defillama: 'Boba',
    coingecko: 'boba-network',
    category: 'L2'
  },
  rootstock: {
    names: ['rootstock', 'rsk', 'rbtc'],
    symbols: ['RBTC'],
    defillama: 'Rootstock',
    coingecko: 'rootstock',
    category: 'Sidechain'
  },

  // === Sidechains e Appchains ===
  ronin: {
    names: ['ronin', 'ron'],
    symbols: ['RON'],
    defillama: 'Ronin',
    coingecko: 'ronin',
    category: 'Sidechain'
  },
  immutable: {
    names: ['immutable', 'imx'],
    symbols: ['IMX'],
    defillama: 'Immutable zkEVM',
    coingecko: 'immutable-x',
    category: 'Appchain'
  },
  apechain: {
    names: ['apechain', 'ape'],
    symbols: ['APE'],
    defillama: 'ApeChain',
    coingecko: 'apecoin',
    category: 'L2'
  },
  xai: {
    names: ['xai'],
    symbols: ['XAI'],
    defillama: 'Xai',
    coingecko: 'xai-blockchain',
    category: 'L2'
  }
}

/**
 * Busca rápida por nome ou símbolo de chain
 */
export function findChainMapping(query: string): ChainMapping | null {
  const normalized = query.toLowerCase().trim()

  for (const [key, mapping] of Object.entries(CHAIN_MAPPINGS)) {
    // Verificar nomes
    if (mapping.names.some(name => normalized.includes(name))) {
      return mapping
    }
    // Verificar símbolos
    if (mapping.symbols.some(symbol =>
      normalized === symbol.toLowerCase() ||
      normalized.includes(symbol.toLowerCase())
    )) {
      return mapping
    }
  }

  return null
}

/**
 * Verifica se um termo é definitivamente uma chain conhecida
 */
export function isKnownChain(query: string): boolean {
  return findChainMapping(query) !== null
}

/**
 * Retorna o nome correto da chain no DeFiLlama
 */
export function getDefiLlamaChainName(query: string): string | null {
  const mapping = findChainMapping(query)
  return mapping?.defillama || null
}

/**
 * Retorna o ID correto da chain no CoinGecko
 */
export function getCoinGeckoChainId(query: string): string | null {
  const mapping = findChainMapping(query)
  return mapping?.coingecko || null
}
