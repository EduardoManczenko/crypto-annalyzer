/**
 * Calculador robusto de TVL e variações
 * Implementa múltiplos métodos e fallbacks para garantir dados precisos
 */

/**
 * Extrai TVL atual de múltiplas fontes
 */
export function extractTVL(defiData: any): number | null {
  if (!defiData) return null

  console.log('[TVL Extractor] Iniciando extração...')

  // MÉTODO 1 (PREFERIDO): Último item do array tvl
  if (defiData.tvl && Array.isArray(defiData.tvl) && defiData.tvl.length > 0) {
    const lastTvl = defiData.tvl[defiData.tvl.length - 1]
    if (lastTvl?.totalLiquidityUSD) {
      console.log('[TVL Extractor] ✓ Método 1 (array tvl):', lastTvl.totalLiquidityUSD)
      return lastTvl.totalLiquidityUSD
    }
  }

  // MÉTODO 2: Campo tvl direto como número
  if (typeof defiData.tvl === 'number' && defiData.tvl > 0) {
    console.log('[TVL Extractor] ✓ Método 2 (tvl direto):', defiData.tvl)
    return defiData.tvl
  }

  // MÉTODO 3: currentChainTvls somados (filtrados)
  if (defiData.currentChainTvls) {
    const chainTvls = Object.entries(defiData.currentChainTvls)
      .filter(([key, value]) => {
        if (typeof value !== 'number') return false
        // Ignorar sufixos especiais
        if (key.includes('-borrowed') || key.includes('-staking') || key.includes('-pool2')) return false
        if (key === 'staking' || key === 'pool2' || key === 'borrowed') return false
        return true
      })
      .reduce((sum, [, value]) => sum + (value as number), 0)

    if (chainTvls > 0) {
      console.log('[TVL Extractor] ✓ Método 3 (currentChainTvls):', chainTvls)
      return chainTvls
    }
  }

  // MÉTODO 4: chainTvls (histórico mais recente)
  if (defiData.chainTvls) {
    const chainTvls = Object.entries(defiData.chainTvls)
      .filter(([key, value]) => {
        if (typeof value !== 'number') return false
        if (key.includes('-borrowed') || key.includes('-staking') || key.includes('-pool2')) return false
        if (key === 'staking' || key === 'pool2' || key === 'borrowed') return false
        return true
      })
      .reduce((sum, [, value]) => sum + (value as number), 0)

    if (chainTvls > 0) {
      console.log('[TVL Extractor] ✓ Método 4 (chainTvls):', chainTvls)
      return chainTvls
    }
  }

  // MÉTODO 5: Campo direto mcap (market cap pode servir de proxy)
  if (typeof defiData.mcap === 'number' && defiData.mcap > 0) {
    console.log('[TVL Extractor] ⚠ Método 5 (usando mcap como proxy):', defiData.mcap)
    return defiData.mcap
  }

  console.log('[TVL Extractor] ✗ Nenhum TVL encontrado')
  return null
}

/**
 * Calcula variações de TVL com múltiplos métodos
 */
