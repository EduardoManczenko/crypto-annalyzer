'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import Report from '@/components/Report';
import { AnalysisReport } from '@/types';

export default function Home() {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch(`/api/analyze?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar dados');
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4">
        {/* Header e Search - Centralizado verticalmente quando vazio */}
        <div className={`transition-all duration-500 ${!report && !isLoading && !error ? 'min-h-screen flex flex-col items-center justify-center' : 'pt-12 pb-8'}`}>
          <div className="text-center space-y-12">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Crypto Analyzer
            </h1>

            {/* Search Form */}
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          </div>
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
          <div className="animate-fade-in pb-12">
            <Report report={report} />
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
