export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

export function formatPercent(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function formatLargeNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return num.toLocaleString('en-US');
}

export function getMarketCapCategory(mcap: number | null | undefined): {
  category: string;
  risk: string;
  color: string;
} {
  if (!mcap || isNaN(mcap)) return { category: 'N/A', risk: 'N/A', color: 'gray' };
  if (mcap >= 10e9) return { category: 'Large-Cap', risk: 'Baixo', color: 'green' };
  if (mcap >= 1e9) return { category: 'Mid-Cap', risk: 'Médio', color: 'yellow' };
  return { category: 'Small-Cap', risk: 'Alto', color: 'red' };
}
