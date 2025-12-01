import { NextRequest, NextResponse } from 'next/server';
import { CryptoData, AnalysisReport } from '@/types';
import { calculateRedFlags, calculateRiskScore } from '@/utils/analyzer';
import { aggregateData, type AggregatedData } from '@/lib/data-sources/data-aggregator';
import { validateData, hasMinimumData } from '@/lib/validators/data-validator';

// Configure runtime (nodejs for better compatibility)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Converte dados agregados para o formato CryptoData
 */
function convertToCryptoData(aggregated: AggregatedData): CryptoData {
  return {
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
    tvlChange: aggregated.tvlChange,
    priceChange: aggregated.priceChange,
    priceHistory: aggregated.priceHistory,
    chains: aggregated.chains,
    category: aggregated.category,
  };
}

/**
 * Endpoint principal de análise
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  // Headers CORS
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
    console.log(`\n[API] ========================================`);
    console.log(`[API] 🔍 Analisando: ${query}`);
    console.log(`[API] ========================================\n`);

    // Agregar dados de todas as fontes
    const aggregated = await aggregateData(query);

    if (!aggregated) {
      console.log(`[API] ✗ Nenhum dado encontrado para: ${query}\n`);
      return NextResponse.json(
        { error: 'Nenhum dado encontrado. Verifique o nome e tente novamente.' },
        { status: 404, headers }
      );
    }

    // Validar dados
    const validation = validateData(aggregated);

    console.log(`[API] Validação: ${validation.quality} (${validation.isValid ? 'válido' : 'inválido'})`);

    if (validation.warnings.length > 0) {
      console.log(`[API] ⚠️  Warnings: ${validation.warnings.length}`);
    }

    if (validation.errors.length > 0) {
      console.log(`[API] ❌ Erros: ${validation.errors.length}`);
      validation.errors.forEach(e => console.log(`  - ${e}`));
    }

    // Verificar se tem dados mínimos
    if (!hasMinimumData(aggregated)) {
      console.log(`[API] ✗ Dados insuficientes para análise\n`);
      return NextResponse.json(
        { error: 'Dados insuficientes para análise' },
        { status: 404, headers }
      );
    }

    // Converter para formato legacy
    const data = convertToCryptoData(aggregated);

    // Log detalhado dos dados consolidados
    console.log(`\n[API] ========== DADOS CONSOLIDADOS ==========`);
    console.log(`[API] Nome: ${data.name}`);
    console.log(`[API] Símbolo: ${data.symbol}`);
    console.log(`[API] Categoria: ${data.category}`);
    console.log(`[API] ---`);
    console.log(`[API] Preço: ${data.price ? `$${data.price.toFixed(2)}` : 'N/A'}`);
    console.log(`[API] Market Cap: ${data.marketCap ? `$${(data.marketCap / 1e9).toFixed(2)}B` : 'N/A'}`);
    console.log(`[API] FDV: ${data.fdv ? `$${(data.fdv / 1e9).toFixed(2)}B` : 'N/A'}`);
    console.log(`[API] Volume 24h: ${data.volume24h ? `$${(data.volume24h / 1e9).toFixed(2)}B` : 'N/A'}`);
    console.log(`[API] ---`);
    console.log(`[API] TVL: ${data.tvl ? `$${(data.tvl / 1e9).toFixed(3)}B` : 'N/A'}`);
    console.log(`[API] TVL Change 24h: ${data.tvlChange['1d'] !== null ? `${data.tvlChange['1d'] > 0 ? '+' : ''}${data.tvlChange['1d'].toFixed(2)}%` : 'N/A'}`);
    console.log(`[API] TVL Change 7d: ${data.tvlChange['7d'] !== null ? `${data.tvlChange['7d'] > 0 ? '+' : ''}${data.tvlChange['7d'].toFixed(2)}%` : 'N/A'}`);
    console.log(`[API] ---`);
    console.log(`[API] Circulating: ${data.circulating ? data.circulating.toLocaleString() : 'N/A'}`);
    console.log(`[API] Total Supply: ${data.total ? data.total.toLocaleString() : 'N/A'}`);
    console.log(`[API] Max Supply: ${data.max ? data.max.toLocaleString() : 'N/A'}`);
    console.log(`[API] ---`);
    console.log(`[API] Price Change 24h: ${data.priceChange['24h'] !== null ? `${data.priceChange['24h'] > 0 ? '+' : ''}${data.priceChange['24h'].toFixed(2)}%` : 'N/A'}`);
    console.log(`[API] Price Change 7d: ${data.priceChange['7d'] !== null ? `${data.priceChange['7d'] > 0 ? '+' : ''}${data.priceChange['7d'].toFixed(2)}%` : 'N/A'}`);
    console.log(`[API] ---`);
    console.log(`[API] Histórico de Preços:`, data.priceHistory ? {
      '24h': data.priceHistory['24h']?.length || 0,
      '7d': data.priceHistory['7d']?.length || 0,
      '30d': data.priceHistory['30d']?.length || 0,
      '365d': data.priceHistory['365d']?.length || 0,
    } : 'N/A');
    console.log(`[API] Chains: ${data.chains ? Object.keys(data.chains).length : 0}`);

    if (data.chains && Object.keys(data.chains).length > 0) {
      const topChains = Object.entries(data.chains)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
      console.log(`[API] Top 5 Chains:`);
      topChains.forEach(([chain, tvl]) => {
        console.log(`[API]   - ${chain}: $${(tvl / 1e9).toFixed(2)}B`);
      });
    }

    console.log(`[API] ---`);
    console.log(`[API] Fontes de Dados:`);
    if (aggregated.sources.defiLlama) {
      console.log(`[API]   - DefiLlama (${aggregated.sources.defiLlama.type})`);
      console.log(`[API]     URL: ${aggregated.sources.defiLlama.url}`);
      console.log(`[API]     API: ${aggregated.sources.defiLlama.apiUrl}`);
    }
    if (aggregated.sources.coinGecko) {
      console.log(`[API]   - CoinGecko`);
      console.log(`[API]     URL: ${aggregated.sources.coinGecko.url}`);
      console.log(`[API]     API: ${aggregated.sources.coinGecko.apiUrl}`);
    }
    if (aggregated.sources.scraped) {
      console.log(`[API]   - Web Scraping (fallback)`);
    }
    console.log(`[API] ==========================================\n`);

    // Análise de risco
    console.log(`[API] Calculando análise de risco...`);
    const riskAnalysis = calculateRedFlags(data);
    const riskScore = calculateRiskScore(
      riskAnalysis.flags.length,
      riskAnalysis.warnings.length,
      riskAnalysis.positives.length
    );

    console.log(`[API] ========== ANÁLISE DE RISCO ==========`);
    console.log(`[API] Score: ${riskScore.score}/100`);
    console.log(`[API] Classificação: ${riskScore.classification}`);
    console.log(`[API] Red Flags: ${riskAnalysis.flags.length}`);
    console.log(`[API] Warnings: ${riskAnalysis.warnings.length}`);
    console.log(`[API] Pontos Positivos: ${riskAnalysis.positives.length}`);
    console.log(`[API] ==========================================\n`);

    const report: AnalysisReport = {
      data,
      riskAnalysis,
      riskScore,
    };

    console.log(`[API] ✅ Análise concluída com sucesso!`);
    console.log(`[API] ========================================\n`);

    return NextResponse.json(report, { headers });
  } catch (error: any) {
    console.error('\n[API] ❌ ERRO FATAL:', error.message || error);
    console.error('[API] Stack:', error.stack);
    console.log('[API] ========================================\n');

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
