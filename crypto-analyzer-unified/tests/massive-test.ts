/**
 * Teste Massivo de Blockchains e Protocolos DeFi
 * Testa 100+ blockchains e 10+ protocolos DeFi por blockchain
 */

import { aggregateData } from '../lib/data-sources/data-aggregator'

interface TestResult {
  query: string
  success: boolean
  type: 'chain' | 'protocol' | 'token'
  hasData: boolean
  hasTVL: boolean
  hasPrice: boolean
  hasLogo: boolean
  hasCirculatingSupply: boolean
  hasCharts: boolean
  category: string
  tvl?: number
  price?: number
  error?: string
  executionTime: number
}

// Lista de blockchains para testar (100+)
const BLOCKCHAINS = [
  // Top 20 Chains
  'Bitcoin', 'Ethereum', 'Solana', 'BNB', 'Avalanche', 'Polygon', 'Arbitrum', 'Optimism',
  'Base', 'Polkadot', 'Cardano', 'Tron', 'Sui', 'Aptos', 'Near', 'Fantom', 'Cronos',
  'Cosmos', 'Algorand', 'Stacks',

  // Layer 2s
  'zkSync', 'Starknet', 'Linea', 'Scroll', 'Blast', 'Mantle', 'Manta', 'Mode', 'Zora',
  'Loopring', 'Immutable', 'Polygon zkEVM', 'Taiko', 'Merlin', 'Boba', 'Metis',

  // Ethereum Alternatives
  'Solana', 'Avalanche', 'Near', 'Fantom', 'Harmony', 'Celo', 'Aurora', 'Moonbeam',
  'Moonriver', 'Gnosis', 'Evmos', 'Kava', 'Secret', 'Injective', 'Sei', 'Berachain',

  // Cosmos Ecosystem
  'Osmosis', 'Juno', 'Akash', 'Celestia', 'Thorchain', 'Kujira', 'Neutron', 'Stride',

  // Polkadot Ecosystem
  'Astar', 'Moonbeam', 'Acala', 'Parallel', 'Bifrost', 'Phala', 'Centrifuge',

  // Gaming & Metaverse Chains
  'Ronin', 'Immutable', 'Axie', 'Flow', 'Wax', 'Gala', 'Sandbox', 'Decentraland',

  // Bitcoin Layer 2s
  'Rootstock', 'Stacks', 'Liquid Network',

  // Privacy Chains
  'Monero', 'Zcash', 'Secret', 'Oasis', 'Dusk', 'Findora',

  // Enterprise Chains
  'Hedera', 'Algorand', 'VeChain', 'Tezos', 'Elrond', 'Casper',

  // Asian Market Chains
  'Klaytn', 'Wemix', 'Oasys', 'Astar', 'Viction', 'Kardia',

  // Newer Chains
  'Fuel', 'Movement', 'Monad', 'Berachain', 'Story Protocol', 'Abstract',

  // EVM Compatible
  'Ethereum Classic', 'BSC', 'Heco', 'OKC', 'Kucoin', 'Conflux', 'Velas',
  'Telos', 'Fuse', 'Energi', 'ThunderCore', 'TomoChain', 'SmartBCH',

  // XRP & Ripple Ecosystem
  'XRP', 'Flare', 'Songbird',

  // Legacy Chains
  'Litecoin', 'Bitcoin Cash', 'Dogecoin', 'Dash', 'Zilliqa', 'Ontology',
  'NEO', 'ICON', 'Qtum', 'Waves', 'EOS', 'Stellar', 'Nano',

  // New & Emerging
  'Lightlink', 'Core', 'Kroma', 'Godwoken', 'X Layer', 'OpBNB'
]

