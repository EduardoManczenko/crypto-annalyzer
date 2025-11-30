'use client';

import { useState, useEffect, useRef } from 'react';

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

interface SearchResult {
  id: string;
  name: string;
  symbol?: string;
  type: 'defi' | 'token' | 'blockchain';
  source: 'defillama' | 'coingecko';
  logo?: string;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Carregar histórico do localStorage
  useEffect(() => {
    const history = localStorage.getItem('search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Buscar resultados em tempo real
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results || []);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  const performSearch = (searchQuery: string) => {
    // Adicionar ao histórico
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));

    // Salvar no cache
    const cacheKey = `analysis_${searchQuery.toLowerCase()}`;
    localStorage.setItem('last_search', searchQuery);

    onSearch(searchQuery);
    setShowResults(false);
    setShowHistory(false);
  };

  const handleSearchFromCache = () => {
    const lastSearch = localStorage.getItem('last_search');
    if (lastSearch) {
      const cachedData = localStorage.getItem(`analysis_${lastSearch.toLowerCase()}`);
      if (cachedData) {
        setQuery(lastSearch);
        // Disparar evento customizado para carregar do cache
        window.dispatchEvent(new CustomEvent('loadFromCache', { detail: { query: lastSearch, data: JSON.parse(cachedData) } }));
      }
    }
  };

  const handleForceNewSearch = () => {
    if (query.trim()) {
      // Limpar cache antes de buscar
      const cacheKey = `analysis_${query.toLowerCase()}`;
      localStorage.removeItem(cacheKey);
      performSearch(query.trim());
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'defi': return 'Protocol';
      case 'token': return 'Token';
      case 'blockchain': return 'Chain';
      default: return type;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'blockchain':
        return <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-semibold">Chain</span>;
      case 'defi':
        return <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded font-semibold">Protocol</span>;
      case 'token':
        return <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded font-semibold">Token</span>;
      default:
        return null;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'defillama': return <span className="text-xs px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[10px]">DeFiLlama</span>;
      case 'coingecko': return <span className="text-xs px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded text-[10px]">CoinGecko</span>;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative" ref={resultsRef}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.length >= 2) setShowResults(true);
              if (searchHistory.length > 0 && !query) setShowHistory(true);
            }}
            placeholder="Digite o nome da criptomoeda ou protocolo (ex: bitcoin, aave, ethereum)"
            className="w-full px-6 py-4 pr-48 text-lg rounded-xl bg-slate-800 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none transition-all placeholder-slate-500"
            disabled={isLoading}
          />

          {/* Botões de lupa */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              type="button"
              onClick={handleSearchFromCache}
              disabled={isLoading}
              title="Carregar última busca do cache"
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleForceNewSearch}
              disabled={isLoading || !query.trim()}
              title="Forçar nova busca (ignora cache)"
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analisando...
                </span>
              ) : (
                'Analisar'
              )}
            </button>
          </div>

          {/* Dropdown de resultados da busca */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-slate-800 border-2 border-cyan-500/30 rounded-xl shadow-2xl z-50 max-h-[500px] overflow-y-auto">
              <div className="p-2">
                <div className="text-xs text-slate-400 px-3 py-2 border-b border-slate-700 mb-2">
                  <span className="font-semibold">{searchResults.length}</span> resultados encontrados
                </div>
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.source}-${result.id}-${index}`}
                    onClick={() => {
                      setQuery(result.name);
                      performSearch(result.name);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-700/70 rounded-lg transition-all text-left group border border-transparent hover:border-cyan-500/30"
                  >
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {result.logo ? (
                        <img
                          src={result.logo}
                          alt={result.name}
                          className="w-10 h-10 rounded-full ring-2 ring-slate-700 group-hover:ring-cyan-500/50 transition-all"
                          onError={(e) => {
                            // Fallback se a imagem não carregar
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold ring-2 ring-slate-700 group-hover:ring-cyan-500/50 transition-all">
                          {result.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {result.name}
                        </span>
                        {getTypeBadge(result.type)}
                      </div>
                      <div className="text-sm text-slate-400 flex items-center gap-2">
                        {result.symbol && (
                          <>
                            <span className="font-mono text-slate-300">{result.symbol}</span>
                            <span className="text-slate-600">•</span>
                          </>
                        )}
                        {getSourceBadge(result.source)}
                      </div>
                    </div>

                    {/* Seta de indicação */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dropdown de histórico */}
          {showHistory && searchHistory.length > 0 && !query && (
            <div className="absolute top-full mt-2 w-full bg-slate-800 border-2 border-slate-700 rounded-xl shadow-xl z-50">
              <div className="p-2">
                <div className="text-xs text-slate-400 px-3 py-2 flex justify-between items-center">
                  <span>Histórico de buscas</span>
                  <button
                    onClick={() => {
                      setSearchHistory([]);
                      localStorage.removeItem('search_history');
                      setShowHistory(false);
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Limpar
                  </button>
                </div>
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(item);
                      performSearch(item);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700 rounded-lg transition-all text-left"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="flex-1">{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>

      <div className="mt-4 flex gap-2 flex-wrap items-center">
        <span className="text-sm text-slate-400">Exemplos:</span>
        {['Bitcoin', 'Ethereum', 'Aave', 'Uniswap', 'Solana'].map((example) => (
          <button
            key={example}
            onClick={() => {
              setQuery(example);
              performSearch(example);
            }}
            disabled={isLoading}
            className="text-sm px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
