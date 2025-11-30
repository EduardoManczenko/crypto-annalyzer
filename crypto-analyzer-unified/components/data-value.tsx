"use client"

import { ExternalLink, Code } from "lucide-react"
import { InfoTooltip } from "./ui/info-tooltip"
import { cn } from "@/lib/utils"

interface DataValueProps {
  value: string | number | React.ReactNode
  source?: {
    name: string
    url?: string
    apiEndpoint?: string
    color?: string
    formula?: string
  }
  className?: string
}

export function DataValue({ value, source, className }: DataValueProps) {
  if (!source) {
    return <span className={className}>{value}</span>
  }

  const sourceContent = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-xs">Data source:</span>
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-mono",
            source.color || "bg-accent/20 text-accent"
          )}
        >
          {source.name}
        </span>
      </div>

      {/* Fórmula/Método (para Análise Interna) */}
      {source.formula && (
        <div className="flex flex-col gap-1 p-2 bg-muted/50 rounded border border-border">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Code size={12} />
            <span>Fórmula/Método:</span>
          </div>
          <code className="text-xs font-mono text-foreground">{source.formula}</code>
        </div>
      )}

      {/* Link para API endpoint (JSON) */}
      {source.apiEndpoint && (
        <a
          href={source.apiEndpoint}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-accent hover:underline p-1 bg-accent/10 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <Code size={12} />
          <span>Ver JSON da API</span>
          <ExternalLink size={12} />
        </a>
      )}

      {/* Link para página (quando não tem API endpoint) */}
      {source.url && !source.apiEndpoint && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-accent hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <span>Ver em {source.name}</span>
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