// Lista de protocolos DeFi para testar
const DEFI_PROTOCOLS = {
  // Lending/Borrowing
  'Lending': ['Aave', 'Compound', 'Spark', 'Euler', 'Morpho', 'Venus', 'Benqi', 'Radiant', 'Geist', 'JustLend'],

  // DEXs
  'DEX': ['Uniswap', 'Curve', 'PancakeSwap', 'SushiSwap', 'Balancer', 'Velodrome', 'Trader Joe', 'GMX', 'dYdX', 'Gains Network'],

  // Staking/LSDs
  'Staking': ['Lido', 'Rocket Pool', 'Frax', 'Ankr', 'StakeWise', 'Swell', 'pSTAKE', 'Marinade', 'Jito', 'Stakestone'],

  // Stablecoins
  'Stablecoin': ['MakerDAO', 'Frax', 'Liquity', 'Abracadabra', 'Reflexer', 'Ethena', 'Prisma', 'Gravita', 'Raft', 'USD+'],

  // Yield Aggregators
  'Yield': ['Yearn', 'Beefy', 'Convex', 'Aura', 'Pendle', 'Tokemak', 'Sommelier', 'Concentrator', 'Origin', 'Asymetrix'],

  // Options/Derivatives
  'Derivatives': ['Lyra', 'Dopex', 'Hegic', 'Opyn', 'Ribbon', 'Jones DAO', 'Umami', 'Premia', 'Thales', 'Buffer'],

  // Bridges
  'Bridge': ['Stargate', 'Synapse', 'Across', 'Hop', 'Multichain', 'Celer', 'Wormhole', 'LayerZero', 'Socket', 'Orbiter'],

  // Perpetuals
  'Perps': ['GMX', 'Gains Network', 'dYdX', 'Kwenta', 'Level Finance', 'MUX Protocol', 'Vela Exchange', 'Apex', 'Jupiter', 'Hyperliquid'],

  // Liquid Staking Derivatives
  'LSD': ['Lido', 'Rocket Pool', 'Frax Ether', 'Stakewise', 'Ankr', 'Swell', 'Staderlabs', 'Puffer', 'Ether.fi', 'Renzo'],

  // RWA (Real World Assets)
  'RWA': ['MakerDAO', 'Centrifuge', 'Goldfinch', 'Maple Finance', 'TrueFi', 'Clearpool', 'Credix', 'Backed Finance', 'Ondo', 'Swarm']
}

/**
 * Testa um único item
 */
async function testItem(query: string, expectedType: 'chain' | 'protocol' | 'token'): Promise<TestResult> {
  const startTime = Date.now()

  try {
    console.log(`\n[Test] Testando: ${query}...`)

    const data = await aggregateData(query)
    const executionTime = Date.now() - startTime

    if (!data) {
      console.log(`[Test] ✗ ${query} - Nenhum dado retornado`)
      return {
        query,
        success: false,
        type: expectedType,
        hasData: false,
        hasTVL: false,
        hasPrice: false,
        hasLogo: false,
        hasCirculatingSupply: false,
        hasCharts: false,
        category: 'N/A',
        error: 'No data returned',
        executionTime
      }
    }

    const result: TestResult = {
      query,
      success: true,
      type: expectedType,
      hasData: true,
      hasTVL: data.tvl !== null && data.tvl > 0,
      hasPrice: data.price !== null && data.price > 0,
      hasLogo: !!data.logo,
      hasCirculatingSupply: data.circulating !== null && data.circulating > 0,
      hasCharts: !!data.priceHistory && (
        (data.priceHistory['24h']?.length || 0) > 0 ||
        (data.priceHistory['7d']?.length || 0) > 0 ||
        (data.priceHistory['30d']?.length || 0) > 0 ||
        (data.priceHistory['365d']?.length || 0) > 0
      ),
      category: data.category,
      tvl: data.tvl || undefined,
      price: data.price || undefined,
      executionTime
    }

    const status = result.hasPrice || result.hasTVL ? '✓' : '⚠'
    console.log(`[Test] ${status} ${query} - Category: ${data.category}, Price: ${data.price ? `$${data.price.toFixed(2)}` : 'N/A'}, TVL: ${data.tvl ? `$${(data.tvl / 1e9).toFixed(2)}B` : 'N/A'}, Time: ${executionTime}ms`)

    return result
  } catch (error: any) {
    const executionTime = Date.now() - startTime
    console.error(`[Test] ✗ ${query} - Erro:`, error.message)

    return {
      query,
      success: false,
      type: expectedType,
      hasData: false,
      hasTVL: false,
      hasPrice: false,
      hasLogo: false,
      hasCirculatingSupply: false,
      hasCharts: false,
      category: 'N/A',
      error: error.message,
      executionTime
    }
  }
}

/**
 * Testa múltiplos itens em sequência (não paralelo para não sobrecarregar APIs)
 */
