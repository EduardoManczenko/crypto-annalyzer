import { Card } from "@/components/ui/card"
import { TrendingIcon } from "../icons/trending-icon"
import { cn } from "@/lib/utils"

interface PerformanceVariationsProps {
  data: any
}

export function PerformanceVariations({ data }: PerformanceVariationsProps) {
  const variations = data.variations || []

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingIcon className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Variações (Performance)</h3>
      </div>

      <div className="space-y-4">
        {variations.map((variation: any, index: number) => (
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
                    Number.parseFloat(variation.price) >= 0 ? "text-success" : "text-danger",
                  )}
                >
                  {variation.price}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">TVL</span>
                <span className="text-sm font-semibold font-mono text-foreground">{variation.tvl}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
