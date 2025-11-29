export function formatNumber(num: number | null): string {
  if (num === null) return 'N/A';
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

export function formatPercent(num: number | null): string {
  if (num === null) return 'N/A';
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function formatLargeNumber(num: number | null): string {
  if (num === null) return 'N/A';
  return num.toLocaleString('en-US');
}

export function getMarketCapCategory(mcap: number): {
  category: string;
  risk: string;
  color: string;
} {
  if (mcap >= 10e9) return { category: 'Large-Cap', risk: 'Baixo', color: 'green' };
  if (mcap >= 1e9) return { category: 'Mid-Cap', risk: 'Médio', color: 'yellow' };
  return { category: 'Small-Cap', risk: 'Alto', color: 'red' };
}
