import { Card } from "@/components/ui/card"
import { CalculatorIcon } from "../icons/calculator-icon"

interface AdvancedMetricsProps {
  data: any
}

export function AdvancedMetrics({ data }: AdvancedMetricsProps) {
  const metrics = data.advancedMetrics || {}

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <CalculatorIcon className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Ratios e Métricas Avançadas</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="text-xs text-muted-foreground font-mono mb-1">{formatMetricName(key)}</div>
            <div className="text-lg font-bold font-mono text-foreground">{value as string}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function formatMetricName(key: string): string {
  return key.replace(/([A-Z])/g, " $1").trim()
}
