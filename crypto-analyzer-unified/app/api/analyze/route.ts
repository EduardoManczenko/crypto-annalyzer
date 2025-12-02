import { NextRequest, NextResponse } from 'next/server';
import { CryptoData, AnalysisReport } from '@/types';
import { calculateRedFlags, calculateRiskScore } from '@/utils/analyzer';
import { aggregateData } from '@/lib/data-sources/data-aggregator';

// Configure runtime (nodejs for better compatibility)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


/**
 * Endpoint principal de análise
 * Agora usa o data-aggregator que tem toda lógica de scraping e fallback
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawQuery = searchParams.get('q');

  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  };

  if (!rawQuery) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400, headers }
    );
  }

  try {
    // Parse query to extract name and optional type
    // Format: "name|type" (e.g., "Polkadot|chain" or just "Polkadot")
    const [query, explicitType] = rawQuery.includes('|')
      ? rawQuery.split('|')
      : [rawQuery, undefined];

    console.log(`\n[API] ========== Analisando: ${query}${explicitType ? ` (tipo: ${explicitType})` : ''} ==========`);

    // Usar o data-aggregator que tem toda a lógica correta de extração de TVL,
    // scraping e fallbacks - agora com tipo explícito
    const aggregatedData = await aggregateData(query, explicitType as 'chain' | 'protocol' | 'token' | undefined);

    if (!aggregatedData) {
      console.log(`[API] Nenhum dado encontrado para: ${query}`);
      return NextResponse.json(
        { error: 'Nenhum dado encontrado. Verifique o nome e tente novamente.' },
        { status: 404, headers }
      );
    }

    // Converter AggregatedData para CryptoData
    const data: CryptoData = {
      name: aggregatedData.name,
      symbol: aggregatedData.symbol,
      logo: aggregatedData.logo,
      price: aggregatedData.price,
      marketCap: aggregatedData.marketCap,
      fdv: aggregatedData.fdv,
      volume24h: aggregatedData.volume24h,
      circulating: aggregatedData.circulating,
      total: aggregatedData.total,
      max: aggregatedData.max,
      tvl: aggregatedData.tvl,
      tvlChange: aggregatedData.tvlChange,
      priceChange: aggregatedData.priceChange,
      priceHistory: aggregatedData.priceHistory,
      chains: aggregatedData.chains,
      category: aggregatedData.category,
    };

    console.log(`[API] Dados consolidados:`, {
      name: data.name,
      symbol: data.symbol,
      price: data.price,
      marketCap: data.marketCap,
      tvl: data.tvl ? `$${(data.tvl / 1e9).toFixed(3)}B` : 'N/A',
      tvlChange: data.tvlChange,
      priceChange: data.priceChange,
      priceHistory: data.priceHistory ? {
        '24h': data.priceHistory['24h']?.length || 0,
        '7d': data.priceHistory['7d']?.length || 0,
        '30d': data.priceHistory['30d']?.length || 0,
        '365d': data.priceHistory['365d']?.length || 0,
      } : null,
      chains: data.chains ? Object.keys(data.chains).length : 0
    });

    // Análise de risco
    const riskAnalysis = calculateRedFlags(data);
    const riskScore = calculateRiskScore(
      riskAnalysis.flags.length,
      riskAnalysis.warnings.length,
      riskAnalysis.positives.length
    );

    console.log(`[API] Análise completa - Score: ${riskScore.score}, Flags: ${riskAnalysis.flags.length}, Warnings: ${riskAnalysis.warnings.length}, Positives: ${riskAnalysis.positives.length}`);

    const report: AnalysisReport = {
      data,
      riskAnalysis,
      riskScore,
    };

    console.log(`[API] ========== Sucesso: ${query} ==========\n`);
    return NextResponse.json(report, { headers });
  } catch (error: any) {
    console.error('[API] ERRO:', error.message || error);
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
