import { NextRequest, NextResponse } from 'next/server';
import { searchIndex, IndexedItem } from '@/lib/search-index';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Aumentar timeout para indexação

export interface SearchResult {
  id: string;
  name: string;
  symbol?: string;
  type: 'protocol' | 'chain' | 'token' | 'exchange';
  source: 'defillama' | 'coingecko';
  logo?: string;
  tvl?: number;
  marketCap?: number;
  marketCapRank?: number;
  chains?: string[];
  category?: string;
}

/**
 * Converte IndexedItem para SearchResult
 */
function toSearchResult(item: IndexedItem): SearchResult {
  return {
    id: item.id,
    name: item.name,
    symbol: item.symbol,
    type: item.type,
    source: item.source,
    logo: item.logo,
    tvl: item.tvl,
    marketCap: item.marketCap,
    marketCapRank: item.marketCapRank,
    chains: item.chains,
    category: item.category
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '15');

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (!query || query.trim().length < 1) {
    return NextResponse.json(
      { error: 'Query parameter required' },
      { status: 400, headers }
    );
  }

  try {
    console.log(`[Search API] Buscando: "${query}"`);
    const startTime = Date.now();

    // Usar o sistema de indexação massivo com fuzzy search
    const results = await searchIndex(query, limit);

    const elapsed = Date.now() - startTime;
    console.log(`[Search API] Encontrados ${results.length} resultados em ${elapsed}ms`);

    if (results.length > 0) {
      console.log(`[Search API] Top 3:`, results.slice(0, 3).map(r =>
        `${r.name} (${r.type}) - score: ${r.score}`
      ));
    }

    // Converter para SearchResult
    const searchResults = results.map(toSearchResult);

    return NextResponse.json({
      query,
      results: searchResults,
      total: results.length,
      responseTime: elapsed
    }, { headers });

  } catch (error: any) {
    console.error('[Search API] Error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error.message,
        query
      },
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
