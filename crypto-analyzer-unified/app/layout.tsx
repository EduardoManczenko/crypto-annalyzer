import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Crypto Analyzer - Análise Profissional de Criptomoedas',
  description: 'Análise completa de protocolos DeFi e criptomoedas com integração DeFiLlama e CoinGecko. Avaliação de risco, métricas de mercado e recomendações profissionais.',
  keywords: ['crypto', 'defi', 'análise', 'criptomoedas', 'blockchain', 'investimentos'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
