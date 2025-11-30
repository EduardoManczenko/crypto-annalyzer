import { CryptoData, RiskAnalysis, RiskScore } from '@/types';

/**
 * Calcula red flags, warnings e pontos positivos com base nos dados
 */
export function calculateRedFlags(data: CryptoData): RiskAnalysis {
  const flags: string[] = [];
  const warnings: string[] = [];
  const positives: string[] = [];

  // ========== ANÁLISE DE SUPPLY ==========
  if (data.circulating && data.total) {
    const circulatingPercent = (data.circulating / data.total) * 100;

    if (circulatingPercent < 30) {
      flags.push(`🚨 Apenas ${circulatingPercent.toFixed(1)}% em circulação - Alto risco de diluição!`);
    } else if (circulatingPercent < 50) {
      warnings.push(`⚠️  ${circulatingPercent.toFixed(1)}% em circulação - Risco moderado de diluição`);
    } else {
      positives.push(`✅ ${circulatingPercent.toFixed(1)}% em circulação - Boa distribuição`);
    }
  }

  // ========== ANÁLISE FDV/MCAP RATIO ==========
  if (data.fdv && data.marketCap) {
    const ratio = data.fdv / data.marketCap;

    if (ratio > 10) {
      flags.push(`🚨 FDV/MCap ratio de ${ratio.toFixed(1)}x - RISCO EXTREMO de diluição!`);
    } else if (ratio > 3) {
      warnings.push(`⚠️  FDV/MCap ratio de ${ratio.toFixed(1)}x - Risco elevado de diluição`);
    } else if (ratio < 1.5) {
      positives.push(`✅ FDV/MCap ratio de ${ratio.toFixed(1)}x - Baixo risco de diluição`);
    }
  }

  // ========== ANÁLISE DE VOLUME ==========
  if (data.volume24h && data.marketCap) {
    const volumeRatio = (data.volume24h / data.marketCap) * 100;

    if (volumeRatio < 1) {
      flags.push(`🚨 Volume 24h de apenas ${volumeRatio.toFixed(2)}% do Market Cap - Liquidez MUITO baixa!`);
    } else if (volumeRatio < 5) {
      warnings.push(`⚠️  Volume 24h de ${volumeRatio.toFixed(2)}% do Market Cap - Liquidez baixa`);
    } else {
      positives.push(`✅ Volume 24h de ${volumeRatio.toFixed(2)}% do Market Cap - Boa liquidez`);
    }
  }

  // ========== ANÁLISE TVL (DeFi) ==========
  if (data.tvl && data.marketCap) {
    const mcapTvlRatio = data.marketCap / data.tvl;

    if (mcapTvlRatio < 0.5) {
      positives.push(`✅ MCap/TVL de ${mcapTvlRatio.toFixed(2)} - Potencialmente subvalorizado!`);
    } else if (mcapTvlRatio > 3) {
      warnings.push(`⚠️  MCap/TVL de ${mcapTvlRatio.toFixed(2)} - Potencialmente sobrevalorizado`);
    }
  }

  // ========== ANÁLISE DE MUDANÇA DE TVL ==========
  if (data.tvlChange) {
    const tvlChange7d = data.tvlChange['7d'];

    if (tvlChange7d !== null && tvlChange7d < -20) {
      flags.push(`🚨 TVL caiu ${Math.abs(tvlChange7d).toFixed(1)}% em 7 dias - Fuga de capital!`);
    } else if (tvlChange7d !== null && tvlChange7d > 20) {
      positives.push(`✅ TVL cresceu ${tvlChange7d.toFixed(1)}% em 7 dias - Forte entrada de capital!`);
    }
  }

  // ========== ANÁLISE DE MUDANÇA DE PREÇO ==========
  if (data.priceChange) {
    const priceChange7d = data.priceChange['7d'];

    if (priceChange7d !== null && priceChange7d < -30) {
      warnings.push(`⚠️  Preço caiu ${Math.abs(priceChange7d).toFixed(1)}% em 7 dias - Alta volatilidade`);
    }
  }

  // ========== CATEGORIA DE MARKET CAP ==========
  if (data.marketCap) {
    const { category, risk } = getMarketCapCategory(data.marketCap);

    if (risk === 'Alto') {
      warnings.push(`⚠️  ${category} - Maior risco e volatilidade`);
    } else if (risk === 'Baixo') {
      positives.push(`✅ ${category} - Projeto estabelecido`);
    }
  }

  return { flags, warnings, positives };
}

/**
 * Calcula o score de risco geral (0-100)
 */
export function calculateRiskScore(
  redFlags: number,
  warnings: number,
  positives: number
): RiskScore {
  let score = 50; // Base score

  // Penalidades
  score -= redFlags * 15;  // -15 por red flag crítico
  score -= warnings * 5;   // -5 por warning

  // Bônus
  score += positives * 8;  // +8 por ponto positivo

  // Limitar score entre 0-100
  score = Math.max(0, Math.min(100, score));

  // Determinar classificação e recomendação
  let classification: string;
  let recommendation: string;

  if (score >= 80) {
    classification = 'EXCELENTE - Baixo Risco';
    recommendation = 'Projeto com fundamentos sólidos. Adequado para investidores conservadores e de longo prazo.';
  } else if (score >= 60) {
    classification = 'BOM - Risco Moderado';
    recommendation = 'Projeto com bons fundamentos, mas com alguns pontos de atenção. Adequado para perfil moderado.';
  } else if (score >= 40) {
    classification = 'REGULAR - Risco Elevado';
    recommendation = 'Projeto com riscos significativos. Apenas para investidores experientes e com tolerância a risco.';
  } else if (score >= 20) {
    classification = 'RUIM - Alto Risco';
    recommendation = 'Projeto com múltiplos red flags. Alto risco de perda. Considere evitar ou investir apenas quantias mínimas.';
  } else {
    classification = 'PÉSSIMO - Risco Extremo';
    recommendation = '⚠️  EVITE! Múltiplos red flags críticos identificados. Risco extremo de perda total do capital.';
  }

  return { score, classification, recommendation };
}

/**
 * Helper: Determina categoria de market cap
 */
function getMarketCapCategory(mcap: number): { category: string; risk: string } {
  if (mcap >= 10e9) {
    return { category: 'Large-Cap', risk: 'Baixo' };
  }
  if (mcap >= 1e9) {
    return { category: 'Mid-Cap', risk: 'Médio' };
  }
  return { category: 'Small-Cap', risk: 'Alto' };
}
