import { Card } from "@/components/ui/card"
import { ShieldIcon } from "../icons/shield-icon"
import { cn } from "@/lib/utils"

interface RiskScoreProps {
  data: any
}

export function RiskScore({ data }: RiskScoreProps) {
  const score = data.riskScore || 0
  const maxScore = 100
  const percentage = (score / maxScore) * 100

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: "EXCELENTE - Baixo Risco", color: "text-success" }
    if (score >= 60) return { label: "BOM - Risco Moderado", color: "text-success" }
    if (score >= 40) return { label: "REGULAR - Risco Elevado", color: "text-warning" }
    return { label: "ALTO RISCO", color: "text-danger" }
  }

  const riskLevel = getRiskLevel(score)

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
                score >= 60 ? "text-success" : score >= 40 ? "text-warning" : "text-danger",
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
          <p className={cn("text-xl font-bold font-mono", riskLevel.color)}>{riskLevel.label}</p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-danger font-mono">{data.redFlags || 0}</div>
            <div className="text-xs text-muted-foreground font-mono mt-1">Red Flags</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning font-mono">{data.warnings?.length || 0}</div>
            <div className="text-xs text-muted-foreground font-mono mt-1">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success font-mono">{data.positivePoints?.length || 0}</div>
            <div className="text-xs text-muted-foreground font-mono mt-1">Pontos Positivos</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
