import { Card } from "@/components/ui/card"
import { TrendingIcon } from "../icons/trending-icon"
import { cn } from "@/lib/utils"
import { CryptoData } from "@/types"
import { formatPercent } from "@/utils/formatters"

interface PerformanceVariationsProps {
  data: CryptoData
}

export function PerformanceVariations({ data }: PerformanceVariationsProps) {
  const variations = [
    {
      period: "24 horas",
      price: formatPercent(data.priceChange["24h"]),
      tvl: formatPercent(data.tvlChange["1d"]),
      priceValue: data.priceChange["24h"] || 0,
      tvlValue: data.tvlChange["1d"] || 0,
    },
    {
      period: "7 dias",
      price: formatPercent(data.priceChange["7d"]),
      tvl: formatPercent(data.tvlChange["7d"]),
      priceValue: data.priceChange["7d"] || 0,
      tvlValue: data.tvlChange["7d"] || 0,
    },
    {
      period: "30 dias",
      price: formatPercent(data.priceChange["30d"]),
      tvl: formatPercent(data.tvlChange["30d"]),
      priceValue: data.priceChange["30d"] || 0,
      tvlValue: data.tvlChange["30d"] || 0,
    },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingIcon className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Variações (Performance)</h3>
      </div>

      <div className="space-y-4">
        {variations.map((variation, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-muted-foreground">{variation.period}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Preço</span>
                <span
                  className={cn(
                    "text-sm font-semibold font-mono",
                    variation.priceValue >= 0 ? "text-success" : "text-danger"
                  )}
                >
                  {variation.price}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">TVL</span>
                <span
                  className={cn(
                    "text-sm font-semibold font-mono",
                    variation.tvlValue >= 0 ? "text-success" : "text-danger"
                  )}
                >
                  {variation.tvl}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
