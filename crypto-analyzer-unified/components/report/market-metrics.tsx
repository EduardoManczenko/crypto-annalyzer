import { Card } from "@/components/ui/card"
import { ChartIcon } from "../icons/chart-icon"
import { CryptoData } from "@/types"
import { formatNumber, getMarketCapCategory } from "@/utils/formatters"

interface MarketMetricsProps {
  data: CryptoData
}

export function MarketMetrics({ data }: MarketMetricsProps) {
  const capCategory = getMarketCapCategory(data.marketCap)

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <ChartIcon className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Métricas de Mercado</h3>
      </div>

      <div className="space-y-3">
        <MetricRow label="Market Cap" value={formatNumber(data.marketCap)} />
        <MetricRow
          label="Cap Category"
          value={`${capCategory.category} (Risco ${capCategory.risk})`}
        />
        <MetricRow label="FDV (Full Diluted)" value={formatNumber(data.fdv)} />
        <MetricRow label="Volume 24h" value={formatNumber(data.volume24h)} />
        <MetricRow label="TVL" value={formatNumber(data.tvl)} highlighted />
      </div>
    </Card>
  )
}

function MetricRow({ label, value, highlighted }: { label: string; value: string; highlighted?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground font-mono">{label}</span>
      <span className={`text-sm font-semibold font-mono ${highlighted ? "text-accent" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  )
}
