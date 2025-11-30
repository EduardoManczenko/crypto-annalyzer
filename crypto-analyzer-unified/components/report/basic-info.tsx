import { Card } from "@/components/ui/card"
import { InfoIcon as InfoIconOriginal } from "../icons/info-icon"
import { InfoIcon } from "../info-icon"
import { InfoTooltip } from "../ui/info-tooltip"
import { DataValue } from "../data-value"
import { CryptoData } from "@/types"
import { formatNumber } from "@/utils/formatters"
import { sectionTooltips, fieldTooltips, getSourceName, getSourceUrl, getSourceColor } from "@/lib/tooltips"

interface BasicInfoProps {
  data: CryptoData
}

export function BasicInfo({ data }: BasicInfoProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <InfoIconOriginal className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Informações Básicas</h3>
        <InfoIcon content={sectionTooltips.basicInfo.description} iconSize={14} />
      </div>

      <div className="space-y-3">
        <InfoRow
          label="Nome"
          labelTooltip={fieldTooltips.name}
          value={data.name || "N/A"}
          source={data.name ? { name: "DeFiLlama" } : undefined}
        />
        <InfoRow
          label="Símbolo"
          labelTooltip={fieldTooltips.symbol}
          value={data.symbol?.toUpperCase() || "N/A"}
          source={data.symbol ? { name: "DeFiLlama" } : undefined}
        />
        <InfoRow
          label="Categoria"
          labelTooltip={fieldTooltips.category}
          value={data.category || "N/A"}
          source={data.category ? { name: "DeFiLlama" } : undefined}
        />
        <InfoRow
          label="Preço Atual"
          labelTooltip={fieldTooltips.price}
          value={formatNumber(data.price)}
          source={
            data.price
              ? {
                  name: "CoinGecko",
                  url: `https://coingecko.com/en/coins/${data.name?.toLowerCase()}`,
                  color: getSourceColor("coingecko"),
                }
              : undefined
          }
          highlighted
        />
      </div>
    </Card>
  )
}

interface InfoRowProps {
  label: string
  labelTooltip?: string
  value: string
  source?: {
    name: string
    url?: string
    color?: string
  }
  highlighted?: boolean
}

function InfoRow({ label, labelTooltip, value, source, highlighted }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <InfoTooltip content={labelTooltip || label} side="right">
        <span className="text-sm text-muted-foreground font-mono cursor-help border-b border-dotted border-muted-foreground/30">
          {label}
        </span>
      </InfoTooltip>
      <span className={`text-sm font-semibold font-mono ${highlighted ? "text-accent" : "text-foreground"}`}>
        <DataValue value={value} source={source} />
      </span>
    </div>
  )
}
