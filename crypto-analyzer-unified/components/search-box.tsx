"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBoxProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

export function SearchBox({ onSearch, isLoading }: SearchBoxProps) {
  const [query, setQuery] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("searchHistory")
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    // Add to history
    const newHistory = [query, ...history.filter((h) => h !== query)].slice(0, 10)
    setHistory(newHistory)
    localStorage.setItem("searchHistory", JSON.stringify(newHistory))

    onSearch(query)
    setShowHistory(false)
  }

  const handleHistoryClick = (item: string) => {
    setQuery(item)
    onSearch(item)
    setShowHistory(false)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("searchHistory")
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            placeholder="Search for crypto, DeFi protocol, or blockchain..."
            className={cn(
              "w-full h-14 px-6 pr-14 rounded-xl",
              "bg-card border border-border",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
              "transition-all duration-200",
              "font-mono text-sm",
            )}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "w-10 h-10 rounded-lg",
              "bg-accent text-accent-foreground",
              "flex items-center justify-center",
              "hover:bg-accent/90 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Search History Dropdown */}
        {showHistory && history.length > 0 && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowHistory(false)} />
            <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-2xl z-20 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {history.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleHistoryClick(item)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left group"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    <span className="text-sm font-mono text-foreground flex-1">{item}</span>
                    <X
                      className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        const newHistory = history.filter((_, i) => i !== index)
                        setHistory(newHistory)
                        localStorage.setItem("searchHistory", JSON.stringify(newHistory))
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </form>

      {/* Search suggestions */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {["Bitcoin", "Ethereum", "Solana", "Aave", "Uniswap"].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setQuery(suggestion)
              onSearch(suggestion)
            }}
            className="px-3 py-1.5 text-xs font-mono bg-muted border border-border rounded-lg hover:border-accent hover:text-accent transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
