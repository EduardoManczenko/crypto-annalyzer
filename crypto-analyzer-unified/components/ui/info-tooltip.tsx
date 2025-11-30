"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface InfoTooltipProps {
  content: string | React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  className?: string
  delay?: number
}

export function InfoTooltip({
  content,
  children,
  side = "top",
  className,
  delay = 200
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const tooltipRect = tooltipRef.current?.getBoundingClientRect()

        let x = 0
        let y = 0

        switch (side) {
          case "top":
            x = rect.left + rect.width / 2
            y = rect.top - 8
            break
          case "bottom":
            x = rect.left + rect.width / 2
            y = rect.bottom + 8
            break
          case "left":
            x = rect.left - 8
            y = rect.top + rect.height / 2
            break
          case "right":
            x = rect.right + 8
            y = rect.top + rect.height / 2
            break
        }

        setPosition({ x, y })
        setIsVisible(true)
      }
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-50 px-3 py-2 text-sm rounded-lg shadow-lg pointer-events-none",
            "bg-popover text-popover-foreground border border-border",
            "animate-in fade-in-0 zoom-in-95",
            side === "top" && "bottom-full mb-2 -translate-x-1/2",
            side === "bottom" && "top-full mt-2 -translate-x-1/2",
            side === "left" && "right-full mr-2 -translate-y-1/2",
            side === "right" && "left-full ml-2 -translate-y-1/2",
            className
          )}
          style={{
            left: side === "top" || side === "bottom" ? `${position.x}px` : undefined,
            top: side === "left" || side === "right" ? `${position.y}px` : undefined,
            right: side === "left" ? `calc(100vw - ${position.x}px)` : undefined,
            left: side === "right" ? `${position.x}px` : undefined,
            bottom: side === "top" ? `calc(100vh - ${position.y}px)` : undefined,
            top: side === "bottom" ? `${position.y}px` : undefined,
            maxWidth: "300px",
          }}
        >
          {content}
        </div>
      )}
    </>
  )
}
