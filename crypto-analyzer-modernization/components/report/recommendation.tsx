import { Card } from "@/components/ui/card"
import { LightbulbIcon } from "../icons/lightbulb-icon"

interface RecommendationProps {
  data: any
}

export function Recommendation({ data }: RecommendationProps) {
  return (
    <Card className="p-6 border-accent/30 bg-accent/5">
      <div className="flex items-center gap-3 mb-4">
        <LightbulbIcon className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Recomendação</h3>
      </div>

      <p className="text-sm leading-relaxed text-foreground font-mono">
        {data.recommendation || "Sem recomendação disponível."}
      </p>
    </Card>
  )
}
