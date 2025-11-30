import { Card } from "@/components/ui/card"
import { CalculatorIcon } from "../icons/calculator-icon"
import { InfoIcon } from "../info-icon"
import { LabelWithTooltip } from "../label-with-tooltip"
import { CryptoData } from "@/types"
import { sectionTooltips } from "@/lib/tooltips"

interface AdvancedMetricsProps {
  data: CryptoData
}

export function AdvancedMetrics({ data }: AdvancedMetricsProps) {
  const calculateMetric = (
    numerator: number | null | undefined,
    denominator: number | null | undefined,
    suffix: string = "x"
  ): string => {
    if (!numerator || !denominator || denominator === 0) return "N/A"
    const ratio = numerator / denominator
    return `${ratio.toFixed(2)}${suffix}`
  }

  const calculatePercentage = (
    part: number | null | undefined,
    total: number | null | undefined
  ): string => {
    if (!part || !total || total === 0) return "N/A"
    return `${((part / total) * 100).toFixed(2)}%`
  }

  const metrics = [
    { label: "FDV/MCap", tooltipKey: "fdvMcapRatio" as const, value: calculateMetric(data.fdv, data.marketCap, "x") },
    { label: "MCap/TVL", tooltipKey: "mcapTvlRatio" as const, value: calculateMetric(data.marketCap, data.tvl, "x") },
    { label: "Volume/MCap", tooltipKey: "volumeMcapRatio" as const, value: calculateMetric(data.volume24h, data.marketCap, "x") },
    { label: "% em Circulação", tooltipKey: "circulatingPercentage" as const, value: calculatePercentage(data.circulating, data.max) },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <CalculatorIcon className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Ratios e Métricas Avançadas</h3>
        <InfoIcon content={sectionTooltips.advancedMetrics.description} iconSize={14} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <LabelWithTooltip
              label={metric.label}
              tooltipKey={metric.tooltipKey}
              className="text-xs text-muted-foreground font-mono mb-1 block"
            />
            <div className="text-lg font-bold font-mono text-foreground">{metric.value}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
