import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { CryptoData, AnalysisReport } from '@/types';
import { calculateRedFlags, calculateRiskScore } from '@/utils/analyzer';

// Configure runtime (nodejs for better compatibility)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_ENDPOINTS = {
  defillama: {
    protocols: 'https://api.llama.fi/protocols',
    protocol: (slug: string) => `https://api.llama.fi/protocol/${slug}`,
  },
  coingecko: {
    search: 'https://api.coingecko.com/api/v3/search',
    coin: (id: string) => `https://api.coingecko.com/api/v3/coins/${id}`,
  }
};

// Configurar axios com timeout
const axiosInstance = axios.create({
  timeout: 15000, // 15 segundos
  headers: {
    'User-Agent': 'CryptoAnalyzer/1.0',
  }
});

async function searchDeFiLlama(query: string) {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.defillama.protocols, {
      timeout: 10000
    });
    const protocols = response.data;

    const found = protocols.find((p: any) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.slug.toLowerCase() === query.toLowerCase()
    );

    if (found) {
      const detailResponse = await axiosInstance.get(
        API_ENDPOINTS.defillama.protocol(found.slug),
        { timeout: 10000 }
      );
      return detailResponse.data;
    }

    return null;
  } catch (error: any) {
    console.error('Error searching DeFiLlama:', error.message);
    return null;
  }
}

async function searchCoinGecko(query: string) {
  try {
    const searchResponse = await axiosInstance.get(API_ENDPOINTS.coingecko.search, {
      params: { query },
      timeout: 10000
    });

    const coin = searchResponse.data.coins[0];
    if (!coin) {
      return null;
    }

    const coinResponse = await axiosInstance.get(
      API_ENDPOINTS.coingecko.coin(coin.id),
      { timeout: 10000 }
    );
    return coinResponse.data;
  } catch (error: any) {
    console.error('Error searching CoinGecko:', error.message);
    return null;
  }
}

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
    console.log(`[API] Analyzing: ${query}`);

    // Buscar em paralelo com timeout
    const [defiData, coinData] = await Promise.race([
      Promise.all([
        searchDeFiLlama(query),
        searchCoinGecko(query)
      ]),
      new Promise<[null, null]>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 20000)
      )
    ]);

    console.log(`[API] Results - DeFi: ${!!defiData}, Coin: ${!!coinData}`);

    if (!defiData && !coinData) {
      return NextResponse.json(
        { error: 'No data found for the given query' },
        { status: 404, headers }
      );
    }

    // Consolidar dados
    const data: CryptoData = {
      name: coinData?.name || defiData?.name || 'N/A',
      symbol: coinData?.symbol?.toUpperCase() || defiData?.symbol?.toUpperCase() || 'N/A',
      price: coinData?.market_data?.current_price?.usd || null,
      marketCap: coinData?.market_data?.market_cap?.usd || defiData?.mcap || null,
      fdv: coinData?.market_data?.fully_diluted_valuation?.usd || null,
      volume24h: coinData?.market_data?.total_volume?.usd || null,
      circulating: coinData?.market_data?.circulating_supply || null,
      total: coinData?.market_data?.total_supply || null,
      max: coinData?.market_data?.max_supply || null,
      tvl: defiData?.tvl?.[defiData.tvl.length - 1]?.totalLiquidityUSD || defiData?.chainTvls?.['Ethereum'] || null,
      tvlChange: {
        '1d': defiData?.change_1d || null,
        '7d': defiData?.change_7d || null,
        '30d': defiData?.change_1m || null,
      },
      priceChange: {
        '24h': coinData?.market_data?.price_change_percentage_24h || null,
        '7d': coinData?.market_data?.price_change_percentage_7d || null,
        '30d': coinData?.market_data?.price_change_percentage_30d || null,
      },
      chains: defiData?.chainTvls || null,
      category: defiData?.category || coinData?.categories?.[0] || 'N/A',
    };

    // Análise de risco
    const riskAnalysis = calculateRedFlags(data);
    const riskScore = calculateRiskScore(
      riskAnalysis.flags.length,
      riskAnalysis.warnings.length,
      riskAnalysis.positives.length
    );

    const report: AnalysisReport = {
      data,
      riskAnalysis,
      riskScore,
    };

    console.log(`[API] Success for: ${query}`);
    return NextResponse.json(report, { headers });
  } catch (error: any) {
    console.error('[API] Error processing request:', error.message || error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message || 'Unknown error'
      },
      { status: 500, headers }
    );
  }
}

// Handle OPTIONS for CORS
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
