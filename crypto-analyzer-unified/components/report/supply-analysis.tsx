import { Card } from "@/components/ui/card"
import { CoinsIcon } from "../icons/coins-icon"
import { InfoIcon } from "../info-icon"
import { CryptoData } from "@/types"
import { formatLargeNumber } from "@/utils/formatters"
import { sectionTooltips } from "@/lib/tooltips"

interface SupplyAnalysisProps {
  data: CryptoData
}

export function SupplyAnalysis({ data }: SupplyAnalysisProps) {
  const supplyData = [
    {
      type: "Circulating Supply",
      quantity: formatLargeNumber(data.circulating),
      percentage:
        data.circulating && data.max
          ? `${((data.circulating / data.max) * 100).toFixed(2)}%`
          : "N/A",
    },
    {
      type: "Total Supply",
      quantity: formatLargeNumber(data.total),
      percentage:
        data.total && data.max
          ? `${((data.total / data.max) * 100).toFixed(2)}%`
          : "N/A",
    },
    {
      type: "Max Supply",
      quantity: formatLargeNumber(data.max),
      percentage: data.max ? "100.00%" : "N/A",
    },
    {
      type: "Tokens Locked",
      quantity:
        data.total && data.circulating
          ? formatLargeNumber(data.total - data.circulating)
          : "N/A",
      percentage:
        data.total && data.circulating && data.max
          ? `${(((data.total - data.circulating) / data.max) * 100).toFixed(2)}%`
          : "N/A",
    },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <CoinsIcon className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Análise de Supply</h3>
        <InfoIcon content={sectionTooltips.supplyAnalysis.description} iconSize={14} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-mono text-muted-foreground font-medium">
                Tipo de Supply
              </th>
              <th className="text-right py-3 px-4 font-mono text-muted-foreground font-medium">
                Quantidade
              </th>
              <th className="text-right py-3 px-4 font-mono text-muted-foreground font-medium">
                % do Máximo
              </th>
            </tr>
          </thead>
          <tbody>
            {supplyData.map((item, index) => (
              <tr
                key={index}
                className="border-b border-border/50 hover:bg-muted/50 transition-colors"
              >
                <td className="py-3 px-4 font-mono text-foreground">{item.type}</td>
                <td className="py-3 px-4 font-mono text-foreground text-right">
                  {item.quantity}
                </td>
                <td className="py-3 px-4 font-mono text-accent text-right font-semibold">
                  {item.percentage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
