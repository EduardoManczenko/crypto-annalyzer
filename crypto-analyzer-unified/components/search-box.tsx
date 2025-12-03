"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, Clock, X, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBoxProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

interface SearchResult {
  id: string
  name: string
  symbol?: string
  type: 'protocol' | 'chain' | 'token' | 'exchange'
  source: 'defillama' | 'coingecko'
  logo?: string
  tvl?: number
  marketCap?: number
}

export function SearchBox({ onSearch, isLoading }: SearchBoxProps) {
  // DEBUG: Version timestamp
  console.log('🚀 SearchBox carregado! Timestamp: 2025-11-30T19:45:00')

  const [query, setQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [lastSearchType, setLastSearchType] = useState<string | undefined>(undefined) // Track last search type
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("searchHistory")
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Buscar resultados em tempo real
  useEffect(() => {
    console.log('🎯 [SearchBox] useEffect EXECUTOU! Query:', query, 'Length:', query.length)

    if (searchTimeout.current) {
      console.log('⏰ [SearchBox] Limpando timeout anterior')
      clearTimeout(searchTimeout.current)
    }

    if (query.trim().length < 2) {
      console.log('⚠️ [SearchBox] Query muito curta, abortando')
      setSearchResults([])
      setIsSearching(false)
      setSearchError(null)
      return
    }

    console.log('✨ [SearchBox] Query válida! Iniciando busca em 300ms...')
    setIsSearching(true)
    setSearchError(null)
    setShowDropdown(true)

    searchTimeout.current = setTimeout(async () => {
      try {
        console.log('🔍 [SearchBox] Iniciando busca para:', query)
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        console.log('📡 [SearchBox] Response status:', response.status)

        const data = await response.json()
        console.log('📦 [SearchBox] Dados recebidos:', data)

        if (response.ok) {
          setSearchResults(data.results || [])
          setIsSearching(false)
          console.log('✅ [SearchBox] Sucesso! Resultados:', data.results?.length || 0)
          console.log('📋 [SearchBox] Primeiros resultados:', data.results?.slice(0, 3))
        } else {
          setSearchError(data.error || 'Erro ao buscar')
          setIsSearching(false)
          console.error('❌ [SearchBox] Erro na resposta:', data)
        }
      } catch (error) {
        console.error('💥 [SearchBox] Exceção capturada:', error)
        setSearchError('Erro de conexão')
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    performSearch(query, false)
  }

  const handleForceRefresh = () => {
    if (!query.trim() || isLoading) return
    console.log('⚡ [SearchBox] FORCE REFRESH acionado!')
    console.log('⚡ [SearchBox] Mantendo tipo da última busca:', lastSearchType)

    // Use performSearchWithType to maintain the last search type
    if (lastSearchType) {
      performSearchWithType(query, lastSearchType, true)
    } else {
      performSearch(query, true)
    }
  }

  const performSearch = (searchQuery: string, force: boolean = false) => {
    // Add to history
    const newHistory = [searchQuery, ...history.filter((h) => h !== searchQuery)].slice(0, 10)
    setHistory(newHistory)
    localStorage.setItem("searchHistory", JSON.stringify(newHistory))

    // Pass query with force parameter if needed
    const queryWithForce = force ? `${searchQuery}|force` : searchQuery
    onSearch(queryWithForce)
    setShowDropdown(false)
  }

  const handleHistoryClick = (item: string) => {
    setQuery(item)
    performSearch(item, false)
  }

  const handleResultClick = (result: SearchResult) => {
    setQuery(result.name)
    // Pass both name AND type to ensure precise results
    performSearchWithType(result.name, result.type, false)
  }

  const performSearchWithType = (searchQuery: string, type?: string, force: boolean = false) => {
    // Add to history
    const newHistory = [searchQuery, ...history.filter((h) => h !== searchQuery)].slice(0, 10)
    setHistory(newHistory)
    localStorage.setItem("searchHistory", JSON.stringify(newHistory))

    // Save last search type for force refresh
    setLastSearchType(type)

    // Pass query with type parameter and force if needed
    let queryWithParams = type ? `${searchQuery}|${type}` : searchQuery
    if (force) {
      queryWithParams += '|force'
    }
    onSearch(queryWithParams)
    setShowDropdown(false)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("searchHistory")
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'chain':
        return <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-semibold">Chain</span>
      case 'protocol':
        return <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded font-semibold">Protocol</span>
      case 'token':
        return <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded font-semibold">Token</span>
      case 'exchange':
        return <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded font-semibold">Exchange</span>
      default:
        return null
    }
  }

  const formatMetric = (value: number | undefined) => {
    if (!value) return null
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="relative w-[65%] mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search for crypto, DeFi protocol, or blockchain..."
            className={cn(
              "w-full h-14 px-6 pr-28 rounded-xl",
              "bg-card border border-border",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
              "transition-all duration-200",
              "font-mono text-sm",
            )}
            disabled={isLoading}
          />

          {/* Force Refresh Button (Yellow Lightning) */}
          <button
            type="button"
            onClick={handleForceRefresh}
            disabled={isLoading || !query.trim()}
            title="Force Refresh - Ignore cache and fetch fresh data"
            className={cn(
              "absolute right-14 top-1/2 -translate-y-1/2",
              "w-10 h-10 rounded-lg",
              "bg-yellow-500 text-black",
              "flex items-center justify-center",
              "hover:bg-yellow-400 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "group",
            )}
          >
            <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          {/* Search Button (Cyan/Accent) */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            title="Search"
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

        {/* Unified Dropdown - Search Results + History */}
        {showDropdown && (searchResults.length > 0 || history.length > 0 || isSearching || searchError) && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
            <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-2xl z-20 overflow-hidden max-h-[500px] overflow-y-auto">

              {/* Search Results Section */}
              {searchResults.length > 0 && (
                <div className="border-b border-border">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Search className="w-3 h-3" />
                      <span className="font-bold">{searchResults.length}</span> results found
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.source}-${result.id}-${index}`}
                        type="button"
                        onClick={() => handleResultClick(result)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left group"
                      >
                        {/* Logo */}
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden border border-border/50 flex-shrink-0">
                          {result.logo ? (
                            <img
                              src={result.logo}
                              alt={result.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback se imagem não carregar
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.parentElement!.innerHTML = `<span class="text-accent font-bold text-sm">${result.name.charAt(0).toUpperCase()}</span>`
                              }}
                            />
                          ) : (
                            <span className="text-accent font-bold text-sm">
                              {result.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-mono font-semibold text-foreground truncate">
                              {result.name}
                            </span>
                            {getTypeBadge(result.type)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {result.symbol && (
                              <span className="font-mono font-semibold">{result.symbol}</span>
                            )}
                            {result.tvl && (
                              <>
                                <span>•</span>
                                <span>TVL {formatMetric(result.tvl)}</span>
                              </>
                            )}
                            {result.marketCap && !result.tvl && (
                              <>
                                <span>•</span>
                                <span>MCap {formatMetric(result.marketCap)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isSearching && (
                <div className="px-4 py-8 text-center">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              )}

              {/* Error State */}
              {!isSearching && searchError && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-semibold text-red-500">Error</p>
                  <p className="text-xs text-muted-foreground mt-1">{searchError}</p>
                </div>
              )}

              {/* History Section */}
              {history.length > 0 && !isSearching && (
                <div className={searchResults.length > 0 ? 'border-t border-border' : ''}>
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Clock className="w-3 h-3" />
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
                  <div className="max-h-48 overflow-y-auto">
                    {history.slice(0, 5).map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleHistoryClick(item)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left group"
                      >
                        <Clock className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        <span className="text-sm font-mono text-foreground flex-1">{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isSearching && !searchError && searchResults.length === 0 && history.length === 0 && query.length >= 2 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No results found</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Try another search term</p>
                </div>
              )}
            </div>
          </>
        )}
      </form>
    </div>
  )
}
