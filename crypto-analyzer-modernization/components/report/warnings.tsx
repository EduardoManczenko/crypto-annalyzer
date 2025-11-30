import { Card } from "@/components/ui/card"
import { AlertIcon } from "../icons/alert-icon"

interface WarningsProps {
  data: any
}

export function Warnings({ data }: WarningsProps) {
  const warnings = data.warnings || []

  if (warnings.length === 0) return null

  return (
    <Card className="p-6 border-warning/50 bg-warning/5">
      <div className="flex items-center gap-3 mb-4">
        <AlertIcon className="w-5 h-5 text-warning" />
        <h3 className="text-lg font-semibold text-warning">WARNINGS</h3>
      </div>

      <ul className="space-y-2">
        {warnings.map((warning: string, index: number) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <span className="text-warning mt-0.5">▲</span>
            <span className="text-foreground font-mono">{warning}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
