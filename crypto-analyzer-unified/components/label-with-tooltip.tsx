import { InfoTooltip } from "./ui/info-tooltip"
import { fieldTooltips } from "@/lib/tooltips"
import { cn } from "@/lib/utils"

interface LabelWithTooltipProps {
  label: string
  tooltipKey?: keyof typeof fieldTooltips
  customTooltip?: string
  className?: string
  children?: React.ReactNode
}

/**
 * Componente que renderiza um label com tooltip explicativo
 * Usa fieldTooltips.ts para pegar a explicação automaticamente
 */
export function LabelWithTooltip({
  label,
  tooltipKey,
  customTooltip,
  className,
  children,
}: LabelWithTooltipProps) {
  // Se não tem tooltip, retorna apenas o label
  const tooltipContent = customTooltip || (tooltipKey ? fieldTooltips[tooltipKey] : null)

  if (!tooltipContent) {
    return <span className={className}>{children || label}</span>
  }

  return (
    <InfoTooltip content={tooltipContent} side="right">
      <span className={cn("cursor-help border-b border-dotted border-muted-foreground/30", className)}>
        {children || label}
      </span>
    </InfoTooltip>
  )
}
