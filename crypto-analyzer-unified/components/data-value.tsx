"use client"

import { ExternalLink } from "lucide-react"
import { InfoTooltip } from "./ui/info-tooltip"
import { cn } from "@/lib/utils"

interface DataValueProps {
  value: string | number | React.ReactNode
  source?: {
    name: string
    url?: string
    color?: string
  }
  className?: string
}

export function DataValue({ value, source, className }: DataValueProps) {
  if (!source) {
    return <span className={className}>{value}</span>
  }

  const sourceContent = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold">Data source:</span>
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-mono",
            source.color || "bg-accent/20 text-accent"
          )}
        >
          {source.name}
        </span>
      </div>
      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-accent hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <span>View on {source.name}</span>
          <ExternalLink size={12} />
        </a>
      )}
    </div>
  )

  return (
    <InfoTooltip content={sourceContent} side="top">
      <span
        className={cn(
          "cursor-help border-b border-dashed border-muted-foreground/30 hover:border-accent/50 transition-colors",
          className
        )}
      >
        {value}
      </span>
    </InfoTooltip>
  )
}
