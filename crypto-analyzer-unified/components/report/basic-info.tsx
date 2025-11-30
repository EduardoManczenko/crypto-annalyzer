import { Card } from "@/components/ui/card"
import { InfoIcon } from "../icons/info-icon"
import { CryptoData } from "@/types"
import { formatNumber } from "@/utils/formatters"

interface BasicInfoProps {
  data: CryptoData
}

export function BasicInfo({ data }: BasicInfoProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <InfoIcon className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Informações Básicas</h3>
      </div>

      <div className="space-y-3">
        <InfoRow label="Nome" value={data.name || "N/A"} />
        <InfoRow label="Símbolo" value={data.symbol?.toUpperCase() || "N/A"} />
        <InfoRow label="Categoria" value={data.category || "N/A"} />
        <InfoRow label="Preço Atual" value={formatNumber(data.price)} highlighted />
      </div>
    </Card>
  )
}

function InfoRow({ label, value, highlighted }: { label: string; value: string; highlighted?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground font-mono">{label}</span>
      <span className={`text-sm font-semibold font-mono ${highlighted ? "text-accent" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  )
}
