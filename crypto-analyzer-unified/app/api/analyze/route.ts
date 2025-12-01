import { NextRequest, NextResponse } from 'next/server';
import { CryptoData, AnalysisReport } from '@/types';
import { calculateRedFlags, calculateRiskScore } from '@/utils/analyzer';
import { aggregateData } from '@/lib/data-aggregator';
import { fetchDeFiLlamaTVLHistory, fetchCoinGeckoPriceHistory } from '@/lib/robust-fetcher';
import { calculateTVLChanges, extractChainTVLs } from '@/lib/tvl-calculator';
import { cacheCleanup } from '@/lib/persistent-cache';
import { resolveAlias } from '@/lib/known-aliases';

// Configure runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Endpoint principal de análise - VERSÃO COM MÚLTIPLAS FONTES
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  };

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400, headers }
    );
  }

  try {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`[API] ANALISANDO (MULTI-SOURCE): ${query}`)
    console.log('='.repeat(80))

    const startTime = Date.now();

    // Cleanup de cache (não bloqueia)
    cacheCleanup().catch(() => {});

    // FASE 1: Agregar dados de MÚLTIPLAS fontes
    console.log('\n[FASE 1] Agregando dados de múltiplas fontes...')
    const aggregated = await aggregateData(query)

    if (!aggregated) {
      console.log(`[API] ✗ Nenhum dado encontrado para: ${query}\n`)
      return NextResponse.json(
        { error: 'Nenhum dado encontrado. Verifique o nome e tente novamente.' },
        { status: 404, headers }
      );
    }

    console.log(`[FASE 1] ✓ Dados agregados com sucesso`)

    // FASE 2: Buscar dados históricos (se aplicável)
    console.log('\n[FASE 2] Buscando dados históricos...')

    const alias = resolveAlias(query)
    const slug = query.toLowerCase().replace(/\s+/g, '-')

    const [tvlHistory, priceHistory] = await Promise.allSettled([
      // TVL history apenas se temos DeFiLlama data
      aggregated.dataSources.defiLlama
        ? fetchDeFiLlamaTVLHistory(alias?.defiLlamaSlug || slug)
        : Promise.resolve(null),

      // Price history se temos CoinGecko ID
      aggregated.dataSources.coinGecko
        ? fetchCoinGeckoPriceHistory((aggregated as any)._coinId || aggregated.symbol.toLowerCase())
        : Promise.resolve(null)
    ])

    const tvlHistoryData = tvlHistory.status === 'fulfilled' ? tvlHistory.value : null
    const priceHistoryData = priceHistory.status === 'fulfilled' ? priceHistory.value : null

    console.log(`[FASE 2] Históricos - TVL: ${tvlHistoryData ? 'sim' : 'não'}, Preço: ${priceHistoryData ? 'sim' : 'não'}`)

    // FASE 3: Calcular métricas avançadas
    console.log('\n[FASE 3] Calculando métricas avançadas...')

    // TVL Changes (recalcular com histórico se disponível)
    let tvlChange = aggregated.tvlChange
    if (tvlHistoryData) {
      const calculated = calculateTVLChanges({ tvl: tvlHistoryData }, tvlHistoryData)
      tvlChange = {
        '1d': tvlChange['1d'] || calculated['1d'],
        '7d': tvlChange['7d'] || calculated['7d'],
        '30d': tvlChange['30d'] || calculated['30d'],
        '365d': calculated['365d'] // Agora temos 1 ano!
      }
      console.log(`[FASE 3] TVL Changes recalculados:`, tvlChange)
    }

    // Chains (extrair com filtro)
    const chains = aggregated.chains ? extractChainTVLs({ currentChainTvls: aggregated.chains }) : null
    console.log(`[FASE 3] Chains: ${chains ? Object.keys(chains).length : 0}`)

    // Price Changes (calcular do histórico se necessário)
    let priceChange = aggregated.priceChange
    if (priceHistoryData && aggregated.price) {
      // Calcular do histórico se faltar dados
      const periods = ['24h', '7d', '30d', '365d'] as const
      for (const period of periods) {
        if (!priceChange[period] && priceHistoryData[period]?.length > 0) {
          const firstPrice = priceHistoryData[period][0]?.price
          if (firstPrice && aggregated.price) {
            priceChange[period] = ((aggregated.price - firstPrice) / firstPrice) * 100
          }
        }
      }
      console.log(`[FASE 3] Price Changes:`, priceChange)
    }

    // FASE 4: Consolidar dados finais
    console.log('\n[FASE 4] Consolidando dados finais...')

    const data: CryptoData = {
      name: aggregated.name,
      symbol: aggregated.symbol,
      logo: aggregated.logo,
      price: aggregated.price,
      marketCap: aggregated.marketCap,
      fdv: aggregated.fdv,
      volume24h: aggregated.volume24h,
      circulating: aggregated.circulating,
      total: aggregated.total,
      max: aggregated.max,
      tvl: aggregated.tvl,
      tvlChange,
      priceChange,
      priceHistory: priceHistoryData || undefined,
      chains,
      category: aggregated.category,
    };

    // Estatísticas finais
    const completeness = {
      total: 14, // Total de campos principais
      filled: [
        data.price,
        data.marketCap,
        data.fdv,
        data.volume24h,
        data.circulating,
        data.total,
        data.max,
        data.tvl,
        data.logo,
        data.priceChange['24h'],
        data.priceChange['7d'],
        data.tvlChange['1d'],
        data.tvlChange['7d'],
        data.chains
      ].filter(Boolean).length
    }

    const completenessPercent = ((completeness.filled / completeness.total) * 100).toFixed(1)

    console.log('\n[FASE 4] Cobertura de dados:')
    console.log(`  Completude: ${completeness.filled}/${completeness.total} (${completenessPercent}%)`)
    console.log(`  Fontes: ${Object.entries(aggregated.dataSources).filter(([k, v]) => v && k !== 'others').map(([k]) => k).join(', ')}`)

    // FASE 5: Análise de risco
    console.log('\n[FASE 5] Analisando riscos...')

    const riskAnalysis = calculateRedFlags(data);
    const riskScore = calculateRiskScore(
      riskAnalysis.flags.length,
      riskAnalysis.warnings.length,
      riskAnalysis.positives.length
    );

    console.log(`[FASE 5] Score: ${riskScore.score}/100 (${riskScore.classification})`)

    // Relatório final
    const report: AnalysisReport = {
      data,
      riskAnalysis,
      riskScore,
    };

    const elapsed = Date.now() - startTime;
    console.log(`\n${'='.repeat(80)}`)
    console.log(`[API] ✓ ANÁLISE COMPLETA - ${query} (${elapsed}ms)`)
    console.log(`Cobertura: ${completenessPercent}% | Fontes: ${Object.keys(aggregated.dataSources).filter(k => (aggregated.dataSources as any)[k]).length}`)
    console.log('='.repeat(80) + '\n')

    return NextResponse.json(report, { headers });

  } catch (error: any) {
    console.error(`\n${'='.repeat(80)}`)
    console.error('[API] ✗ ERRO NA ANÁLISE')
    console.error('='.repeat(80))
    console.error('Mensagem:', error.message)
    console.error('Stack:', error.stack)
    console.error('='.repeat(80) + '\n')

    return NextResponse.json(
      {
        error: 'Erro ao processar análise',
        details: error.message || 'Erro desconhecido'
      },
      { status: 500, headers }
    );
  }
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
