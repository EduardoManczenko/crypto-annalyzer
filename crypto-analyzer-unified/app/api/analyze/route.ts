import { NextRequest, NextResponse } from 'next/server';
import { CryptoData, AnalysisReport } from '@/types';
import { calculateRedFlags, calculateRiskScore } from '@/utils/analyzer';
import {
  fetchDeFiLlamaProtocol,
  fetchDeFiLlamaTVLHistory,
  fetchCoinGecko,
  fetchCoinGeckoPriceHistory
} from '@/lib/robust-fetcher';
import {
  extractTVL,
  calculateTVLChanges,
  extractChainTVLs,
  calculatePriceChanges
} from '@/lib/tvl-calculator';
import { cacheCleanup } from '@/lib/persistent-cache';

// Configure runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Endpoint principal de análise - VERSÃO ULTRA ROBUSTA
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
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[API] ANALISANDO: ${query}`);
    console.log('='.repeat(60));

    const startTime = Date.now();

    // Cleanup de cache expirado (assíncrono, não bloqueia)
    cacheCleanup().catch(() => {});

    // Normalizar query para slug
    const slug = query.toLowerCase().replace(/\s+/g, '-');

    // FASE 1: Buscar dados básicos em paralelo
    console.log('\n[FASE 1] Buscando dados básicos...');
    const [defiData, coinData] = await Promise.all([
      fetchDeFiLlamaProtocol(slug),
      fetchCoinGecko(query)
    ]);

    console.log(`[FASE 1] Resultados - DeFi: ${!!defiData}, Coin: ${!!coinData}`);

    if (!defiData && !coinData) {
      console.log(`[API] ✗ Nenhum dado encontrado para: ${query}\n`);
      return NextResponse.json(
        { error: 'Nenhum dado encontrado. Verifique o nome e tente novamente.' },
        { status: 404, headers }
      );
    }

    // FASE 2: Buscar dados históricos em paralelo (apenas se temos dados básicos)
    console.log('\n[FASE 2] Buscando dados históricos...');
    const [tvlHistory, priceHistory] = await Promise.all([
      defiData ? fetchDeFiLlamaTVLHistory(slug) : Promise.resolve(null),
      coinData?._coinId ? fetchCoinGeckoPriceHistory(coinData._coinId) : Promise.resolve(null)
    ]);

    console.log(`[FASE 2] Históricos - TVL: ${tvlHistory ? 'sim' : 'não'}, Preço: ${priceHistory ? 'sim' : 'não'}`);

    // FASE 3: Extração e cálculo de métricas
    console.log('\n[FASE 3] Calculando métricas...');

    // TVL atual
    const tvl = extractTVL(defiData);
    console.log(`[FASE 3] TVL extraído: ${tvl ? `$${(tvl / 1e9).toFixed(2)}B` : 'N/A'}`);

    // Variações de TVL (usa histórico se disponível)
    const tvlChange = calculateTVLChanges(defiData, tvlHistory);
    console.log(`[FASE 3] Variações de TVL:`, tvlChange);

    // TVL por chain
    const chains = extractChainTVLs(defiData);
    console.log(`[FASE 3] Chains: ${chains ? Object.keys(chains).length : 0}`);

    // Preço atual
    const currentPrice = coinData?.market_data?.current_price?.usd || null;

    // Variações de preço (da API ou calculadas)
    let priceChange = {
      '24h': coinData?.market_data?.price_change_percentage_24h || null,
      '7d': coinData?.market_data?.price_change_percentage_7d || null,
      '30d': coinData?.market_data?.price_change_percentage_30d || null,
      '365d': coinData?.market_data?.price_change_percentage_1y || null,
    };

    // Se não temos variações da API, calcular do histórico
    if (priceHistory && currentPrice && (!priceChange['24h'] && !priceChange['7d'])) {
      console.log('[FASE 3] Calculando variações de preço do histórico...');
      const calculated = calculatePriceChanges(priceHistory, currentPrice);
      priceChange = {
        '24h': priceChange['24h'] || calculated['24h'],
        '7d': priceChange['7d'] || calculated['7d'],
        '30d': priceChange['30d'] || calculated['30d'],
        '365d': priceChange['365d'] || calculated['365d'],
      };
    }

    console.log(`[FASE 3] Variações de preço:`, priceChange);

    // FASE 4: Consolidar dados finais
    console.log('\n[FASE 4] Consolidando dados...');

    const data: CryptoData = {
      name: coinData?.name || defiData?.name || query,
      symbol: coinData?.symbol?.toUpperCase() || defiData?.symbol?.toUpperCase() || 'N/A',
      logo: coinData?.image?.large || coinData?.image?.small || defiData?.logo || undefined,
      price: currentPrice,
      marketCap: coinData?.market_data?.market_cap?.usd || defiData?.mcap || null,
      fdv: coinData?.market_data?.fully_diluted_valuation?.usd || null,
      volume24h: coinData?.market_data?.total_volume?.usd || null,
      circulating: coinData?.market_data?.circulating_supply || null,
      total: coinData?.market_data?.total_supply || null,
      max: coinData?.market_data?.max_supply || null,
      tvl,
      tvlChange,
      priceChange,
      priceHistory: priceHistory || undefined,
      chains,
      category: defiData?.category || coinData?.categories?.[0] || 'Crypto',
    };

    // Estatísticas de dados obtidos
    const dataStats = {
      name: data.name,
      symbol: data.symbol,
      hasLogo: !!data.logo,
      hasPrice: !!data.price,
      hasMarketCap: !!data.marketCap,
      hasFDV: !!data.fdv,
      hasVolume: !!data.volume24h,
      hasTVL: !!data.tvl,
      tvlChanges: Object.entries(data.tvlChange)
        .filter(([, v]) => v !== null)
        .map(([k]) => k),
      priceChanges: Object.entries(data.priceChange)
        .filter(([, v]) => v !== null)
        .map(([k]) => k),
      hasPriceHistory: !!data.priceHistory,
      hasChains: !!data.chains,
      chainCount: data.chains ? Object.keys(data.chains).length : 0
    };

    console.log('[FASE 4] Estatísticas de dados:');
    console.log(`  - Nome: ${dataStats.name} (${dataStats.symbol})`);
    console.log(`  - Logo: ${dataStats.hasLogo ? 'sim' : 'não'}`);
    console.log(`  - Preço: ${dataStats.hasPrice ? 'sim' : 'não'}`);
    console.log(`  - Market Cap: ${dataStats.hasMarketCap ? 'sim' : 'não'}`);
    console.log(`  - TVL: ${dataStats.hasTVL ? 'sim' : 'não'}`);
    console.log(`  - Variações TVL: ${dataStats.tvlChanges.join(', ') || 'nenhuma'}`);
    console.log(`  - Variações Preço: ${dataStats.priceChanges.join(', ') || 'nenhuma'}`);
    console.log(`  - Histórico preço: ${dataStats.hasPriceHistory ? 'sim' : 'não'}`);
    console.log(`  - Chains: ${dataStats.chainCount}`);

    // FASE 5: Análise de risco
    console.log('\n[FASE 5] Analisando riscos...');

    const riskAnalysis = calculateRedFlags(data);
    const riskScore = calculateRiskScore(
      riskAnalysis.flags.length,
      riskAnalysis.warnings.length,
      riskAnalysis.positives.length
    );

    console.log(`[FASE 5] Score de risco: ${riskScore.score}/100`);
    console.log(`  - Flags: ${riskAnalysis.flags.length}`);
    console.log(`  - Warnings: ${riskAnalysis.warnings.length}`);
    console.log(`  - Positives: ${riskAnalysis.positives.length}`);
    console.log(`  - Classificação: ${riskScore.classification}`);

    // Construir relatório final
    const report: AnalysisReport = {
      data,
      riskAnalysis,
      riskScore,
    };

    const elapsed = Date.now() - startTime;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[API] ✓ ANÁLISE COMPLETA - ${query} (${elapsed}ms)`);
    console.log('='.repeat(60) + '\n');

    return NextResponse.json(report, { headers });

  } catch (error: any) {
    console.error(`\n${'='.repeat(60)}`);
    console.error('[API] ✗ ERRO NA ANÁLISE');
    console.error('='.repeat(60));
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(60) + '\n');

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
