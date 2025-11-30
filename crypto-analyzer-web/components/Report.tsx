'use client';

import { AnalysisReport, DataSource } from '@/types';
import { formatNumber, formatPercent, formatLargeNumber, getMarketCapCategory } from '@/utils/formatters';
import { sectionTooltips, fieldTooltips, getSourceName, getSourceColor } from '@/utils/tooltips';
import Tooltip from './Tooltip';

interface ReportProps {
  report: AnalysisReport;
}

// Componente para ícone de informação
function InfoIcon({ tooltip }: { tooltip: string }) {
  return (
    <Tooltip content={tooltip} position="top">
      <svg className="w-5 h-5 text-slate-400 hover:text-cyan-400 transition-colors cursor-help inline-block ml-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    </Tooltip>
  );
}

export default function Report({ report }: ReportProps) {
  const { data, riskAnalysis, riskScore } = report;

  // Função para obter fonte de um campo
  const getFieldSource = (fieldName: string): DataSource | null => {
    if (!data.sources) return null;
    return data.sources.find(s => s.field === fieldName) || null;
  };

  // Componente para tooltip de fonte nos valores
  const ValueWithSource = ({ value, field, children }: { value: any; field: string; children: React.ReactNode }) => {
    const source = getFieldSource(field);

    if (!source || value === null || value === 'N/A') {
      return <>{children}</>;
    }

    const tooltipContent = (
      <div className="text-center">
        <div className="font-semibold mb-1">Fonte dos dados</div>
        <div className={getSourceColor(source.source)}>{getSourceName(source.source)}</div>
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 block"
          >
            Ver fonte →
          </a>
        )}
      </div>
    );

    return (
      <Tooltip content={tooltipContent} position="top">
        <span className="cursor-help border-b border-dotted border-slate-600 hover:border-cyan-500 transition-colors">
          {children}
        </span>
      </Tooltip>
    );
  };

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
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
        <p className="text-xl opacity-90">
          {data.symbol} • {data.category}
        </p>
        <p className="text-sm mt-2 opacity-75">
          Análise gerada em {new Date().toLocaleString('pt-BR')}
        </p>
      </div>

      {/* Informações Básicas */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center">
          📊 Informações Básicas
          <InfoIcon tooltip={sectionTooltips.basicInfo} />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
            <Tooltip content={fieldTooltips.name}>
              <span className="text-slate-300 cursor-help border-b border-dotted border-slate-600">Nome</span>
            </Tooltip>
            <ValueWithSource value={data.name} field="name">
              <span className="font-semibold">{data.name}</span>
            </ValueWithSource>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
            <Tooltip content={fieldTooltips.symbol}>
              <span className="text-slate-300 cursor-help border-b border-dotted border-slate-600">Símbolo</span>
            </Tooltip>
            <span className="font-semibold">{data.symbol}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
            <Tooltip content={fieldTooltips.category}>
              <span className="text-slate-300 cursor-help border-b border-dotted border-slate-600">Categoria</span>
            </Tooltip>
            <span className="font-semibold">{data.category}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
            <Tooltip content={fieldTooltips.price}>
              <span className="text-slate-300 cursor-help border-b border-dotted border-slate-600">Preço Atual</span>
            </Tooltip>
            <ValueWithSource value={data.price} field="price">
              <span className="font-semibold text-green-400">{formatNumber(data.price)}</span>
            </ValueWithSource>
          </div>
        </div>
      </div>

      {/* Métricas de Mercado */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center">
          💰 Métricas de Mercado
          <InfoIcon tooltip={sectionTooltips.marketMetrics} />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.marketCap && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <Tooltip content={fieldTooltips.marketCap}>
                <p className="text-sm text-slate-400 mb-1 cursor-help border-b border-dotted border-slate-600 inline-block">Market Cap</p>
              </Tooltip>
              <ValueWithSource value={data.marketCap} field="marketCap">
                <p className="text-xl font-bold">{formatNumber(data.marketCap)}</p>
              </ValueWithSource>
              <p className={`text-sm mt-1 ${getMarketCapCategory(data.marketCap).color === 'green' ? 'text-green-400' : getMarketCapCategory(data.marketCap).color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>
                {getMarketCapCategory(data.marketCap).category}
              </p>
            </div>
          )}
          {data.fdv && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <Tooltip content={fieldTooltips.fdv}>
                <p className="text-sm text-slate-400 mb-1 cursor-help border-b border-dotted border-slate-600 inline-block">FDV (Full Diluted)</p>
              </Tooltip>
              <ValueWithSource value={data.fdv} field="fdv">
                <p className="text-xl font-bold">{formatNumber(data.fdv)}</p>
              </ValueWithSource>
            </div>
          )}
          {data.volume24h && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <Tooltip content={fieldTooltips.volume24h}>
                <p className="text-sm text-slate-400 mb-1 cursor-help border-b border-dotted border-slate-600 inline-block">Volume 24h</p>
              </Tooltip>
              <ValueWithSource value={data.volume24h} field="volume24h">
                <p className="text-xl font-bold">{formatNumber(data.volume24h)}</p>
              </ValueWithSource>
            </div>
          )}
          {data.tvl && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <Tooltip content={fieldTooltips.tvl}>
                <p className="text-sm text-slate-400 mb-1 cursor-help border-b border-dotted border-slate-600 inline-block">TVL</p>
              </Tooltip>
              <ValueWithSource value={data.tvl} field="tvl">
                <p className="text-xl font-bold text-cyan-400">{formatNumber(data.tvl)}</p>
              </ValueWithSource>
            </div>
          )}
        </div>
      </div>

      {/* Supply Analysis */}
      {(data.circulating || data.total || data.max) && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center">
            📦 Análise de Supply
            <InfoIcon tooltip={sectionTooltips.supplyAnalysis} />
          </h2>
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
                    <td className="py-3 px-4">
                      <Tooltip content={fieldTooltips.circulating}>
                        <span className="cursor-help border-b border-dotted border-slate-600">Circulating Supply</span>
                      </Tooltip>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <ValueWithSource value={data.circulating} field="circulating">
                        {formatLargeNumber(data.circulating)}
                      </ValueWithSource>
                    </td>
                    <td className="py-3 px-4 text-right">{safePercent(data.circulating, data.max)}%</td>
                  </tr>
                )}
                {data.total && (
                  <tr>
                    <td className="py-3 px-4">
                      <Tooltip content={fieldTooltips.totalSupply}>
                        <span className="cursor-help border-b border-dotted border-slate-600">Total Supply</span>
                      </Tooltip>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <ValueWithSource value={data.total} field="total">
                        {formatLargeNumber(data.total)}
                      </ValueWithSource>
                    </td>
                    <td className="py-3 px-4 text-right">{safePercent(data.total, data.max)}%</td>
                  </tr>
                )}
                <tr>
                  <td className="py-3 px-4">
                    <Tooltip content={fieldTooltips.maxSupply}>
                      <span className="cursor-help border-b border-dotted border-slate-600">Max Supply</span>
                    </Tooltip>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <ValueWithSource value={data.max} field="max">
                      {data.max ? formatLargeNumber(data.max) : <span className="text-yellow-400">∞ Infinito</span>}
                    </ValueWithSource>
                  </td>
                  <td className="py-3 px-4 text-right">100%</td>
                </tr>
                {data.total && data.circulating && (
                  <tr>
                    <td className="py-3 px-4">
                      <Tooltip content={fieldTooltips.tokensLocked}>
                        <span className="cursor-help border-b border-dotted border-slate-600">Tokens Locked</span>
                      </Tooltip>
                    </td>
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
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center">
          📈 Variações (Performance)
          <InfoIcon tooltip={sectionTooltips.performanceVariations} />
        </h2>
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
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center">
            🔗 Distribuição de TVL por Blockchain
            <InfoIcon tooltip={sectionTooltips.chainDistribution} />
          </h2>
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
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center">
          🧮 Ratios e Métricas Avançadas
          <InfoIcon tooltip={sectionTooltips.advancedRatios} />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.fdv && data.marketCap && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <Tooltip content={fieldTooltips.fdvMcapRatio}>
                <p className="text-sm text-slate-400 mb-1 cursor-help border-b border-dotted border-slate-600 inline-block">FDV/Market Cap</p>
              </Tooltip>
              <p className="text-xl font-bold">{safeToFixed(data.fdv / data.marketCap, 2)}x</p>
              <p className={`text-sm mt-1 ${(data.fdv / data.marketCap) < 1.5 ? 'text-green-400' : (data.fdv / data.marketCap) < 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                {(data.fdv / data.marketCap) < 1.5 ? 'Ótimo' : (data.fdv / data.marketCap) < 3 ? 'Razoável' : 'Alto Risco'}
              </p>
            </div>
          )}
          {data.marketCap && data.tvl && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <Tooltip content={fieldTooltips.mcapTvlRatio}>
                <p className="text-sm text-slate-400 mb-1 cursor-help border-b border-dotted border-slate-600 inline-block">MCap/TVL</p>
              </Tooltip>
              <p className="text-xl font-bold">{safeToFixed(data.marketCap / data.tvl, 2)}</p>
              <p className={`text-sm mt-1 ${(data.marketCap / data.tvl) < 0.5 ? 'text-green-400' : (data.marketCap / data.tvl) < 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                {(data.marketCap / data.tvl) < 0.5 ? 'Subvalorizado' : (data.marketCap / data.tvl) < 2 ? 'Justo' : 'Sobrevalorizado'}
              </p>
            </div>
          )}
          {data.volume24h && data.marketCap && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <Tooltip content={fieldTooltips.volumeToMcap}>
                <p className="text-sm text-slate-400 mb-1 cursor-help border-b border-dotted border-slate-600 inline-block">Volume/MCap 24h</p>
              </Tooltip>
              <p className="text-xl font-bold">{safePercent(data.volume24h, data.marketCap, 2)}%</p>
              <p className={`text-sm mt-1 ${((data.volume24h / data.marketCap) * 100) < 1 ? 'text-red-400' : ((data.volume24h / data.marketCap) * 100) < 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                {((data.volume24h / data.marketCap) * 100) < 1 ? 'Liquidez Baixa' : ((data.volume24h / data.marketCap) * 100) < 10 ? 'Liquidez Média' : 'Alta Liquidez'}
              </p>
            </div>
          )}
          {data.circulating && data.total && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <Tooltip content={fieldTooltips.circulatingPercent}>
                <p className="text-sm text-slate-400 mb-1 cursor-help border-b border-dotted border-slate-600 inline-block">% em Circulação</p>
              </Tooltip>
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
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border-2 border-cyan-500">
        <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400 flex items-center justify-center">
          ⭐ SCORE DE RISCO GERAL
          <InfoIcon tooltip={sectionTooltips.riskScore} />
        </h2>
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
        <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
          <h3 className="font-bold mb-2 text-cyan-400">💡 Recomendação</h3>
          <p className="text-slate-200">{riskScore.recommendation}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-slate-400 py-4 border-t border-slate-700">
        <p>Análise gerada por Crypto Analyzer - Use por sua conta e risco</p>
        <p className="mt-1">Sempre faça sua própria pesquisa (DYOR) antes de investir</p>
      </div>
    </div>
  );
}
