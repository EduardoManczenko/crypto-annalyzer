import { Card } from "@/components/ui/card"
import { NetworkIcon } from "../icons/network-icon"

interface TvlDistributionProps {
  data: any
}

export function TvlDistribution({ data }: TvlDistributionProps) {
  const distribution = data.tvlDistribution || []

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <NetworkIcon className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Distribuição de TVL por Blockchain</h3>
      </div>

      <div className="space-y-3">
        {distribution.map((item: any, index: number) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-foreground">{item.blockchain}</span>
              <span className="text-sm font-semibold font-mono text-accent">{item.percentage}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: item.percentage }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
