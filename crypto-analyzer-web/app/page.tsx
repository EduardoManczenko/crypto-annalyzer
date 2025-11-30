'use client';

import { useState, useEffect } from 'react';
import SearchForm from '@/components/SearchForm';
import Report from '@/components/Report';
import { AnalysisReport } from '@/types';

export default function Home() {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Listener para carregar do cache
  useEffect(() => {
    const handleLoadFromCache = (e: CustomEvent) => {
      const { query, data } = e.detail;
      setReport(data);
      setIsFromCache(true);
      setError(null);

      // Remover badge de cache após 3 segundos
      setTimeout(() => {
        setIsFromCache(false);
      }, 3000);
    };

    window.addEventListener('loadFromCache', handleLoadFromCache as EventListener);
    return () => {
      window.removeEventListener('loadFromCache', handleLoadFromCache as EventListener);
    };
  }, []);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    setIsFromCache(false);

    try {
      const response = await fetch(`/api/analyze?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar dados');
      }

      const data = await response.json();
      setReport(data);

      // Salvar no cache
      const cacheKey = `analysis_${query.toLowerCase()}`;
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-2xl">
              <h1 className="text-4xl md:text-5xl font-bold">
                🔍 Crypto Analyzer
              </h1>
            </div>
          </div>
          <p className="text-xl text-slate-300 mb-2">
            Análise Profissional de Protocolos DeFi e Tokens
          </p>
          <p className="text-slate-400">
            Obtenha métricas avançadas, análise de risco e insights valiosos
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-12">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
              </div>
            </div>
            <p className="mt-6 text-lg text-slate-300 animate-pulse">
              Analisando dados das melhores fontes...
            </p>
            <div className="mt-4 flex gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900/20 border-2 border-red-500 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">❌</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-400 mb-2">Erro na Análise</h3>
                  <p className="text-red-300">{error}</p>
                  <p className="text-sm text-slate-400 mt-3">
                    Dicas:
                  </p>
                  <ul className="text-sm text-slate-400 mt-2 space-y-1 list-disc list-inside">
                    <li>Verifique se digitou o nome corretamente</li>
                    <li>Tente usar o símbolo da moeda (ex: BTC, ETH)</li>
                    <li>Alguns tokens podem não estar disponíveis nas APIs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report */}
        {report && !isLoading && (
          <div className="animate-fade-in">
            {isFromCache && (
              <div className="max-w-6xl mx-auto mb-4">
                <div className="bg-cyan-500/20 border border-cyan-500 rounded-lg px-4 py-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span className="text-cyan-300 text-sm font-medium">
                    Dados carregados do cache local
                  </span>
                </div>
              </div>
            )}
            <Report report={report} />
          </div>
        )}

        {/* Empty State */}
        {!report && !isLoading && !error && (
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-2xl font-bold text-slate-300 mb-4">
              Pronto para Analisar
            </h2>
            <p className="text-slate-400 mb-8">
              Digite o nome de uma criptomoeda ou protocolo DeFi acima para começar a análise completa
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="font-bold mb-2 text-cyan-400">Métricas Avançadas</h3>
                <p className="text-sm text-slate-400">
                  Market Cap, FDV, Volume, TVL e muito mais
                </p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-bold mb-2 text-cyan-400">Análise de Risco</h3>
                <p className="text-sm text-slate-400">
                  Identificação automática de red flags e pontos positivos
                </p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="text-3xl mb-3">⭐</div>
                <h3 className="font-bold mb-2 text-cyan-400">Score Inteligente</h3>
                <p className="text-sm text-slate-400">
                  Classificação de risco de 0 a 100 com recomendações
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}
