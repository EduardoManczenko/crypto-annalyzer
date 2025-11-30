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

interface ReportDisplayProps {
  data: any
}

export function ReportDisplay({ data }: ReportDisplayProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with asset name and type */}
      <div className="text-center pb-6 border-b border-border">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">{data.name}</h2>
        <p className="text-sm text-muted-foreground font-mono uppercase tracking-wide">
          {data.type === "chain" ? "Blockchain Analysis" : "DeFi Protocol Analysis"}
        </p>
      </div>

      {/* Two Column Layout for Key Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BasicInfo data={data} />
        <MarketMetrics data={data} />
      </div>

      {/* Supply Analysis - Full Width */}
      <SupplyAnalysis data={data} />

      {/* Performance and TVL Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceVariations data={data} />
        <TvlDistribution data={data} />
      </div>

      {/* Advanced Metrics - Full Width */}
      <AdvancedMetrics data={data} />

      {/* Warnings and Positive Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Warnings data={data} />
        <PositivePoints data={data} />
      </div>

      {/* Risk Score - Prominent Display */}
      <RiskScore data={data} />

      {/* Recommendation */}
      <Recommendation data={data} />

      {/* Footer */}
      <div className="pt-6 text-center text-xs text-muted-foreground font-mono">
        Análise gerada por Crypto Annalyzer • DYOR (Do Your Own Research)
      </div>
    </div>
  )
}
