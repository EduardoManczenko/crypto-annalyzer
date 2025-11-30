import { Card } from "@/components/ui/card"
import { ChartIcon } from "../icons/chart-icon"
import { InfoIcon } from "../info-icon"
import { LabelWithTooltip } from "../label-with-tooltip"
import { DataValue } from "../data-value"
import { CryptoData } from "@/types"
import { formatNumber, getMarketCapCategory } from "@/utils/formatters"
import { sectionTooltips, getSourceColor } from "@/lib/tooltips"

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
        <MetricRow
          label="Market Cap"
          tooltipKey="marketCap"
          value={formatNumber(data.marketCap)}
          source={{ name: "CoinGecko", color: getSourceColor("coingecko") }}
        />
        <MetricRow
          label="Cap Category"
          tooltipKey="capCategory"
          value={`${capCategory.category} (Risco ${capCategory.risk})`}
          source={{ name: "Análise Interna", color: getSourceColor("unknown") }}
        />
        <MetricRow
          label="FDV (Full Diluted)"
          tooltipKey="fdvFull"
          value={formatNumber(data.fdv)}
          source={{ name: "CoinGecko", color: getSourceColor("coingecko") }}
        />
        <MetricRow
          label="Volume 24h"
          tooltipKey="volume24h"
          value={formatNumber(data.volume24h)}
          source={{ name: "CoinGecko", color: getSourceColor("coingecko") }}
        />
        <MetricRow
          label="TVL"
          tooltipKey="tvl"
          value={formatNumber(data.tvl)}
          highlighted
          source={{ name: "DeFiLlama", url: `https://defillama.com/protocol/${data.name?.toLowerCase()}`, color: getSourceColor("defillama") }}
        />
      </div>
    </Card>
  )
}

interface MetricRowProps {
  label: string
  tooltipKey?: any
  value: string
  highlighted?: boolean
  source?: { name: string; url?: string; color?: string }
}

function MetricRow({ label, tooltipKey, value, highlighted, source }: MetricRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <LabelWithTooltip label={label} tooltipKey={tooltipKey} className="text-sm text-muted-foreground font-mono" />
      <span className={`text-sm font-semibold font-mono ${highlighted ? "text-accent" : "text-foreground"}`}>
        {source ? <DataValue value={value} source={source} /> : value}
      </span>
    </div>
  )
}
