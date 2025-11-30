import { Card } from "@/components/ui/card"
import { NetworkIcon } from "../icons/network-icon"
import { CryptoData } from "@/types"
import { formatNumber } from "@/utils/formatters"

interface TvlDistributionProps {
  data: CryptoData
}

export function TvlDistribution({ data }: TvlDistributionProps) {
  if (!data.chains) return null

  const totalTvl = Object.values(data.chains).reduce((sum, val) => sum + val, 0)

  const distribution = Object.entries(data.chains)
    .map(([blockchain, tvl]) => ({
      blockchain,
      tvl,
      percentage: totalTvl > 0 ? ((tvl / totalTvl) * 100).toFixed(2) + "%" : "0%",
      percentageNum: totalTvl > 0 ? (tvl / totalTvl) * 100 : 0,
    }))
    .sort((a, b) => b.tvl - a.tvl)

  if (distribution.length === 0) return null

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <NetworkIcon className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Distribuição de TVL por Blockchain</h3>
      </div>

      <div className="space-y-3">
        {distribution.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-foreground">{item.blockchain}</span>
              <span className="text-sm font-semibold font-mono text-accent">
                {formatNumber(item.tvl)} ({item.percentage})
              </span>
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
