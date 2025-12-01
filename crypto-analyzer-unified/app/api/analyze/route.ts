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
    marketChart: (id: string, days: number) =>
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
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
 * Helper: Extrai mudanças de TVL
 */
function extractTVLChanges(defiData: any) {
  if (!defiData) {
    return {
      '1d': null,
      '7d': null,
      '30d': null,
      '365d': null,
    };
  }

  console.log('[TVL Changes] Buscando dados de mudança...');
  console.log('[TVL Changes] change_1d:', defiData.change_1d);
  console.log('[TVL Changes] change_7d:', defiData.change_7d);
  console.log('[TVL Changes] change_1m:', defiData.change_1m);

  // Verificar se há dados no array tvl para calcular mudanças manualmente
  if (defiData.tvl && Array.isArray(defiData.tvl) && defiData.tvl.length > 1) {
    const currentTvl = defiData.tvl[defiData.tvl.length - 1]?.totalLiquidityUSD;

    if (currentTvl) {
      // Tentar calcular mudanças a partir do histórico
      const now = Date.now() / 1000;
      const oneDayAgo = now - 86400;
      const sevenDaysAgo = now - 7 * 86400;
      const thirtyDaysAgo = now - 30 * 86400;

      const findClosestTvl = (targetTime: number) => {
        let closest = null;
        let minDiff = Infinity;

        for (const item of defiData.tvl) {
          const diff = Math.abs(item.date - targetTime);
          if (diff < minDiff) {
            minDiff = diff;
            closest = item;
          }
        }

        return closest?.totalLiquidityUSD;
      };

      const tvl1d = findClosestTvl(oneDayAgo);
      const tvl7d = findClosestTvl(sevenDaysAgo);
      const tvl30d = findClosestTvl(thirtyDaysAgo);

      const calculate = (oldTvl: number | null) => {
        if (!oldTvl || oldTvl === 0) return null;
        return ((currentTvl - oldTvl) / oldTvl) * 100;
      };

      const calculated = {
        '1d': defiData.change_1d ?? calculate(tvl1d),
        '7d': defiData.change_7d ?? calculate(tvl7d),
        '30d': defiData.change_1m ?? calculate(tvl30d),
        '365d': null, // DeFiLlama não fornece
      };

      console.log('[TVL Changes] Valores calculados:', calculated);
      return calculated;
    }
  }

  // Fallback para valores diretos da API
  return {
    '1d': defiData.change_1d ?? null,
    '7d': defiData.change_7d ?? null,
    '30d': defiData.change_1m ?? null,
    '365d': null,
  };
}

/**
 * Helper: Extrai chainTvls filtrados (sem borrowed, staking, pool2)
 */
function extractChainTvls(defiData: any): Record<string, number> | null {
  if (!defiData) return null;

  // Tentar pegar de currentChainTvls primeiro (dados mais recentes)
  const chainTvls = defiData.currentChainTvls || defiData.chainTvls;

  if (!chainTvls || typeof chainTvls !== 'object') {
    return null;
  }

  // Filtrar apenas chains "puras" (sem sufixos -borrowed, -staking, -pool2)
  // e excluir agregados (staking, pool2, borrowed)
  const filteredChains: Record<string, number> = {};

  Object.entries(chainTvls).forEach(([chain, value]) => {
    // Ignorar se não for número ou se for um array (histórico)
    if (typeof value !== 'number') return;

    // Ignorar chains com sufixos especiais
    if (chain.includes('-borrowed') ||
        chain.includes('-staking') ||
        chain.includes('-pool2')) {
      return;
    }

    // Ignorar agregados globais
    if (chain === 'staking' ||
        chain === 'pool2' ||
        chain === 'borrowed') {
      return;
    }

    filteredChains[chain] = value;
  });

  return Object.keys(filteredChains).length > 0 ? filteredChains : null;
}

