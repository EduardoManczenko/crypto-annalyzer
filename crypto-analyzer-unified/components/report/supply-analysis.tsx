import { Card } from "@/components/ui/card"
import { CoinsIcon } from "../icons/coins-icon"
import { InfoIcon } from "../info-icon"
import { LabelWithTooltip } from "../label-with-tooltip"
import { DataValue } from "../data-value"
import { CryptoData } from "@/types"
import { formatLargeNumber, formatMaxSupply, hasInfiniteSupply } from "@/utils/formatters"
import { sectionTooltips, fieldTooltips, getSourceColor } from "@/lib/tooltips"

interface SupplyAnalysisProps {
  data: CryptoData
}

export function SupplyAnalysis({ data }: SupplyAnalysisProps) {
  // Verificar se o token tem supply infinito por natureza
  const isInfiniteSupply = hasInfiniteSupply(data.symbol, data.name);

  const supplyData = [
    {
      type: "Circulating Supply",
      tooltipKey: "circulatingSupply" as const,
      quantity: formatLargeNumber(data.circulating),
      percentage:
        data.circulating && data.max
          ? `${((data.circulating / data.max) * 100).toFixed(2)}%`
          : isInfiniteSupply
          ? "~"  // Para supply infinito, não faz sentido calcular porcentagem
          : "N/A",
    },
    {
      type: "Total Supply",
      tooltipKey: "totalSupply" as const,
      quantity: formatLargeNumber(data.total),
      percentage:
        data.total && data.max
          ? `${((data.total / data.max) * 100).toFixed(2)}%`
          : isInfiniteSupply
          ? "~"  // Para supply infinito, não faz sentido calcular porcentagem
          : "N/A",
    },
    {
      type: "Max Supply",
      tooltipKey: "maxSupply" as const,
      quantity: formatMaxSupply(data.max, data.symbol, data.name),
      percentage: data.max ? "100.00%" : isInfiniteSupply ? "∞" : "N/A",
    },
    {
      type: "Tokens Locked",
      tooltipKey: "tokensLocked" as const,
      quantity:
        data.total && data.circulating
          ? formatLargeNumber(data.total - data.circulating)
          : "N/A",
      percentage:
        data.total && data.circulating && data.max
          ? `${(((data.total - data.circulating) / data.max) * 100).toFixed(2)}%`
          : isInfiniteSupply
          ? "~"  // Para supply infinito, não faz sentido calcular porcentagem
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
                <td className="py-3 px-4 font-mono text-foreground">
                  <LabelWithTooltip
                    label={item.type}
                    tooltipKey={item.tooltipKey}
                    className="font-mono text-foreground"
                  />
                </td>
                <td className="py-3 px-4 font-mono text-foreground text-right">
                  <DataValue
                    value={item.quantity}
                    source={{
                      name: "CoinGecko",
                      apiEndpoint: `https://api.coingecko.com/api/v3/coins/${data.symbol?.toLowerCase()}`,
                      color: getSourceColor("coingecko")
                    }}
                  />
                </td>
                <td className="py-3 px-4 font-mono text-accent text-right font-semibold">
                  <DataValue
                    value={item.percentage}
                    source={{
                      name: "Análise Interna",
                      formula: "(Supply Atual ÷ Max Supply) × 100",
                      color: getSourceColor("unknown")
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
