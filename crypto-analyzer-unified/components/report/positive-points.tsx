import { Card } from "@/components/ui/card"
import { CheckIcon } from "../icons/check-icon"
import { InfoIcon } from "../info-icon"
import { RiskAnalysis } from "@/types"
import { sectionTooltips } from "@/lib/tooltips"

interface PositivePointsProps {
  data: RiskAnalysis
}

export function PositivePoints({ data }: PositivePointsProps) {
  const positivePoints = data.positives

  if (positivePoints.length === 0) return null

  return (
    <Card className="p-6 border-success/50 bg-success/5">
      <div className="flex items-center gap-3 mb-4">
        <CheckIcon className="w-5 h-5 text-success" />
        <h3 className="text-lg font-semibold text-success">PONTOS POSITIVOS</h3>
        <InfoIcon content={sectionTooltips.positivePoints.description} iconSize={14} />
      </div>

      <ul className="space-y-2">
        {positivePoints.map((point: string, index: number) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <span className="text-success mt-0.5">■</span>
            <span className="text-foreground font-mono">{point}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
