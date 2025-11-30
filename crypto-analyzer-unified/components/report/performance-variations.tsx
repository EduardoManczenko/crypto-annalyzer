"use client"

import { Card } from "@/components/ui/card"
import { TrendingIcon } from "../icons/trending-icon"
import { InfoIcon } from "../info-icon"
import { LabelWithTooltip } from "../label-with-tooltip"
import { cn } from "@/lib/utils"
import { CryptoData } from "@/types"
import { formatPercent, formatNumber } from "@/utils/formatters"
import { PriceChart } from "./price-chart"
import { sectionTooltips, fieldTooltips } from "@/lib/tooltips"

interface PerformanceVariationsProps {
  data: CryptoData
}

interface PeriodData {
  label: string
  priceKey: '24h' | '7d' | '30d' | '365d'
  tvlKey: '1d' | '7d' | '30d' | '365d'
  chartKey: '24h' | '7d' | '30d' | '365d'
}

const PERIODS: PeriodData[] = [
  { label: "24 horas", priceKey: "24h", tvlKey: "1d", chartKey: "24h" },
  { label: "7 dias", priceKey: "7d", tvlKey: "7d", chartKey: "7d" },
  { label: "30 dias", priceKey: "30d", tvlKey: "30d", chartKey: "30d" },
  { label: "365 dias", priceKey: "365d", tvlKey: "365d", chartKey: "365d" },
]

export function PerformanceVariations({ data }: PerformanceVariationsProps) {
  // Debug: verificar dados recebidos
  console.log('[PerformanceVariations] data:', {
    symbol: data.symbol,
    price: data.price,
    tvl: data.tvl,
    tvlChange: data.tvlChange,
    priceChange: data.priceChange,
    priceHistory: data.priceHistory ? {
      '24h': data.priceHistory['24h']?.length || 0,
      '7d': data.priceHistory['7d']?.length || 0,
      '30d': data.priceHistory['30d']?.length || 0,
      '365d': data.priceHistory['365d']?.length || 0,
    } : 'não disponível'
  })

  // Filtrar períodos que têm dados
  const availablePeriods = PERIODS.filter((period) => {
    const hasPrice = data.priceChange[period.priceKey] !== null
    const hasChart = data.priceHistory?.[period.chartKey]?.length ?? 0 > 0
    return hasPrice || hasChart
  })

  // Calcular quantos dias de dados históricos temos
  const getAvailableDays = () => {
    if (data.priceHistory?.['365d']?.length) return 365
    if (data.priceHistory?.['30d']?.length) return 30
    if (data.priceHistory?.['7d']?.length) return 7
    if (data.priceHistory?.['24h']?.length) return 1
    return 0
  }

  const availableDays = getAvailableDays()

  return (
    <Card className="p-6">
      {/* Header com símbolo e preço */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <TrendingIcon className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold">Variações de Performance</h3>
          <InfoIcon content={sectionTooltips.performanceVariations.description} iconSize={14} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-accent">
            {data.symbol}
          </span>
          {data.price && (
            <span className="text-xl font-mono text-foreground">
              {formatNumber(data.price)}
            </span>
          )}
        </div>
        {availableDays < 365 && availableDays > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Dados históricos disponíveis: {availableDays} dia{availableDays !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Períodos */}
      <div className="space-y-6">
        {availablePeriods.map((period, index) => {
          const priceValue = data.priceChange[period.priceKey]
          const tvlValue = data.tvlChange[period.tvlKey]
          const chartData = data.priceHistory?.[period.chartKey]

          return (
            <div key={index} className="space-y-3">
              {/* Título do período */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium font-mono text-muted-foreground">
                  {period.label}
                </span>
              </div>

              {/* Métricas de variação */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <LabelWithTooltip
                    label="Variação de Preço"
                    tooltipKey={`priceChange${period.priceKey}` as any}
                    className="text-xs text-muted-foreground block mb-1"
                  />
                  <span
                    className={cn(
                      "text-lg font-semibold font-mono",
                      priceValue === null
                        ? "text-muted-foreground"
                        : priceValue >= 0
                        ? "text-success"
                        : "text-danger"
                    )}
                  >
                    {formatPercent(priceValue)}
                  </span>
                </div>
                {data.tvl && (
                  <div>
                    <LabelWithTooltip
                      label="Variação de TVL"
                      tooltipKey={`tvlChange${period.tvlKey}` as any}
                      className="text-xs text-muted-foreground block mb-1"
                    />
                    <span
                      className={cn(
                        "text-lg font-semibold font-mono",
                        tvlValue === null
                          ? "text-muted-foreground"
                          : tvlValue >= 0
                          ? "text-success"
                          : "text-danger"
                      )}
                    >
                      {formatPercent(tvlValue)}
                    </span>
                  </div>
                )}
              </div>

              {/* Gráfico de preço */}
              {chartData && chartData.length > 0 && (
                <div className="mt-3">
                  <PriceChart
                    data={chartData}
                    color={priceValue !== null && priceValue >= 0 ? "#00ff9d" : "#ff4757"}
                  />
                </div>
              )}

              {/* Divider (exceto no último) */}
              {index < availablePeriods.length - 1 && (
                <div className="border-t border-border pt-2" />
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
