/**
 * Data Validator
 * Valida consistência e qualidade dos dados agregados
 */

import type { AggregatedData } from '../data-sources/data-aggregator'

export interface ValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  quality: 'excellent' | 'good' | 'fair' | 'poor'
}

/**
 * Valida se um número está dentro de um range razoável
 */
function isReasonableNumber(value: number | null, min: number = 0, max: number = Infinity): boolean {
  if (value === null) return true // null é válido
  return value >= min && value <= max && !isNaN(value) && isFinite(value)
}

/**
 * Valida se porcentagem está dentro de um range razoável
 */
function isReasonablePercentage(value: number | null, maxAbsolute: number = 1000): boolean {
  if (value === null) return true
  return Math.abs(value) <= maxAbsolute && !isNaN(value) && isFinite(value)
}

/**
 * Valida dados agregados
 */
export function validateData(data: AggregatedData): ValidationResult {
  const warnings: string[] = []
  const errors: string[] = []

  // 1. Validar informações básicas
  if (!data.name || data.name === 'N/A') {
    errors.push('Nome do ativo não encontrado')
  }

  if (!data.symbol || data.symbol === 'N/A') {
    warnings.push('Símbolo não encontrado')
  }

  // 2. Validar preço
  if (data.price !== null) {
    if (!isReasonableNumber(data.price, 0.000001, 10000000)) {
      warnings.push(`Preço fora do range esperado: $${data.price}`)
    }
  }

  // 3. Validar Market Cap
  if (data.marketCap !== null) {
    if (!isReasonableNumber(data.marketCap, 1000, 10000000000000)) {
      warnings.push(`Market Cap fora do range esperado: $${data.marketCap}`)
    }

    // Market Cap não pode ser menor que preço * circulating
    if (data.price && data.circulating) {
      const calculatedMcap = data.price * data.circulating
      const difference = Math.abs(data.marketCap - calculatedMcap) / calculatedMcap

      if (difference > 0.1) { // 10% de diferença
        warnings.push(`Market Cap inconsistente com preço × supply circulante (${(difference * 100).toFixed(1)}% diferença)`)
      }
    }
  }

  // 4. Validar FDV
  if (data.fdv !== null) {
    if (!isReasonableNumber(data.fdv, 1000, 10000000000000)) {
      warnings.push(`FDV fora do range esperado: $${data.fdv}`)
    }

    // FDV deve ser >= Market Cap
    if (data.marketCap && data.fdv < data.marketCap) {
      warnings.push('FDV menor que Market Cap (improvável)')
    }
  }

  // 5. Validar Volume 24h
  if (data.volume24h !== null) {
    if (!isReasonableNumber(data.volume24h, 0, 1000000000000)) {
      warnings.push(`Volume 24h fora do range esperado: $${data.volume24h}`)
    }

    // Volume muito baixo em relação ao Market Cap
    if (data.marketCap && data.volume24h < data.marketCap * 0.0001) {
      warnings.push('Volume 24h muito baixo em relação ao Market Cap (<0.01%)')
    }
  }

  // 6. Validar Supply
  if (data.circulating !== null && !isReasonableNumber(data.circulating, 1, 1000000000000000)) {
    warnings.push(`Supply circulante fora do range esperado: ${data.circulating}`)
  }

  if (data.total !== null && !isReasonableNumber(data.total, 1, 1000000000000000)) {
    warnings.push(`Supply total fora do range esperado: ${data.total}`)
  }

  if (data.max !== null && !isReasonableNumber(data.max, 1, 1000000000000000)) {
    warnings.push(`Max supply fora do range esperado: ${data.max}`)
  }

  // Supply circulante não pode ser maior que total
  if (data.circulating && data.total && data.circulating > data.total) {
    errors.push('Supply circulante maior que supply total (inconsistência)')
  }

  // Supply total não pode ser maior que max
  if (data.total && data.max && data.total > data.max) {
    errors.push('Supply total maior que max supply (inconsistência)')
  }

  // 7. Validar TVL
  if (data.tvl !== null) {
    if (!isReasonableNumber(data.tvl, 1000, 10000000000000)) {
      warnings.push(`TVL fora do range esperado: $${data.tvl}`)
    }

    // TVL muito maior que Market Cap pode ser suspeito
    if (data.marketCap && data.tvl > data.marketCap * 100) {
      warnings.push(`TVL muito maior que Market Cap (${(data.tvl / data.marketCap).toFixed(0)}x)`)
    }
  }

  // 8. Validar mudanças de TVL
  if (data.tvlChange['1d'] !== null && !isReasonablePercentage(data.tvlChange['1d'], 500)) {
    warnings.push(`Mudança de TVL 24h extrema: ${data.tvlChange['1d'].toFixed(2)}%`)
  }

  if (data.tvlChange['7d'] !== null && !isReasonablePercentage(data.tvlChange['7d'], 1000)) {
    warnings.push(`Mudança de TVL 7d extrema: ${data.tvlChange['7d'].toFixed(2)}%`)
  }

  // 9. Validar mudanças de preço
  if (data.priceChange['24h'] !== null && !isReasonablePercentage(data.priceChange['24h'], 500)) {
    warnings.push(`Mudança de preço 24h extrema: ${data.priceChange['24h'].toFixed(2)}%`)
  }

  if (data.priceChange['7d'] !== null && !isReasonablePercentage(data.priceChange['7d'], 1000)) {
    warnings.push(`Mudança de preço 7d extrema: ${data.priceChange['7d'].toFixed(2)}%`)
  }

  // 10. Validar histórico de preços
  if (data.priceHistory) {
    const periods = ['24h', '7d', '30d', '365d'] as const

    for (const period of periods) {
      const prices = data.priceHistory[period]

      if (prices && prices.length > 0) {
        // Verificar se há valores negativos
        const hasNegative = prices.some(p => p.price < 0)
        if (hasNegative) {
          errors.push(`Histórico ${period} contém preços negativos`)
        }

        // Verificar se há valores NaN ou Infinity
        const hasInvalid = prices.some(p => !isFinite(p.price))
        if (hasInvalid) {
          errors.push(`Histórico ${period} contém valores inválidos`)
        }

        // Verificar ordem cronológica
        for (let i = 1; i < prices.length; i++) {
          if (prices[i].timestamp < prices[i - 1].timestamp) {
            warnings.push(`Histórico ${period} fora de ordem cronológica`)
            break
          }
        }
      }
    }
  }

  // 11. Validar distribuição de chains
  if (data.chains) {
    const totalChainTvl = Object.values(data.chains).reduce((sum, tvl) => sum + tvl, 0)

    // Se temos TVL total, verificar se soma das chains é razoável
    if (data.tvl && totalChainTvl > 0) {
      const difference = Math.abs(data.tvl - totalChainTvl) / data.tvl

      if (difference > 0.2) { // 20% de diferença
        warnings.push(`Soma de TVL por chain difere do TVL total em ${(difference * 100).toFixed(1)}%`)
      }
    }

    // Verificar se há chains com valores suspeitos
    for (const [chain, tvl] of Object.entries(data.chains)) {
      if (!isReasonableNumber(tvl, 1000, 10000000000000)) {
        warnings.push(`TVL da chain ${chain} fora do range: $${tvl}`)
      }
    }
  }

  // 12. Validar fontes
  if (!data.sources.defiLlama && !data.sources.coinGecko && !data.sources.scraped) {
    errors.push('Nenhuma fonte de dados identificada')
  }

  // 13. Calcular qualidade dos dados
  let quality: ValidationResult['quality'] = 'excellent'

  const dataPoints = [
    data.price,
    data.marketCap,
    data.fdv,
    data.volume24h,
    data.circulating,
    data.tvl,
    data.priceHistory
  ]

  const availableDataPoints = dataPoints.filter(d => d !== null && d !== undefined).length
  const totalDataPoints = dataPoints.length

  const completeness = availableDataPoints / totalDataPoints

  if (errors.length > 0) {
    quality = 'poor'
  } else if (warnings.length > 3 || completeness < 0.4) {
    quality = 'fair'
  } else if (warnings.length > 0 || completeness < 0.7) {
    quality = 'good'
  } else {
    quality = 'excellent'
  }

  // Log de validação
  console.log('[Validator] ========== Validação de Dados ==========')
  console.log('[Validator] Qualidade:', quality.toUpperCase())
  console.log('[Validator] Completude:', `${(completeness * 100).toFixed(0)}%`)
  console.log('[Validator] Erros:', errors.length)
  console.log('[Validator] Warnings:', warnings.length)

  if (errors.length > 0) {
    console.log('[Validator] ERROS:')
    errors.forEach(e => console.log(`  - ${e}`))
  }

  if (warnings.length > 0) {
    console.log('[Validator] WARNINGS:')
    warnings.forEach(w => console.log(`  - ${w}`))
  }

  console.log('[Validator] =======================================\n')

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    quality
  }
}

/**
 * Valida se os dados são suficientes para análise
 */
export function hasMinimumData(data: AggregatedData): boolean {
  // Precisa de pelo menos nome e um dos seguintes: preço, market cap, ou TVL
  return !!(
    data.name &&
    data.name !== 'N/A' &&
    (data.price || data.marketCap || data.tvl)
  )
}
