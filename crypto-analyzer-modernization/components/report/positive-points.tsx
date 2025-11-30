import { Card } from "@/components/ui/card"
import { CheckIcon } from "../icons/check-icon"

interface PositivePointsProps {
  data: any
}

export function PositivePoints({ data }: PositivePointsProps) {
  const positivePoints = data.positivePoints || []

  if (positivePoints.length === 0) return null

  return (
    <Card className="p-6 border-success/50 bg-success/5">
      <div className="flex items-center gap-3 mb-4">
        <CheckIcon className="w-5 h-5 text-success" />
        <h3 className="text-lg font-semibold text-success">PONTOS POSITIVOS</h3>
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
