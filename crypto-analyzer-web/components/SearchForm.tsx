'use client';

import { useState, useEffect } from 'react';

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Carregar histórico do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('cryptoSearchHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Salvar no histórico
  const saveToHistory = (searchQuery: string) => {
    const updatedHistory = [searchQuery, ...history.filter(h => h !== searchQuery)].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem('cryptoSearchHistory', JSON.stringify(updatedHistory));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveToHistory(query.trim());
      onSearch(query.trim());
      setShowHistory(false);
    }
  };

  const handleHistoryClick = (item: string) => {
    setQuery(item);
    onSearch(item);
    setShowHistory(false);
  };

  return (
    <div className="w-full md:w-1/2 mx-auto relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            placeholder="Buscar criptomoeda ou protocolo..."
            className="w-full px-10 py-8 text-2xl rounded-full bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700/50 focus:border-cyan-500 focus:outline-none transition-all placeholder-slate-500 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
          >
            {isLoading ? (
              <svg className="animate-spin h-7 w-7" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Histórico de buscas */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full mt-3 w-full bg-slate-800/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden z-10">
          <div className="px-6 py-3 text-sm text-slate-400 border-b border-slate-700/50">
            Buscas recentes
          </div>
          {history.map((item, index) => (
            <button
              key={index}
              onClick={() => handleHistoryClick(item)}
              className="w-full px-6 py-4 text-left hover:bg-slate-700/50 transition-colors flex items-center gap-4 text-lg"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-slate-300">{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
