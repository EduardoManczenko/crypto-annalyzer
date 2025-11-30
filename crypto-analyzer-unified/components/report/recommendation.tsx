import { Card } from "@/components/ui/card"
import { LightbulbIcon } from "../icons/lightbulb-icon"
import { InfoIcon } from "../info-icon"
import { RiskScore } from "@/types"
import { sectionTooltips } from "@/lib/tooltips"

interface RecommendationProps {
  data: RiskScore
}

export function Recommendation({ data }: RecommendationProps) {
  return (
    <Card className="p-6 border-accent/30 bg-accent/5">
      <div className="flex items-center gap-3 mb-4">
        <LightbulbIcon className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Recomendação</h3>
        <InfoIcon content={sectionTooltips.recommendation.description} iconSize={14} />
      </div>

      <p className="text-sm leading-relaxed text-foreground font-mono">
        {data.recommendation || "Sem recomendação disponível."}
      </p>
    </Card>
  )
}