async function testMultiple(items: string[], type: 'chain' | 'protocol' | 'token'): Promise<TestResult[]> {
  const results: TestResult[] = []

  for (const item of items) {
    const result = await testItem(item, type)
    results.push(result)

    // Delay entre requests para não bater rate limit
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return results
}

/**
 * Gera relatório consolidado
 */
function generateReport(results: TestResult[]): void {
  console.log('\n\n' + '='.repeat(80))
  console.log('📊 RELATÓRIO DE TESTES MASSIVOS')
  console.log('='.repeat(80))

  const total = results.length
  const successful = results.filter(r => r.success && r.hasData).length
  const withPrice = results.filter(r => r.hasPrice).length
  const withTVL = results.filter(r => r.hasTVL).length
  const withLogo = results.filter(r => r.hasLogo).length
  const withSupply = results.filter(r => r.hasCirculatingSupply).length
  const withCharts = results.filter(r => r.hasCharts).length
  const failed = results.filter(r => !r.success || !r.hasData).length

  console.log(`\n📈 ESTATÍSTICAS GERAIS`)
  console.log(`   Total de testes: ${total}`)
  console.log(`   ✓ Sucesso: ${successful} (${((successful / total) * 100).toFixed(1)}%)`)
  console.log(`   ✗ Falhas: ${failed} (${((failed / total) * 100).toFixed(1)}%)`)

  console.log(`\n💰 QUALIDADE DOS DADOS`)
  console.log(`   Com Preço: ${withPrice} (${((withPrice / total) * 100).toFixed(1)}%)`)
  console.log(`   Com TVL: ${withTVL} (${((withTVL / total) * 100).toFixed(1)}%)`)
  console.log(`   Com Logo: ${withLogo} (${((withLogo / total) * 100).toFixed(1)}%)`)
  console.log(`   Com Supply: ${withSupply} (${((withSupply / total) * 100).toFixed(1)}%)`)
  console.log(`   Com Gráficos: ${withCharts} (${((withCharts / total) * 100).toFixed(1)}%)`)

  // Stats por categoria
  const byCategory = results.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log(`\n🏷️  CATEGORIAS`)
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`)
    })

  // Performance
  const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length
  const maxTime = Math.max(...results.map(r => r.executionTime))
  const minTime = Math.min(...results.map(r => r.executionTime))

  console.log(`\n⚡ PERFORMANCE`)
  console.log(`   Tempo médio: ${avgTime.toFixed(0)}ms`)
  console.log(`   Tempo mínimo: ${minTime}ms`)
  console.log(`   Tempo máximo: ${maxTime}ms`)

  // Top failures
  const failures = results.filter(r => !r.success || !r.hasData)
  if (failures.length > 0) {
    console.log(`\n❌ FALHAS (${failures.length} total):`)
    failures.slice(0, 20).forEach(f => {
      console.log(`   • ${f.query}: ${f.error || 'No data'}`)
    })
    if (failures.length > 20) {
      console.log(`   ... e mais ${failures.length - 20} falhas`)
    }
  }

  // Top successes with best data
  const topSuccesses = results
    .filter(r => r.success && r.hasData)
    .sort((a, b) => {
      const scoreA = (a.hasPrice ? 1 : 0) + (a.hasTVL ? 1 : 0) + (a.hasLogo ? 1 : 0) + (a.hasCirculatingSupply ? 1 : 0) + (a.hasCharts ? 1 : 0)
      const scoreB = (b.hasPrice ? 1 : 0) + (b.hasTVL ? 1 : 0) + (b.hasLogo ? 1 : 0) + (b.hasCirculatingSupply ? 1 : 0) + (b.hasCharts ? 1 : 0)
      return scoreB - scoreA
    })
    .slice(0, 10)

  console.log(`\n✨ TOP 10 MELHORES RESULTADOS:`)
  topSuccesses.forEach((r, i) => {
    const score = (r.hasPrice ? 1 : 0) + (r.hasTVL ? 1 : 0) + (r.hasLogo ? 1 : 0) + (r.hasCirculatingSupply ? 1 : 0) + (r.hasCharts ? 1 : 0)
    console.log(`   ${i + 1}. ${r.query} (${r.category}) - Score: ${score}/5`)
    console.log(`      Price: ${r.hasPrice ? '✓' : '✗'}, TVL: ${r.hasTVL ? '✓' : '✗'}, Logo: ${r.hasLogo ? '✓' : '✗'}, Supply: ${r.hasCirculatingSupply ? '✓' : '✗'}, Charts: ${r.hasCharts ? '✓' : '✗'}`)
  })

  console.log('\n' + '='.repeat(80))
}

/**
 * Executa teste massivo
 */
async function runMassiveTest(): Promise<void> {
  console.log('🚀 INICIANDO TESTE MASSIVO')
  console.log(`   Blockchains: ${BLOCKCHAINS.length}`)
  console.log(`   Protocolos DeFi: ${Object.values(DEFI_PROTOCOLS).flat().length}`)
  console.log(`   Total de testes: ${BLOCKCHAINS.length + Object.values(DEFI_PROTOCOLS).flat().length}`)
  console.log('')

  const allResults: TestResult[] = []

  // Testar blockchains
  console.log('\n🔗 TESTANDO BLOCKCHAINS...\n')
  const chainResults = await testMultiple(BLOCKCHAINS, 'chain')
  allResults.push(...chainResults)

  // Testar protocolos DeFi por categoria
  for (const [category, protocols] of Object.entries(DEFI_PROTOCOLS)) {
    console.log(`\n🏦 TESTANDO PROTOCOLOS - ${category}...\n`)
    const protocolResults = await testMultiple(protocols, 'protocol')
    allResults.push(...protocolResults)
  }

  // Gerar relatório
  generateReport(allResults)
}

// Executar se chamado diretamente
if (require.main === module) {
  runMassiveTest().catch(console.error)
}

export { runMassiveTest, testItem, generateReport }