export function calculateTVLChanges(defiData: any, tvlHistory?: any[]): {
  '1d': number | null
  '7d': number | null
  '30d': number | null
  '365d': number | null
} {
  console.log('[TVL Changes] Calculando variações...')

  const result = {
    '1d': null as number | null,
    '7d': null as number | null,
    '30d': null as number | null,
    '365d': null as number | null
  }

  if (!defiData) return result

  // MÉTODO 1: Usar campos diretos da API (mais confiável)
  if (defiData.change_1d !== undefined && defiData.change_1d !== null) {
    result['1d'] = defiData.change_1d
    console.log('[TVL Changes] ✓ change_1d direto:', defiData.change_1d)
  }

  if (defiData.change_7d !== undefined && defiData.change_7d !== null) {
    result['7d'] = defiData.change_7d
    console.log('[TVL Changes] ✓ change_7d direto:', defiData.change_7d)
  }

  if (defiData.change_1m !== undefined && defiData.change_1m !== null) {
    result['30d'] = defiData.change_1m
    console.log('[TVL Changes] ✓ change_1m direto:', defiData.change_1m)
  }

  // MÉTODO 2: Calcular a partir do histórico de TVL
  const historyData = tvlHistory || defiData.tvl
  if (historyData && Array.isArray(historyData) && historyData.length > 1) {
    console.log('[TVL Changes] Calculando a partir de histórico:', historyData.length, 'pontos')

    const currentTvl = historyData[historyData.length - 1]?.totalLiquidityUSD
    if (!currentTvl) {
      console.log('[TVL Changes] ⚠ TVL atual não encontrado no histórico')
      return result
    }

    const now = Date.now() / 1000

    // Função para encontrar TVL mais próximo de um timestamp
    const findClosestTVL = (targetTime: number): number | null => {
      let closest = null
      let minDiff = Infinity

      for (const item of historyData) {
        const timestamp = item.date || item.timestamp
        if (!timestamp) continue

        const diff = Math.abs(timestamp - targetTime)
        if (diff < minDiff) {
          minDiff = diff
          closest = item.totalLiquidityUSD || item.tvl
        }
      }

      return closest
    }

    // Calcular variações
    const periods = [
      { key: '1d' as const, seconds: 86400 },
      { key: '7d' as const, seconds: 7 * 86400 },
      { key: '30d' as const, seconds: 30 * 86400 },
      { key: '365d' as const, seconds: 365 * 86400 }
    ]

    for (const period of periods) {
      // Só calcular se não temos valor direto da API
      if (result[period.key] !== null) continue

      const targetTime = now - period.seconds
      const oldTvl = findClosestTVL(targetTime)

      if (oldTvl && oldTvl > 0) {
        const change = ((currentTvl - oldTvl) / oldTvl) * 100
        result[period.key] = change
        console.log(`[TVL Changes] ✓ ${period.key} calculado:`, change.toFixed(2) + '%')
      } else {
        console.log(`[TVL Changes] ⚠ ${period.key}: TVL histórico não encontrado`)
      }
    }
  }

  // MÉTODO 3: Tentar extrair de outros campos
  if (result['1d'] === null && defiData.change1d !== undefined) {
    result['1d'] = defiData.change1d
  }
  if (result['7d'] === null && defiData.change7d !== undefined) {
    result['7d'] = defiData.change7d
  }
  if (result['30d'] === null && (defiData.change30d !== undefined || defiData.change1m !== undefined)) {
    result['30d'] = defiData.change30d || defiData.change1m
  }
  if (result['365d'] === null && (defiData.change365d !== undefined || defiData.change1y !== undefined)) {
    result['365d'] = defiData.change365d || defiData.change1y
  }

  console.log('[TVL Changes] Resultado final:', result)
  return result
}

/**
 * Extrai TVLs por chain (filtrado)
 */
export function extractChainTVLs(defiData: any): Record<string, number> | null {
  if (!defiData) return null

  console.log('[Chain TVLs] Extraindo TVLs por chain...')

  // Tentar currentChainTvls primeiro
  const chainTvls = defiData.currentChainTvls || defiData.chainTvls
  if (!chainTvls || typeof chainTvls !== 'object') {
    console.log('[Chain TVLs] ✗ Nenhum chainTvls encontrado')
    return null
  }

  const filtered: Record<string, number> = {}

  Object.entries(chainTvls).forEach(([chain, value]) => {
    // Só números
    if (typeof value !== 'number') return

    // Filtrar sufixos especiais
    if (chain.includes('-borrowed') || chain.includes('-staking') || chain.includes('-pool2')) {
      return
    }

    // Filtrar agregados
    if (chain === 'staking' || chain === 'pool2' || chain === 'borrowed') {
      return
    }

    filtered[chain] = value
  })

  const chainCount = Object.keys(filtered).length
  if (chainCount === 0) {
    console.log('[Chain TVLs] ✗ Nenhuma chain após filtragem')
    return null
  }

  console.log(`[Chain TVLs] ✓ ${chainCount} chains encontradas`)

  // Log das top 5 chains
  const top5 = Object.entries(filtered)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, tvl]) => `${name}: $${(tvl / 1e9).toFixed(2)}B`)
  console.log('[Chain TVLs] Top 5:', top5.join(', '))

  return filtered
}

/**
 * Calcula variações percentuais de preço
 */
export function calculatePriceChanges(
  priceHistory: any,
  currentPrice: number
): {
  '24h': number | null
  '7d': number | null
  '30d': number | null
  '365d': number | null
} {
  const result = {
    '24h': null as number | null,
    '7d': null as number | null,
    '30d': null as number | null,
    '365d': null as number | null
  }

  if (!priceHistory || !currentPrice) return result

  console.log('[Price Changes] Calculando variações de preço...')

  const periods = [
    { key: '24h' as const, data: priceHistory['24h'] },
    { key: '7d' as const, data: priceHistory['7d'] },
    { key: '30d' as const, data: priceHistory['30d'] },
    { key: '365d' as const, data: priceHistory['365d'] }
  ]

  for (const period of periods) {
    if (!period.data || !Array.isArray(period.data) || period.data.length === 0) {
      continue
    }

    // Pegar primeiro preço do período
    const oldPrice = period.data[0]?.price
    if (oldPrice && oldPrice > 0) {
      const change = ((currentPrice - oldPrice) / oldPrice) * 100
      result[period.key] = change
      console.log(`[Price Changes] ✓ ${period.key}:`, change.toFixed(2) + '%')
    }
  }

  return result
}
