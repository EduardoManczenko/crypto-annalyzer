import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

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

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'CryptoAnalyzer/1.0',
  }
});

export interface SearchResult {
  id: string;
  name: string;
  symbol?: string;
  type: 'defi' | 'token' | 'blockchain';
  source: 'defillama' | 'coingecko';
  logo?: string;
}

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
      const defiResponse = await axiosInstance.get(API_ENDPOINTS.defillama.protocols);
      const protocols = defiResponse.data;

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
    } catch (error) {
      console.error('[Search] DeFiLlama error:', error);
    }

    // Buscar no CoinGecko - TODOS os resultados relevantes
    try {
      const coinResponse = await axiosInstance.get(API_ENDPOINTS.coingecko.search, {
        params: { query }
      });

      const coins = coinResponse.data.coins || [];

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
    } catch (error) {
      console.error('[Search] CoinGecko error:', error);
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

    return NextResponse.json({
      query,
      results: sortedResults.slice(0, 15), // Aumentar para 15 resultados
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
