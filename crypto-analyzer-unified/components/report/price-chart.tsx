"use client"

import { PricePoint } from "@/types"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { formatNumber } from "@/utils/formatters"

interface PriceChartProps {
  data: PricePoint[]
  color?: string
}

export function PriceChart({ data, color = "#00ff9d" }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[80px] flex items-center justify-center text-xs text-muted-foreground">
        Dados não disponíveis
      </div>
    )
  }

  // Formatar dados para o Recharts
  const chartData = data.map((point) => ({
    time: point.timestamp,
    price: point.price,
  }))

  // Calcular min e max para o domínio do eixo Y
  const prices = data.map(p => p.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const padding = (maxPrice - minPrice) * 0.1 // 10% padding

  return (
    <ResponsiveContainer width="100%" height={80}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <XAxis
          dataKey="time"
          hide
        />
        <YAxis
          domain={[minPrice - padding, maxPrice + padding]}
          hide
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'oklch(0.15 0.02 252)',
            border: '1px solid oklch(0.25 0.02 252)',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
          labelFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          }}
          formatter={(value: any) => [formatNumber(value), 'Preço']}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          dot={false}
          animationDuration={300}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
