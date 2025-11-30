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

    // Buscar no DeFiLlama
    try {
      const defiResponse = await axiosInstance.get(API_ENDPOINTS.defillama.protocols);
      const protocols = defiResponse.data;

      const defiMatches = protocols
        .filter((p: any) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.slug.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
        .map((p: any) => ({
          id: p.slug,
          name: p.name,
          symbol: p.symbol || undefined,
          type: 'defi' as const,
          source: 'defillama' as const,
          logo: p.logo || undefined,
        }));

      results.push(...defiMatches);
    } catch (error) {
      console.error('[Search] DeFiLlama error:', error);
    }

    // Buscar no CoinGecko
    try {
      const coinResponse = await axiosInstance.get(API_ENDPOINTS.coingecko.search, {
        params: { query }
      });

      const coins = coinResponse.data.coins || [];
      const coinMatches = coins
        .slice(0, 5)
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          symbol: c.symbol?.toUpperCase(),
          type: 'token' as const,
          source: 'coingecko' as const,
          logo: c.large || c.thumb || undefined,
        }));

      results.push(...coinMatches);
    } catch (error) {
      console.error('[Search] CoinGecko error:', error);
    }

    // Remover duplicatas (mesmo nome)
    const uniqueResults = results.reduce((acc: SearchResult[], current) => {
      const isDuplicate = acc.some(
        item => item.name.toLowerCase() === current.name.toLowerCase()
      );
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Priorizar resultados exatos
    const sortedResults = uniqueResults.sort((a, b) => {
      const aExact = a.name.toLowerCase() === query.toLowerCase();
      const bExact = b.name.toLowerCase() === query.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return NextResponse.json({
      query,
      results: sortedResults.slice(0, 10)
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
