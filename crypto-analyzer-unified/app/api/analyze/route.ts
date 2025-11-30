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
  timeout: 15000,
  headers: {
    'User-Agent': 'CryptoAnalyzer/1.0',
  }
});

/**
 * Helper: Calcula o TVL total a partir dos dados do DeFiLlama
 */
function extractTVL(defiData: any): number | null {
  if (!defiData) return null;

  // Método 1: TVL do último item do array tvl
  if (defiData.tvl && Array.isArray(defiData.tvl) && defiData.tvl.length > 0) {
    const lastTvl = defiData.tvl[defiData.tvl.length - 1];
    if (lastTvl?.totalLiquidityUSD) {
      console.log('[TVL] Extraído do array tvl:', lastTvl.totalLiquidityUSD);
      return lastTvl.totalLiquidityUSD;
    }
  }

  // Método 2: Somar todos os chainTvls
  if (defiData.chainTvls && typeof defiData.chainTvls === 'object') {
    const totalTvl = Object.values(defiData.chainTvls).reduce((sum: number, tvl: any) => {
      return sum + (typeof tvl === 'number' ? tvl : 0);
    }, 0);

    if (totalTvl > 0) {
      console.log('[TVL] Calculado somando chainTvls:', totalTvl);
      console.log('[TVL] Chains:', Object.keys(defiData.chainTvls).length);
      return totalTvl;
    }
  }

  // Método 3: TVL direto (alguns protocolos podem ter)
  if (defiData.tvl && typeof defiData.tvl === 'number') {
    console.log('[TVL] Valor direto:', defiData.tvl);
    return defiData.tvl;
  }

  console.log('[TVL] Nenhum TVL encontrado');
  return null;
}

/**
 * Busca protocolo no DeFiLlama
 */
async function searchDeFiLlama(query: string) {
  try {
    console.log(`[DeFiLlama] Buscando protocolos...`);
    const response = await axiosInstance.get(API_ENDPOINTS.defillama.protocols, {
      timeout: 10000
    });
    const protocols = response.data;
    console.log(`[DeFiLlama] Total de protocolos: ${protocols.length}`);

    const found = protocols.find((p: any) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.slug.toLowerCase() === query.toLowerCase()
    );

    if (found) {
      console.log(`[DeFiLlama] Protocolo encontrado: ${found.name} (${found.slug})`);
      const detailResponse = await axiosInstance.get(
        API_ENDPOINTS.defillama.protocol(found.slug),
        { timeout: 10000 }
      );
      console.log(`[DeFiLlama] Detalhes obtidos para ${found.slug}`);
      return detailResponse.data;
    }

    console.log(`[DeFiLlama] Protocolo não encontrado para: ${query}`);
    return null;
  } catch (error: any) {
    console.error('[DeFiLlama] Erro:', error.message);
    return null;
  }
}

/**
 * Busca token no CoinGecko
 */
async function searchCoinGecko(query: string) {
  try {
    console.log(`[CoinGecko] Buscando: ${query}`);
    const searchResponse = await axiosInstance.get(API_ENDPOINTS.coingecko.search, {
      params: { query },
      timeout: 10000
    });

    const coin = searchResponse.data.coins[0];
    if (!coin) {
      console.log(`[CoinGecko] Nenhuma moeda encontrada para: ${query}`);
      return null;
    }

    console.log(`[CoinGecko] Moeda encontrada: ${coin.name} (${coin.id})`);
    const coinResponse = await axiosInstance.get(
      API_ENDPOINTS.coingecko.coin(coin.id),
      { timeout: 10000 }
    );
    console.log(`[CoinGecko] Dados obtidos para ${coin.id}`);
    return coinResponse.data;
  } catch (error: any) {
    console.error('[CoinGecko] Erro:', error.message);
    return null;
  }
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
    console.log(`\n[API] ========== Analisando: ${query} ==========`);

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

    console.log(`[API] Resultados - DeFi: ${!!defiData}, Coin: ${!!coinData}`);

    if (!defiData && !coinData) {
      console.log(`[API] Nenhum dado encontrado para: ${query}`);
      return NextResponse.json(
        { error: 'Nenhum dado encontrado. Verifique o nome e tente novamente.' },
        { status: 404, headers }
      );
    }

    // Extrair TVL corretamente
    const tvl = extractTVL(defiData);

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
      tvl,
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

    console.log(`[API] Dados consolidados:`, {
      name: data.name,
      symbol: data.symbol,
      price: data.price,
      marketCap: data.marketCap,
      tvl: data.tvl,
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
