import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { CryptoData, AnalysisReport } from '@/types';
import { calculateRedFlags, calculateRiskScore } from '@/utils/analyzer';

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

async function searchDeFiLlama(query: string) {
  try {
    const response = await axios.get(API_ENDPOINTS.defillama.protocols);
    const protocols = response.data;

    const found = protocols.find((p: any) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.slug.toLowerCase() === query.toLowerCase()
    );

    if (found) {
      const detailResponse = await axios.get(API_ENDPOINTS.defillama.protocol(found.slug));
      return detailResponse.data;
    }

    return null;
  } catch (error) {
    console.error('Error searching DeFiLlama:', error);
    return null;
  }
}

async function searchCoinGecko(query: string) {
  try {
    const searchResponse = await axios.get(API_ENDPOINTS.coingecko.search, {
      params: { query }
    });

    const coin = searchResponse.data.coins[0];
    if (!coin) {
      return null;
    }

    const coinResponse = await axios.get(API_ENDPOINTS.coingecko.coin(coin.id));
    return coinResponse.data;
  } catch (error) {
    console.error('Error searching CoinGecko:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    // Buscar em paralelo
    const [defiData, coinData] = await Promise.all([
      searchDeFiLlama(query),
      searchCoinGecko(query)
    ]);

    if (!defiData && !coinData) {
      return NextResponse.json(
        { error: 'No data found for the given query' },
        { status: 404 }
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

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
