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
  side = "top",
  className
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [adjustedSide, setAdjustedSide] = useState(side)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      let newSide = side

      // Se tooltip sai pela parte de cima, mostra embaixo
      if (side === "top" && tooltipRect.top < 0) {
        newSide = "bottom"
      }
      // Se tooltip sai pela parte de baixo, mostra em cima
      else if (side === "bottom" && tooltipRect.bottom > viewportHeight) {
        newSide = "top"
      }
      // Se tooltip sai pela esquerda, mostra à direita
      else if (side === "left" && tooltipRect.left < 0) {
        newSide = "right"
      }
      // Se tooltip sai pela direita, mostra à esquerda
      else if (side === "right" && tooltipRect.right > viewportWidth) {
        newSide = "left"
      }

      if (newSide !== adjustedSide) {
        setAdjustedSide(newSide)
      }
    }
  }, [isVisible, side, adjustedSide])

  return (
    <div className="relative inline-block group">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-[9999] px-4 py-3 text-sm rounded-lg shadow-xl",
            "bg-popover text-popover-foreground border-2 border-accent/30",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            "min-w-[200px] max-w-[320px]",
            "pointer-events-none",
            className
          )}
          style={{
            ...(adjustedSide === "top" && triggerRef.current && {
              bottom: `${window.innerHeight - triggerRef.current.getBoundingClientRect().top + 8}px`,
              left: `${triggerRef.current.getBoundingClientRect().left + triggerRef.current.getBoundingClientRect().width / 2}px`,
              transform: "translateX(-50%)"
            }),
            ...(adjustedSide === "bottom" && triggerRef.current && {
              top: `${triggerRef.current.getBoundingClientRect().bottom + 8}px`,
              left: `${triggerRef.current.getBoundingClientRect().left + triggerRef.current.getBoundingClientRect().width / 2}px`,
              transform: "translateX(-50%)"
            }),
            ...(adjustedSide === "left" && triggerRef.current && {
              top: `${triggerRef.current.getBoundingClientRect().top + triggerRef.current.getBoundingClientRect().height / 2}px`,
              right: `${window.innerWidth - triggerRef.current.getBoundingClientRect().left + 8}px`,
              transform: "translateY(-50%)"
            }),
            ...(adjustedSide === "right" && triggerRef.current && {
              top: `${triggerRef.current.getBoundingClientRect().top + triggerRef.current.getBoundingClientRect().height / 2}px`,
              left: `${triggerRef.current.getBoundingClientRect().right + 8}px`,
              transform: "translateY(-50%)"
            })
          }}
        >
          <div className="text-sm leading-relaxed">
            {content}
          </div>

          {/* Arrow */}
          <div
            className={cn(
              "absolute w-2 h-2 bg-popover border-accent/30 rotate-45",
              adjustedSide === "top" && "bottom-[-5px] left-1/2 -translate-x-1/2 border-b-2 border-r-2",
              adjustedSide === "bottom" && "top-[-5px] left-1/2 -translate-x-1/2 border-t-2 border-l-2",
              adjustedSide === "left" && "right-[-5px] top-1/2 -translate-y-1/2 border-t-2 border-r-2",
              adjustedSide === "right" && "left-[-5px] top-1/2 -translate-y-1/2 border-b-2 border-l-2"
            )}
          />
        </div>
      )}
    </div>
  )
}
