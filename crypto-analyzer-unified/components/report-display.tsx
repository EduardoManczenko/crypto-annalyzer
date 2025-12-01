"use client"

import { BasicInfo } from "./report/basic-info"
import { MarketMetrics } from "./report/market-metrics"
import { SupplyAnalysis } from "./report/supply-analysis"
import { PerformanceVariations } from "./report/performance-variations"
import { TvlDistribution } from "./report/tvl-distribution"
import { AdvancedMetrics } from "./report/advanced-metrics"
import { RiskScore } from "./report/risk-score"
import { Warnings } from "./report/warnings"
import { PositivePoints } from "./report/positive-points"
import { Recommendation } from "./report/recommendation"
import { AnalysisReport } from "@/types"

interface ReportDisplayProps {
  data: AnalysisReport
}

export function ReportDisplay({ data }: ReportDisplayProps) {
  const { data: cryptoData, riskAnalysis, riskScore } = data

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with asset name and type */}
      <div className="text-center pb-6 border-b border-border">
        <div className="flex items-center justify-center gap-4 mb-4">
          {cryptoData.logo && (
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent/30 bg-accent/10 flex items-center justify-center">
              <img
                src={cryptoData.logo}
                alt={cryptoData.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
          <h2 className="text-3xl md:text-4xl font-bold">
            {cryptoData.name} ({cryptoData.symbol})
          </h2>
        </div>
        <p className="text-sm text-muted-foreground font-mono uppercase tracking-wide">
          {cryptoData.category || "Crypto Analysis"}
        </p>
      </div>

      {/* Two Column Layout for Key Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BasicInfo data={cryptoData} />
        <MarketMetrics data={cryptoData} />
      </div>

      {/* Supply Analysis - Full Width */}
      <SupplyAnalysis data={cryptoData} />

      {/* Performance and TVL Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceVariations data={cryptoData} />
        <TvlDistribution data={cryptoData} />
      </div>

      {/* Advanced Metrics - Full Width */}
      <AdvancedMetrics data={cryptoData} />

      {/* Warnings and Positive Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Warnings data={riskAnalysis} />
        <PositivePoints data={riskAnalysis} />
      </div>

      {/* Risk Score - Prominent Display */}
      <RiskScore data={riskScore} />

      {/* Recommendation */}
      <Recommendation data={riskScore} />

      {/* Footer */}
      <div className="pt-6 text-center text-xs text-muted-foreground font-mono">
        Análise gerada por Crypto Analyzer • DYOR (Do Your Own Research)
      </div>
    </div>
  )
}
