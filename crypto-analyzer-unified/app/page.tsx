"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { SearchBox } from "@/components/search-box"
import { ReportDisplay } from "@/components/report-display"
import { AnalysisReport } from "@/types"

export default function Home() {
  const [reportData, setReportData] = useState<AnalysisReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    setError(null)
    setReportData(null)

    try {
      const response = await fetch(`/api/analyze?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar dados')
      }

      const data: AnalysisReport = await response.json()
      setReportData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Header />

        <div className="mt-12 md:mt-20">
          <SearchBox onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 mt-16">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-accent/50 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
              </div>
            </div>
            <p className="mt-6 text-lg text-muted-foreground animate-pulse">
              Analisando dados das melhores fontes...
            </p>
            <div className="mt-4 flex gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mt-16">
            <div className="bg-danger/10 border-2 border-danger rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">❌</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-danger mb-2">Erro na Análise</h3>
                  <p className="text-danger/90">{error}</p>
                  <p className="text-sm text-muted-foreground mt-3">
                    Dicas:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
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
        {reportData && !isLoading && (
          <div className="mt-16 md:mt-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ReportDisplay data={reportData} />
          </div>
        )}

        {/* Empty State */}
        {!reportData && !isLoading && !error && (
          <div className="max-w-4xl mx-auto text-center py-20 mt-16">
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Pronto para Analisar
            </h2>
            <p className="text-muted-foreground mb-8">
              Digite o nome de uma criptomoeda ou protocolo DeFi acima para começar a análise completa
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="font-bold mb-2 text-accent">Métricas Avançadas</h3>
                <p className="text-sm text-muted-foreground">
                  Market Cap, FDV, Volume, TVL e muito mais
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-bold mb-2 text-accent">Análise de Risco</h3>
                <p className="text-sm text-muted-foreground">
                  Identificação automática de red flags e pontos positivos
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="text-3xl mb-3">⭐</div>
                <h3 className="font-bold mb-2 text-accent">Score Inteligente</h3>
                <p className="text-sm text-muted-foreground">
                  Classificação de risco de 0 a 100 com recomendações
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