/**
 * Helper: Calcula o TVL total a partir dos dados do DeFiLlama
 * IMPORTANTE: DeFiLlama usa o campo 'tvl' direto do último snapshot.
 * Este é o valor que aparece no site oficial deles.
 */
function extractTVL(defiData: any): number | null {
  if (!defiData) return null;

  // MÉTODO 1 (PREFERIDO): TVL do último item do array tvl
  // Este é o método oficial do DeFiLlama - valor exato que aparece no site
  if (defiData.tvl && Array.isArray(defiData.tvl) && defiData.tvl.length > 0) {
    const lastTvl = defiData.tvl[defiData.tvl.length - 1];
    if (lastTvl?.totalLiquidityUSD) {
      console.log('[TVL] ✓ Extraído do array tvl (método oficial DeFiLlama):', lastTvl.totalLiquidityUSD);
      return lastTvl.totalLiquidityUSD;
    }
  }

  // MÉTODO 2: TVL direto como número
  if (defiData.tvl && typeof defiData.tvl === 'number') {
    console.log('[TVL] ✓ Valor direto:', defiData.tvl);
    return defiData.tvl;
  }

  // MÉTODO 3 (FALLBACK): Somar chains filtradas (SEM -borrowed, -staking, -pool2)
  const chains = extractChainTvls(defiData);
  if (chains) {
    const totalTvl = Object.values(chains).reduce((sum, tvl) => sum + tvl, 0);

    if (totalTvl > 0) {
      console.log('[TVL] ⚠ Calculado somando chains filtradas (fallback):', totalTvl);
      console.log('[TVL] Chains incluídas:', Object.keys(chains).length);
      console.log('[TVL] Top 5 chains:',
        Object.entries(chains)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, tvl]) => `${name}: $${(tvl / 1e9).toFixed(2)}B`)
          .join(', ')
      );
      return totalTvl;
    }
  }

  console.log('[TVL] ✗ Nenhum TVL encontrado');
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

      // Log detalhado dos dados recebidos
      const data = detailResponse.data;
      console.log('[DeFiLlama] Campos disponíveis:', Object.keys(data).join(', '));
      console.log('[DeFiLlama] TVL direto:', data.tvl);
      console.log('[DeFiLlama] Mudanças de TVL:', {
        change_1d: data.change_1d,
        change_7d: data.change_7d,
        change_1m: data.change_1m,
      });

      if (data.currentChainTvls) {
        const chainKeys = Object.keys(data.currentChainTvls);
        console.log('[DeFiLlama] currentChainTvls keys:', chainKeys.length, 'chains');
        console.log('[DeFiLlama] Sample chains:', chainKeys.slice(0, 10).join(', '));

        // Calcular soma total incluindo TUDO
        const totalAll = Object.entries(data.currentChainTvls)
          .filter(([, v]) => typeof v === 'number')
          .reduce((sum, [, v]) => sum + (v as number), 0);
        console.log('[DeFiLlama] Soma TOTAL (incluindo tudo):', totalAll);

        // Calcular soma SEM borrowed/staking/pool2
        const totalFiltered = Object.entries(data.currentChainTvls)
          .filter(([k, v]) => {
            if (typeof v !== 'number') return false;
            if (k.includes('-borrowed') || k.includes('-staking') || k.includes('-pool2')) return false;
            if (k === 'staking' || k === 'pool2' || k === 'borrowed') return false;
            return true;
          })
          .reduce((sum, [, v]) => sum + (v as number), 0);
        console.log('[DeFiLlama] Soma FILTRADA (sem borrowed/staking/pool2):', totalFiltered);
      }

      return data;
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

    // Retornar dados com o ID para uso posterior
    return {
      ...coinResponse.data,
      _coinId: coin.id
    };
  } catch (error: any) {
    console.error('[CoinGecko] Erro:', error.message);
    return null;
  }
}

/**
 * Busca histórico de preços no CoinGecko
 */
