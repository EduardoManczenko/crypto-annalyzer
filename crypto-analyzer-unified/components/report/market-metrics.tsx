import { Card } from "@/components/ui/card"
import { ChartIcon } from "../icons/chart-icon"
import { InfoIcon } from "../info-icon"
import { LabelWithTooltip } from "../label-with-tooltip"
import { CryptoData } from "@/types"
import { formatNumber, getMarketCapCategory } from "@/utils/formatters"
import { sectionTooltips } from "@/lib/tooltips"

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
        <InfoIcon content={sectionTooltips.marketMetrics.description} iconSize={14} />
      </div>

      <div className="space-y-3">
        <MetricRow label="Market Cap" tooltipKey="marketCap" value={formatNumber(data.marketCap)} />
        <MetricRow
          label="Cap Category"
          tooltipKey="capCategory"
          value={`${capCategory.category} (Risco ${capCategory.risk})`}
        />
        <MetricRow label="FDV (Full Diluted)" tooltipKey="fdvFull" value={formatNumber(data.fdv)} />
        <MetricRow label="Volume 24h" tooltipKey="volume24h" value={formatNumber(data.volume24h)} />
        <MetricRow label="TVL" tooltipKey="tvl" value={formatNumber(data.tvl)} highlighted />
      </div>
    </Card>
  )
}

function MetricRow({ label, tooltipKey, value, highlighted }: { label: string; tooltipKey?: any; value: string; highlighted?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <LabelWithTooltip label={label} tooltipKey={tooltipKey} className="text-sm text-muted-foreground font-mono" />
      <span className={`text-sm font-semibold font-mono ${highlighted ? "text-accent" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  )
}
