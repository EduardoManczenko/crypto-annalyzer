'use client';

import { AnalysisReport } from '@/types';
import { formatNumber, formatPercent, formatLargeNumber, getMarketCapCategory } from '@/utils/formatters';

interface ReportProps {
  report: AnalysisReport;
}

export default function Report({ report }: ReportProps) {
  const { data, riskAnalysis, riskScore } = report;

  const getPercentColor = (num: number | null) => {
    if (num === null) return 'text-slate-400';
    return num >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Função helper para formatar porcentagens com segurança
  const safeToFixed = (value: number | null | undefined, decimals: number = 2): string => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return value.toFixed(decimals);
  };

  // Função helper para calcular percentual com segurança
  const safePercent = (numerator: number | null | undefined, denominator: number | null | undefined, decimals: number = 1): string => {
    if (!numerator || !denominator || isNaN(numerator) || isNaN(denominator) || denominator === 0) return '-';
    return ((numerator / denominator) * 100).toFixed(decimals);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in mt-12">
      {/* Header */}
      <div className="text-center space-y-4 pb-8 border-b border-slate-700/50">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{data.name}</h1>
        <div className="flex items-center justify-center gap-3 text-lg text-slate-400">
          <span className="font-mono font-semibold text-cyan-400">{data.symbol}</span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span>{data.category}</span>
        </div>
        {data.price && (
          <div className="text-3xl font-bold text-green-400">
            {formatNumber(data.price)}
          </div>
        )}
      </div>

      {/* Informações Básicas */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/30">
        <h2 className="text-2xl font-bold mb-6 text-white">Informações Básicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <div className="flex flex-col items-center p-4 bg-slate-700/50 rounded-lg">
            <span className="text-sm text-slate-400 mb-2">Nome</span>
            <span className="font-semibold text-lg">{data.name}</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-slate-700/50 rounded-lg">
            <span className="text-sm text-slate-400 mb-2">Símbolo</span>
            <span className="font-semibold text-lg">{data.symbol}</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-slate-700/50 rounded-lg">
            <span className="text-sm text-slate-400 mb-2">Categoria</span>
            <span className="font-semibold text-lg">{data.category}</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-slate-700/50 rounded-lg">
            <span className="text-sm text-slate-400 mb-2">Preço Atual</span>
            <span className="font-semibold text-lg text-green-400">{formatNumber(data.price)}</span>
          </div>
        </div>
      </div>

      {/* Métricas de Mercado */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/30">
        <h2 className="text-2xl font-bold mb-6 text-white">Métricas de Mercado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {data.marketCap && (
            <div className="p-4 bg-slate-700/50 rounded-lg text-center">
              <p className="text-sm text-slate-400 mb-2">Market Cap</p>
              <p className="text-xl font-bold">{formatNumber(data.marketCap)}</p>
              <p className={`text-sm mt-1 ${getMarketCapCategory(data.marketCap).color === 'green' ? 'text-green-400' : getMarketCapCategory(data.marketCap).color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>
                {getMarketCapCategory(data.marketCap).category}
              </p>
            </div>
          )}
          {data.fdv && (
            <div className="p-4 bg-slate-700/50 rounded-lg text-center">
              <p className="text-sm text-slate-400 mb-2">FDV (Full Diluted)</p>
              <p className="text-xl font-bold">{formatNumber(data.fdv)}</p>
            </div>
          )}
          {data.volume24h && (
            <div className="p-4 bg-slate-700/50 rounded-lg text-center">
              <p className="text-sm text-slate-400 mb-2">Volume 24h</p>
              <p className="text-xl font-bold">{formatNumber(data.volume24h)}</p>
            </div>
          )}
          {data.tvl && (
            <div className="p-4 bg-slate-700/50 rounded-lg text-center">
              <p className="text-sm text-slate-400 mb-2">TVL</p>
              <p className="text-xl font-bold text-cyan-400">{formatNumber(data.tvl)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Supply Analysis */}
      {(data.circulating || data.total || data.max) && (
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/30">
          <h2 className="text-2xl font-bold mb-6 text-white">Análise de Supply</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300">Tipo de Supply</th>
                  <th className="text-right py-3 px-4 text-slate-300">Quantidade</th>
                  <th className="text-right py-3 px-4 text-slate-300">% do Máximo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {data.circulating && (
                  <tr>
                    <td className="py-3 px-4">Circulating Supply</td>
                    <td className="py-3 px-4 text-right font-mono">{formatLargeNumber(data.circulating)}</td>
                    <td className="py-3 px-4 text-right">{safePercent(data.circulating, data.max)}%</td>
                  </tr>
                )}
                {data.total && (
                  <tr>
                    <td className="py-3 px-4">Total Supply</td>
                    <td className="py-3 px-4 text-right font-mono">{formatLargeNumber(data.total)}</td>
                    <td className="py-3 px-4 text-right">{safePercent(data.total, data.max)}%</td>
                  </tr>
                )}
                <tr>
                  <td className="py-3 px-4">Max Supply</td>
                  <td className="py-3 px-4 text-right font-mono">{data.max ? formatLargeNumber(data.max) : <span className="text-yellow-400">∞ Infinito</span>}</td>
                  <td className="py-3 px-4 text-right">100%</td>
                </tr>
                {data.total && data.circulating && (
                  <tr>
                    <td className="py-3 px-4">Tokens Locked</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatLargeNumber(data.total - data.circulating)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {(() => {
                        const lockedPercent = ((data.total - data.circulating) / data.total) * 100;
                        const colorClass = lockedPercent > 50 ? 'text-red-400' : lockedPercent > 30 ? 'text-yellow-400' : 'text-green-400';
                        return <span className={colorClass}>{safeToFixed(lockedPercent, 1)}%</span>;
                      })()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Variações */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/30">
        <h2 className="text-2xl font-bold mb-6 text-white">Variações (Performance)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300">Período</th>
                <th className="text-right py-3 px-4 text-slate-300">Preço</th>
                <th className="text-right py-3 px-4 text-slate-300">TVL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr>
                <td className="py-3 px-4">24 horas</td>
                <td className={`py-3 px-4 text-right font-semibold ${getPercentColor(data.priceChange['24h'])}`}>
                  {formatPercent(data.priceChange['24h'])}
                </td>
                <td className={`py-3 px-4 text-right font-semibold ${getPercentColor(data.tvlChange['1d'])}`}>
                  {formatPercent(data.tvlChange['1d'])}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">7 dias</td>
                <td className={`py-3 px-4 text-right font-semibold ${getPercentColor(data.priceChange['7d'])}`}>
                  {formatPercent(data.priceChange['7d'])}
                </td>
                <td className={`py-3 px-4 text-right font-semibold ${getPercentColor(data.tvlChange['7d'])}`}>
                  {formatPercent(data.tvlChange['7d'])}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">30 dias</td>
                <td className={`py-3 px-4 text-right font-semibold ${getPercentColor(data.priceChange['30d'])}`}>
                  {formatPercent(data.priceChange['30d'])}
                </td>
                <td className={`py-3 px-4 text-right font-semibold ${getPercentColor(data.tvlChange['30d'])}`}>
                  {formatPercent(data.tvlChange['30d'])}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribuição por Chain */}
      {data.chains && Object.keys(data.chains).length > 0 && (
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/30">
          <h2 className="text-2xl font-bold mb-6 text-white">Distribuição de TVL por Blockchain</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300">Blockchain</th>
                  <th className="text-right py-3 px-4 text-slate-300">TVL</th>
                  <th className="text-right py-3 px-4 text-slate-300">% do Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {Object.entries(data.chains)
                  .sort(([, a], [, b]) => (b || 0) - (a || 0))
                  .slice(0, 10)
                  .map(([chain, tvl]) => {
                    const totalTvl = Object.values(data.chains!).reduce((sum, v) => sum + (v || 0), 0);
                    const pct = safePercent(tvl, totalTvl);
                    return (
                      <tr key={chain}>
                        <td className="py-3 px-4">{chain}</td>
                        <td className="py-3 px-4 text-right font-mono">{formatNumber(tvl)}</td>
                        <td className="py-3 px-4 text-right">{pct}%</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ratios */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/30">
        <h2 className="text-2xl font-bold mb-6 text-white">Ratios e Métricas Avançadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.fdv && data.marketCap && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">FDV/Market Cap</p>
              <p className="text-xl font-bold">{safeToFixed(data.fdv / data.marketCap, 2)}x</p>
              <p className={`text-sm mt-1 ${(data.fdv / data.marketCap) < 1.5 ? 'text-green-400' : (data.fdv / data.marketCap) < 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                {(data.fdv / data.marketCap) < 1.5 ? 'Ótimo' : (data.fdv / data.marketCap) < 3 ? 'Razoável' : 'Alto Risco'}
              </p>
            </div>
          )}
          {data.marketCap && data.tvl && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">MCap/TVL</p>
              <p className="text-xl font-bold">{safeToFixed(data.marketCap / data.tvl, 2)}</p>
              <p className={`text-sm mt-1 ${(data.marketCap / data.tvl) < 0.5 ? 'text-green-400' : (data.marketCap / data.tvl) < 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                {(data.marketCap / data.tvl) < 0.5 ? 'Subvalorizado' : (data.marketCap / data.tvl) < 2 ? 'Justo' : 'Sobrevalorizado'}
              </p>
            </div>
          )}
          {data.volume24h && data.marketCap && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Volume/MCap 24h</p>
              <p className="text-xl font-bold">{safePercent(data.volume24h, data.marketCap, 2)}%</p>
              <p className={`text-sm mt-1 ${((data.volume24h / data.marketCap) * 100) < 1 ? 'text-red-400' : ((data.volume24h / data.marketCap) * 100) < 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                {((data.volume24h / data.marketCap) * 100) < 1 ? 'Liquidez Baixa' : ((data.volume24h / data.marketCap) * 100) < 10 ? 'Liquidez Média' : 'Alta Liquidez'}
              </p>
            </div>
          )}
          {data.circulating && data.total && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">% em Circulação</p>
              <p className="text-xl font-bold">{safePercent(data.circulating, data.total, 1)}%</p>
              <p className={`text-sm mt-1 ${((data.circulating / data.total) * 100) > 70 ? 'text-green-400' : ((data.circulating / data.total) * 100) > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {((data.circulating / data.total) * 100) > 70 ? 'Boa Distribuição' : ((data.circulating / data.total) * 100) > 40 ? 'Moderada' : 'Alta Diluição'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Análise de Risco */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {riskAnalysis.flags.length > 0 && (
          <div className="bg-red-900/20 border-2 border-red-500 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3 text-red-400">🚨 RED FLAGS</h3>
            <ul className="space-y-2">
              {riskAnalysis.flags.map((flag, i) => (
                <li key={i} className="text-sm text-red-300">{flag}</li>
              ))}
            </ul>
          </div>
        )}
        {riskAnalysis.warnings.length > 0 && (
          <div className="bg-yellow-900/20 border-2 border-yellow-500 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3 text-yellow-400">⚠️ WARNINGS</h3>
            <ul className="space-y-2">
              {riskAnalysis.warnings.map((warning, i) => (
                <li key={i} className="text-sm text-yellow-300">{warning}</li>
              ))}
            </ul>
          </div>
        )}
        {riskAnalysis.positives.length > 0 && (
          <div className="bg-green-900/20 border-2 border-green-500 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3 text-green-400">✅ PONTOS POSITIVOS</h3>
            <ul className="space-y-2">
              {riskAnalysis.positives.map((positive, i) => (
                <li key={i} className="text-sm text-green-300">{positive}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Score de Risco */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/30">
        <h2 className="text-2xl font-bold mb-8 text-center text-white">Score de Risco</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span>Red Flags</span>
              <span className="text-red-400 font-bold">{riskAnalysis.flags.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span>Warnings</span>
              <span className="text-yellow-400 font-bold">{riskAnalysis.warnings.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span>Pontos Positivos</span>
              <span className="text-green-400 font-bold">{riskAnalysis.positives.length}</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center bg-slate-700/50 rounded-lg p-6">
            <p className="text-sm text-slate-400 mb-2">SCORE FINAL</p>
            <p className={`text-6xl font-bold mb-2 ${getRiskScoreColor(riskScore.score)}`}>
              {riskScore.score}
            </p>
            <p className="text-sm text-slate-400 mb-4">/100</p>
            <p className={`text-lg font-bold ${getRiskScoreColor(riskScore.score)}`}>
              {riskScore.classification}
            </p>
          </div>
        </div>
        <div className="mt-6 p-6 bg-slate-700/30 rounded-xl border border-slate-600/30">
          <h3 className="font-bold mb-3 text-white text-lg">Recomendação</h3>
          <p className="text-slate-300 leading-relaxed">{riskScore.recommendation}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 py-8 mt-12">
        <p>Análise gerada por Crypto Analyzer • DYOR (Do Your Own Research)</p>
      </div>
    </div>
  );
}
