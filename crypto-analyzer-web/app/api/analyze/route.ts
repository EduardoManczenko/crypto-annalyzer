import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { CryptoData, AnalysisReport, DataSource } from '@/types';
import { calculateRedFlags, calculateRiskScore } from '@/utils/analyzer';

// Configure runtime (nodejs for better compatibility)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_ENDPOINTS = {
  defillama: {
    protocols: 'https://api.llama.fi/protocols',
    protocol: (slug: string) => `https://api.llama.fi/protocol/${slug}`,
    tvl: (protocol: string) => `https://api.llama.fi/tvl/${protocol}`,
  },
  coingecko: {
    search: 'https://api.coingecko.com/api/v3/search',
    coin: (id: string) => `https://api.coingecko.com/api/v3/coins/${id}`,
  }
};

// Configurar axios com timeout e retry
const axiosInstance = axios.create({
  timeout: 15000, // 15 segundos
  headers: {
    'User-Agent': 'CryptoAnalyzer/1.0',
  }
});

// Função de retry com backoff exponencial
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error: any) {
      const isLastAttempt = i === maxRetries - 1;
      if (isLastAttempt) {
        throw error;
      }
      const delay = initialDelay * Math.pow(2, i);
      console.log(`[Retry] Tentativa ${i + 1} falhou. Tentando novamente em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// Função para calcular TVL total correto do DeFiLlama
function calculateTotalTVL(defiData: any): number | null {
  try {
    // Prioridade 1: Usar currentChainTvls (mais recente e preciso)
    if (defiData.currentChainTvls) {
      const chainTvls = defiData.currentChainTvls;
      let total = 0;

      for (const [chain, value] of Object.entries(chainTvls)) {
        const chainLower = chain.toLowerCase();
        // Excluir chains que não são TVL real
        if (!chainLower.includes('borrowed') &&
            !chainLower.includes('staking') &&
            !chainLower.includes('pool2') &&
            !chainLower.includes('offers') &&
            !chainLower.includes('treasury')) {
          total += (value as number) || 0;
        }
      }

      console.log(`[TVL] Calculado via currentChainTvls: $${total.toFixed(2)}`);
      return total > 0 ? total : null;
    }

    // Prioridade 2: Usar chainTvls (fallback)
    if (defiData.chainTvls) {
      const chainTvls = defiData.chainTvls;
      let total = 0;

      for (const [chain, value] of Object.entries(chainTvls)) {
        const chainLower = chain.toLowerCase();
        // Excluir chains que não são TVL real
        if (!chainLower.includes('borrowed') &&
            !chainLower.includes('staking') &&
            !chainLower.includes('pool2') &&
            !chainLower.includes('offers') &&
            !chainLower.includes('treasury')) {
          total += (value as number) || 0;
        }
      }

      console.log(`[TVL] Calculado via chainTvls: $${total.toFixed(2)}`);
      return total > 0 ? total : null;
    }

    // Prioridade 3: Usar tvl direto (último recurso)
    if (defiData.tvl && Array.isArray(defiData.tvl) && defiData.tvl.length > 0) {
      const tvlValue = defiData.tvl[defiData.tvl.length - 1]?.totalLiquidityUSD;
      console.log(`[TVL] Usando tvl array: $${tvlValue?.toFixed(2) || 'N/A'}`);
      return tvlValue || null;
    }

    console.log('[TVL] Nenhum dado de TVL encontrado');
    return null;
  } catch (error) {
    console.error('[TVL] Erro ao calcular TVL:', error);
    return null;
  }
}

async function searchDeFiLlama(query: string) {
  try {
    console.log(`[DeFiLlama] Buscando protocolos...`);

    const response = await retryRequest(() =>
      axiosInstance.get(API_ENDPOINTS.defillama.protocols, {
        timeout: 10000
      })
    );

    const protocols = response.data;
    console.log(`[DeFiLlama] ${protocols.length} protocolos encontrados`);

    // Buscar correspondências exatas e parciais
    const exactMatch = protocols.find((p: any) =>
      p.slug.toLowerCase() === query.toLowerCase() ||
      p.name.toLowerCase() === query.toLowerCase()
    );

    const partialMatch = protocols.find((p: any) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    const found = exactMatch || partialMatch;

    if (found) {
      console.log(`[DeFiLlama] Protocolo encontrado: ${found.name} (${found.slug})`);

      const detailResponse = await retryRequest(() =>
        axiosInstance.get(
          API_ENDPOINTS.defillama.protocol(found.slug),
          { timeout: 10000 }
        )
      );

      const defiData = detailResponse.data;

      // Calcular TVL total correto
      const totalTVL = calculateTotalTVL(defiData);

      // Log detalhado para debug
      console.log(`[DeFiLlama] Dados obtidos:`, {
        name: defiData.name,
        tvl: totalTVL,
        chains: defiData.currentChainTvls || defiData.chainTvls
      });

      return {
        ...defiData,
        calculatedTVL: totalTVL // Adicionar TVL calculado
      };
    }

    console.log(`[DeFiLlama] Nenhum protocolo encontrado para: ${query}`);
    return null;
  } catch (error: any) {
    console.error('[DeFiLlama] Error searching:', error.message);
    return null;
  }
}

async function searchCoinGecko(query: string) {
  try {
    console.log(`[CoinGecko] Buscando: ${query}`);

    const searchResponse = await retryRequest(() =>
      axiosInstance.get(API_ENDPOINTS.coingecko.search, {
        params: { query },
        timeout: 10000
      })
    );

    const coins = searchResponse.data.coins;
    if (!coins || coins.length === 0) {
      console.log(`[CoinGecko] Nenhuma moeda encontrada para: ${query}`);
      return null;
    }

    const coin = coins[0];
    console.log(`[CoinGecko] Moeda encontrada: ${coin.name} (${coin.id})`);

    const coinResponse = await retryRequest(() =>
      axiosInstance.get(
        API_ENDPOINTS.coingecko.coin(coin.id),
        { timeout: 10000 }
      )
    );

    console.log(`[CoinGecko] Dados obtidos para: ${coin.name}`);
    return coinResponse.data;
  } catch (error: any) {
    console.error('[CoinGecko] Error searching:', error.message);
    return null;
  }
}

// Função de validação tripla dos dados
function validateData(data: CryptoData): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  // Campos críticos que devem existir
  if (!data.name || data.name === 'N/A') missingFields.push('name');
  if (!data.symbol || data.symbol === 'N/A') missingFields.push('symbol');

  // Pelo menos um conjunto de dados deve existir
  const hasPriceData = data.price !== null || data.marketCap !== null;
  const hasTVLData = data.tvl !== null;
  const hasSupplyData = data.circulating !== null || data.total !== null;

  if (!hasPriceData && !hasTVLData && !hasSupplyData) {
    missingFields.push('price_or_tvl_or_supply_data');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
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
    console.log(`\n========== [API] Analyzing: ${query} ==========`);

    // Buscar em paralelo com timeout
    const [defiData, coinData] = await Promise.race([
      Promise.all([
        searchDeFiLlama(query),
        searchCoinGecko(query)
      ]),
      new Promise<[null, null]>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 25000)
      )
    ]);

    console.log(`\n[API] ===== RESULTADOS DA BUSCA =====`);
    console.log(`[API] DeFi encontrado: ${!!defiData}`);
    console.log(`[API] Coin encontrado: ${!!coinData}`);

    if (!defiData && !coinData) {
      console.log(`[API] ❌ Nenhum dado encontrado para: ${query}`);
      return NextResponse.json(
        { error: 'No data found for the given query' },
        { status: 404, headers }
      );
    }

    // Consolidar dados com prioridade para DeFiLlama no TVL
    const tvlValue = defiData?.calculatedTVL || null;
    const chainsData = defiData?.currentChainTvls || defiData?.chainTvls || null;

    // Filtrar chains para remover dados não-TVL
    let filteredChains: Record<string, number> | null = null;
    if (chainsData) {
      filteredChains = {};
      for (const [chain, value] of Object.entries(chainsData)) {
        const chainLower = chain.toLowerCase();
        if (!chainLower.includes('borrowed') &&
            !chainLower.includes('staking') &&
            !chainLower.includes('pool2') &&
            !chainLower.includes('offers') &&
            !chainLower.includes('treasury')) {
          filteredChains[chain] = value as number;
        }
      }
    }

    // Construir metadados de fontes
    const sources: DataSource[] = [];

    if (coinData?.name) {
      sources.push({ field: 'name', source: 'coingecko', url: `https://www.coingecko.com/en/coins/${coinData.id}` });
    } else if (defiData?.name) {
      sources.push({ field: 'name', source: 'defillama', url: `https://defillama.com/protocol/${defiData.slug}` });
    }

    if (coinData?.market_data?.current_price?.usd) {
      sources.push({ field: 'price', source: 'coingecko', url: `https://www.coingecko.com/en/coins/${coinData.id}` });
    }

    if (coinData?.market_data?.market_cap?.usd) {
      sources.push({ field: 'marketCap', source: 'coingecko', url: `https://www.coingecko.com/en/coins/${coinData.id}` });
    } else if (defiData?.mcap) {
      sources.push({ field: 'marketCap', source: 'defillama', url: `https://defillama.com/protocol/${defiData.slug}` });
    }

    if (coinData?.market_data?.fully_diluted_valuation?.usd) {
      sources.push({ field: 'fdv', source: 'coingecko', url: `https://www.coingecko.com/en/coins/${coinData.id}` });
    }

    if (coinData?.market_data?.total_volume?.usd) {
      sources.push({ field: 'volume24h', source: 'coingecko', url: `https://www.coingecko.com/en/coins/${coinData.id}` });
    }

    if (coinData?.market_data?.circulating_supply) {
      sources.push({ field: 'circulating', source: 'coingecko', url: `https://www.coingecko.com/en/coins/${coinData.id}` });
    }

    if (coinData?.market_data?.total_supply) {
      sources.push({ field: 'total', source: 'coingecko', url: `https://www.coingecko.com/en/coins/${coinData.id}` });
    }

    if (coinData?.market_data?.max_supply) {
      sources.push({ field: 'max', source: 'coingecko', url: `https://www.coingecko.com/en/coins/${coinData.id}` });
    }

    if (tvlValue) {
      sources.push({ field: 'tvl', source: 'defillama', url: `https://defillama.com/protocol/${defiData?.slug}` });
    }

    if (defiData) {
      sources.push({ field: 'tvlChange', source: 'defillama', url: `https://defillama.com/protocol/${defiData.slug}` });
    }

    if (coinData) {
      sources.push({ field: 'priceChange', source: 'coingecko', url: `https://www.coingecko.com/en/coins/${coinData.id}` });
    }

    if (filteredChains) {
      sources.push({ field: 'chains', source: 'defillama', url: `https://defillama.com/protocol/${defiData?.slug}` });
    }

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
      tvl: tvlValue,
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
      chains: filteredChains,
      category: defiData?.category || coinData?.categories?.[0] || 'N/A',
      sources, // Adicionar fontes
    };

    console.log(`\n[API] ===== TRIPLE-CHECK VALIDAÇÃO =====`);
    console.log(`[API] Verificando integridade dos dados...`);

    // TRIPLE-CHECK: Validar dados
    const validation = validateData(data);

    console.log(`[API] Validação: ${validation.isValid ? '✅ PASSOU' : '❌ FALHOU'}`);
    if (!validation.isValid) {
      console.log(`[API] Campos faltando: ${validation.missingFields.join(', ')}`);
    }

    console.log(`\n[API] ===== DADOS CONSOLIDADOS =====`);
    console.log(`[API] Nome: ${data.name}`);
    console.log(`[API] Símbolo: ${data.symbol}`);
    console.log(`[API] Preço: ${data.price ? `$${data.price.toFixed(2)}` : 'N/A'}`);
    console.log(`[API] Market Cap: ${data.marketCap ? `$${data.marketCap.toFixed(2)}` : 'N/A'}`);
    console.log(`[API] TVL: ${data.tvl ? `$${data.tvl.toFixed(2)}` : 'N/A'}`);
    console.log(`[API] Chains: ${data.chains ? Object.keys(data.chains).length + ' chains' : 'N/A'}`);

    // Análise de risco
    const riskAnalysis = calculateRedFlags(data);
    const riskScore = calculateRiskScore(
      riskAnalysis.flags.length,
      riskAnalysis.warnings.length,
      riskAnalysis.positives.length
    );

    console.log(`\n[API] ===== ANÁLISE DE RISCO =====`);
    console.log(`[API] Red Flags: ${riskAnalysis.flags.length}`);
    console.log(`[API] Warnings: ${riskAnalysis.warnings.length}`);
    console.log(`[API] Positivos: ${riskAnalysis.positives.length}`);
    console.log(`[API] Score: ${riskScore.score}/100 - ${riskScore.classification}`);

    const report: AnalysisReport = {
      data,
      riskAnalysis,
      riskScore,
    };

    console.log(`\n[API] ✅ Análise concluída com sucesso para: ${query}`);
    console.log(`========== FIM DA ANÁLISE ==========\n`);

    return NextResponse.json(report, { headers });
  } catch (error: any) {
    console.error('\n[API] ❌ Error processing request:', error.message || error);
    console.error('[API] Stack:', error.stack);
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
