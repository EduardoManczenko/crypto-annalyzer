"use client"

import { useState, useRef, useEffect } from "react"
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
  side = "bottom",
  className
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(true)
  }

  const hideTooltip = () => {
    // Delay para dar tempo de mover o mouse para o tooltip
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 200)
  }

  const cancelHide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative inline-block group">
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          onMouseEnter={cancelHide}
          onMouseLeave={hideTooltip}
          className={cn(
            "absolute z-[9999] px-4 py-3 text-sm rounded-lg shadow-xl",
            "bg-popover text-popover-foreground border-2 border-accent/30",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            "min-w-[200px] max-w-[320px] w-max",
            "whitespace-normal",
            // Top positioning
            side === "top" && "bottom-full mb-2 left-1/2 -translate-x-1/2",
            // Bottom positioning (default mais seguro)
            side === "bottom" && "top-full mt-2 left-1/2 -translate-x-1/2",
            // Left positioning
            side === "left" && "right-full mr-2 top-1/2 -translate-y-1/2",
            // Right positioning
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
              "absolute w-2 h-2 bg-popover border-accent/30 rotate-45 pointer-events-none",
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
