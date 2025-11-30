import { Card } from "@/components/ui/card"
import { ShieldIcon } from "../icons/shield-icon"
import { cn } from "@/lib/utils"
import { RiskScore as RiskScoreType } from "@/types"

interface RiskScoreProps {
  data: RiskScoreType
}

export function RiskScore({ data }: RiskScoreProps) {
  const score = data.score || 0
  const maxScore = 100
  const percentage = (score / maxScore) * 100

  const getRiskColor = (score: number) => {
    if (score >= 60) return "text-success"
    if (score >= 40) return "text-warning"
    return "text-danger"
  }

  const riskColor = getRiskColor(score)

  return (
    <Card className="p-8 bg-gradient-to-br from-card to-muted/30">
      <div className="flex items-center justify-center gap-3 mb-6">
        <ShieldIcon className="w-6 h-6 text-accent" />
        <h3 className="text-2xl font-semibold">Score de Risco</h3>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Score Circle */}
        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none" className="text-muted" />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - percentage / 100)}`}
              className={cn(
                "transition-all duration-1000 ease-out",
                riskColor,
              )}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold font-mono">{score}</span>
            <span className="text-sm text-muted-foreground font-mono">/ {maxScore}</span>
          </div>
        </div>

        {/* Risk Level */}
        <div className="text-center">
          <p className={cn("text-xl font-bold font-mono", riskColor)}>{data.classification}</p>
        </div>
      </div>
    </Card>
  )
}
