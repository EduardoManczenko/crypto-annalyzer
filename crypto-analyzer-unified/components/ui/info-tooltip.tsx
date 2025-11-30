"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface InfoTooltipProps {
  content: string | React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}

export function InfoTooltip({
  content,
  children,
  side = "top",
  className
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block group">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-4 py-3 text-sm rounded-lg shadow-xl",
            "bg-popover text-popover-foreground border-2 border-accent/30",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            "min-w-[200px] max-w-[320px]",
            "pointer-events-none",
            side === "top" && "bottom-full mb-2 left-1/2 -translate-x-1/2",
            side === "bottom" && "top-full mt-2 left-1/2 -translate-x-1/2",
            side === "left" && "right-full mr-2 top-1/2 -translate-y-1/2",
            side === "right" && "left-full ml-2 top-1/2 -translate-y-1/2",
            className
          )}
        >
          <div className="text-sm leading-relaxed">
            {content}
          </div>

          {/* Arrow */}
          <div
            className={cn(
              "absolute w-2 h-2 bg-popover border-accent/30 rotate-45",
              side === "top" && "bottom-[-5px] left-1/2 -translate-x-1/2 border-b-2 border-r-2",
              side === "bottom" && "top-[-5px] left-1/2 -translate-x-1/2 border-t-2 border-l-2",
              side === "left" && "right-[-5px] top-1/2 -translate-y-1/2 border-t-2 border-r-2",
              side === "right" && "left-[-5px] top-1/2 -translate-y-1/2 border-b-2 border-l-2"
            )}
          />
        </div>
      )}
    </div>
  )
}
