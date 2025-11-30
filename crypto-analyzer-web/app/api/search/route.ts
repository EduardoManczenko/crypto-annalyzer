import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_ENDPOINTS = {
  defillama: {
    protocols: 'https://api.llama.fi/protocols',
  },
  coingecko: {
    search: 'https://api.coingecko.com/api/v3/search',
  }
};

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://defillama.com/',
  'Origin': 'https://defillama.com',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

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
      console.log(`[Search Retry] Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

export interface SearchResult {
  id: string;
  name: string;
  symbol?: string;
  type: 'defi' | 'token' | 'blockchain';
  source: 'defillama' | 'coingecko';
  logo?: string;
}

// Fallback data - principais protocolos e chains
const FALLBACK_DATA: SearchResult[] = [
  // Blockchains
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', type: 'blockchain', source: 'defillama' },
  { id: 'bsc', name: 'BSC', symbol: 'BNB', type: 'blockchain', source: 'defillama' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'blockchain', source: 'defillama' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', type: 'blockchain', source: 'defillama' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', type: 'blockchain', source: 'defillama' },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', type: 'blockchain', source: 'defillama' },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM', type: 'blockchain', source: 'defillama' },
  { id: 'base', name: 'Base', symbol: 'BASE', type: 'blockchain', source: 'defillama' },
  { id: 'optimism', name: 'Optimism', symbol: 'OP', type: 'blockchain', source: 'defillama' },

  // Major DeFi Protocols
  { id: 'aave-v3', name: 'Aave V3', symbol: 'AAVE', type: 'defi', source: 'defillama' },
  { id: 'aave', name: 'Aave', symbol: 'AAVE', type: 'defi', source: 'defillama' },
  { id: 'uniswap', name: 'Uniswap', symbol: 'UNI', type: 'defi', source: 'defillama' },
  { id: 'curve', name: 'Curve', symbol: 'CRV', type: 'defi', source: 'defillama' },
  { id: 'lido', name: 'Lido', symbol: 'LDO', type: 'defi', source: 'defillama' },
  { id: 'pancakeswap', name: 'PancakeSwap', symbol: 'CAKE', type: 'defi', source: 'defillama' },
  { id: 'jupiter', name: 'Jupiter', symbol: 'JUP', type: 'defi', source: 'defillama' },
  { id: 'raydium', name: 'Raydium', symbol: 'RAY', type: 'defi', source: 'defillama' },
  { id: 'maker', name: 'MakerDAO', symbol: 'MKR', type: 'defi', source: 'defillama' },
  { id: 'compound', name: 'Compound', symbol: 'COMP', type: 'defi', source: 'defillama' },

  // Stellar ecosystem
  { id: 'stellar-dex', name: 'Stellar DEX', symbol: 'XLM', type: 'defi', source: 'defillama' },
  { id: 'aquarius-stellar', name: 'Aquarius Stellar', symbol: 'AQUA', type: 'defi', source: 'defillama' },
  { id: 'stellaris-finance', name: 'Stellaris Finance', symbol: 'STE', type: 'defi', source: 'defillama' },

  // Tokens
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'token', source: 'coingecko' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', type: 'token', source: 'coingecko' },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB', type: 'token', source: 'coingecko' },
  { id: 'ripple', name: 'XRP', symbol: 'XRP', type: 'token', source: 'coingecko' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'token', source: 'coingecko' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'token', source: 'coingecko' },
  { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX', type: 'token', source: 'coingecko' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', type: 'token', source: 'coingecko' },
  { id: 'matic-network', name: 'Polygon', symbol: 'MATIC', type: 'token', source: 'coingecko' },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM', type: 'token', source: 'coingecko' },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400, headers }
    );
  }

  try {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase().trim();

    // Buscar no DeFiLlama - TODOS os resultados relevantes
    try {
      console.log('[Search] Buscando no DeFiLlama...');
      const defiResponse = await retryRequest(async () => {
        const res = await fetch(API_ENDPOINTS.defillama.protocols, {
          headers: BROWSER_HEADERS,
          signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
      const protocols = defiResponse;
      console.log('[Search] DeFiLlama retornou', protocols.length, 'protocolos');

      // Buscar todos os matches (não limitar a 5)
      const defiMatches = protocols
        .filter((p: any) => {
          const nameLower = p.name.toLowerCase();
          const slugLower = p.slug.toLowerCase();

          // Match exato ou contém a query
          return nameLower.includes(queryLower) ||
                 slugLower.includes(queryLower) ||
                 (p.symbol && p.symbol.toLowerCase().includes(queryLower));
        })
        .map((p: any) => {
          // Determinar se é chain ou protocolo
          const isChain = p.category === 'Chain' ||
                         p.chains?.length === 0 ||
                         p.name.toLowerCase().includes('chain');

          return {
            id: p.slug,
            name: p.name,
            symbol: p.symbol || p.chain || undefined,
            type: isChain ? 'blockchain' as const : 'defi' as const,
            source: 'defillama' as const,
            logo: p.logo || undefined,
            category: p.category || undefined,
            tvl: p.tvl || undefined,
          };
        });

      results.push(...defiMatches);
      console.log('[Search] DeFiLlama matches:', defiMatches.length);
    } catch (error: any) {
      console.error('[Search] DeFiLlama error:', error.message || error);
    }

    // Buscar no CoinGecko - TODOS os resultados relevantes
    try {
      console.log('[Search] Buscando no CoinGecko...');
      const coinResponse = await retryRequest(async () => {
        const res = await fetch(`${API_ENDPOINTS.coingecko.search}?query=${encodeURIComponent(query)}`, {
          headers: BROWSER_HEADERS,
          signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });

      const coins = coinResponse.coins || [];
      console.log('[Search] CoinGecko retornou', coins.length, 'moedas');

      // Pegar mais resultados do CoinGecko também
      const coinMatches = coins
        .filter((c: any) => {
          const nameLower = c.name.toLowerCase();
          const symbolLower = c.symbol?.toLowerCase() || '';

          // Match mais flexível
          return nameLower.includes(queryLower) ||
                 symbolLower.includes(queryLower);
        })
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          symbol: c.symbol?.toUpperCase(),
          type: 'token' as const,
          source: 'coingecko' as const,
          logo: c.large || c.thumb || undefined,
          marketCapRank: c.market_cap_rank || undefined,
        }));

      results.push(...coinMatches);
      console.log('[Search] CoinGecko matches:', coinMatches.length);
    } catch (error: any) {
      console.error('[Search] CoinGecko error:', error.message || error);
    }

    // Se ambas as APIs falharam, usar fallback data
    if (results.length === 0) {
      console.log('[Search] Ambas APIs falharam, usando fallback data');
      const fallbackMatches = FALLBACK_DATA.filter(item => {
        const nameLower = item.name.toLowerCase();
        const symbolLower = item.symbol?.toLowerCase() || '';
        return nameLower.includes(queryLower) || symbolLower.includes(queryLower);
      });
      results.push(...fallbackMatches);
      console.log('[Search] Fallback matches:', fallbackMatches.length);
    }

    // Remover duplicatas mantendo prioridade (DeFiLlama > CoinGecko para protocols)
    const seenNames = new Set<string>();
    const uniqueResults = results.filter(item => {
      const nameLower = item.name.toLowerCase();
      if (seenNames.has(nameLower)) {
        return false;
      }
      seenNames.add(nameLower);
      return true;
    });

    // Ordenar resultados por relevância
    const sortedResults = uniqueResults.sort((a, b) => {
      const aNameLower = a.name.toLowerCase();
      const bNameLower = b.name.toLowerCase();

      // 1. Match exato tem prioridade máxima
      const aExact = aNameLower === queryLower;
      const bExact = bNameLower === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // 2. Match no início do nome
      const aStarts = aNameLower.startsWith(queryLower);
      const bStarts = bNameLower.startsWith(queryLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // 3. Priorizar blockchains
      if (a.type === 'blockchain' && b.type !== 'blockchain') return -1;
      if (a.type !== 'blockchain' && b.type === 'blockchain') return 1;

      // 4. Ordenar por TVL (para DeFi) ou Market Cap Rank (para tokens)
      if (a.type === 'defi' && b.type === 'defi') {
        const aTvl = (a as any).tvl || 0;
        const bTvl = (b as any).tvl || 0;
        return bTvl - aTvl;
      }

      if (a.type === 'token' && b.type === 'token') {
        const aRank = (a as any).marketCapRank || 9999;
        const bRank = (b as any).marketCapRank || 9999;
        return aRank - bRank;
      }

      return 0;
    });

    const finalResults = sortedResults.slice(0, 15);
    console.log('[Search] Retornando', finalResults.length, 'resultados finais para query:', query);
    console.log('[Search] Primeiros 3 resultados:', finalResults.slice(0, 3).map(r => `${r.name} (${r.type})`));

    return NextResponse.json({
      query,
      results: finalResults,
      total: sortedResults.length
    }, { headers });
  } catch (error: any) {
    console.error('[Search] Error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500, headers }
    );
  }
}

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