async function fetchPriceHistory(coinId: string) {
  console.log(`[CoinGecko] Buscando histórico de preços para: ${coinId}`);

  // Formatar dados para o formato esperado
  const formatPrices = (prices: any[]) =>
    prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price
    }));

  // Buscar cada período individualmente para que falha em um não afete os outros
  const fetchPeriod = async (days: number, label: string) => {
    try {
      console.log(`[CoinGecko] Buscando ${label}...`);
      const response = await axiosInstance.get(
        API_ENDPOINTS.coingecko.marketChart(coinId, days),
        { timeout: 10000 }
      );
      const formatted = formatPrices(response.data.prices || []);
      console.log(`[CoinGecko] ${label} obtido: ${formatted.length} pontos`);
      return formatted;
    } catch (error: any) {
      console.error(`[CoinGecko] Erro ao buscar ${label}:`, error.message);
      return [];
    }
  };

  // Buscar todos os períodos em paralelo, mas com tratamento individual de erros
  const [data24h, data7d, data30d, data365d] = await Promise.all([
    fetchPeriod(1, '24h'),
    fetchPeriod(7, '7d'),
    fetchPeriod(30, '30d'),
    fetchPeriod(365, '365d'),
  ]);

  // Retornar null apenas se NENHUM dado foi obtido
  const hasAnyData = data24h.length > 0 || data7d.length > 0 || data30d.length > 0 || data365d.length > 0;

  if (!hasAnyData) {
    console.log('[CoinGecko] Nenhum histórico de preços disponível');
    return null;
  }

  return {
    '24h': data24h,
    '7d': data7d,
    '30d': data30d,
    '365d': data365d,
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

    // Buscar histórico de preços se temos dados do CoinGecko
    let priceHistory = null;
    if (coinData?._coinId) {
      priceHistory = await fetchPriceHistory(coinData._coinId);
      console.log(`[API] Histórico de preços obtido:`, {
        '24h': priceHistory?.['24h']?.length || 0,
        '7d': priceHistory?.['7d']?.length || 0,
        '30d': priceHistory?.['30d']?.length || 0,
        '365d': priceHistory?.['365d']?.length || 0,
      });
    }

    // Extrair TVL e chains corretamente
    const tvl = extractTVL(defiData);
    const chains = extractChainTvls(defiData);
    const tvlChange = extractTVLChanges(defiData);

    // Consolidar dados
    const data: CryptoData = {
      name: coinData?.name || defiData?.name || 'N/A',
      symbol: coinData?.symbol?.toUpperCase() || defiData?.symbol?.toUpperCase() || 'N/A',
      logo: coinData?.image?.large || coinData?.image?.small || defiData?.logo || undefined,
      price: coinData?.market_data?.current_price?.usd || null,
      marketCap: coinData?.market_data?.market_cap?.usd || defiData?.mcap || null,
      fdv: coinData?.market_data?.fully_diluted_valuation?.usd || null,
      volume24h: coinData?.market_data?.total_volume?.usd || null,
      circulating: coinData?.market_data?.circulating_supply || null,
      total: coinData?.market_data?.total_supply || null,
      max: coinData?.market_data?.max_supply || null,
      tvl,
      tvlChange,
      priceChange: {
        '24h': coinData?.market_data?.price_change_percentage_24h || null,
        '7d': coinData?.market_data?.price_change_percentage_7d || null,
        '30d': coinData?.market_data?.price_change_percentage_30d || null,
        '365d': coinData?.market_data?.price_change_percentage_1y || null,
      },
      priceHistory: priceHistory || undefined,
      chains,
      category: defiData?.category || coinData?.categories?.[0] || 'N/A',
    };

    console.log(`[API] Dados consolidados:`, {
      name: data.name,
      symbol: data.symbol,
      price: data.price,
      marketCap: data.marketCap,
      tvl: data.tvl,
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
