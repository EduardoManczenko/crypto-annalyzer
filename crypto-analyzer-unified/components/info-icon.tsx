"use client"

import { Info } from "lucide-react"
import { InfoTooltip } from "./ui/info-tooltip"
import { cn } from "@/lib/utils"

interface InfoIconProps {
  content: string | React.ReactNode
  className?: string
  iconSize?: number
}

export function InfoIcon({ content, className, iconSize = 16 }: InfoIconProps) {
  return (
    <InfoTooltip content={content} side="bottom">
      <div
        className={cn(
          "inline-flex items-center justify-center",
          "text-muted-foreground hover:text-accent transition-colors cursor-help",
          className
        )}
      >
        <Info size={iconSize} />
      </div>
    </InfoTooltip>
  )
}
