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

/**
 * Lista de tokens/chains com supply infinito por natureza da blockchain
 * (supply não tem limite máximo definido)
 */
const INFINITE_SUPPLY_TOKENS = new Set([
  // Layer 1 Blockchains com supply infinito
  'ETH', 'ETHEREUM',
  'SOL', 'SOLANA',
  'DOGE', 'DOGECOIN',
  'ATOM', 'COSMOS',
  'DOT', 'POLKADOT',
  'AVAX', 'AVALANCHE',
  'FTM', 'FANTOM',
  'NEAR', 'NEAR PROTOCOL',
  'MATIC', 'POLYGON',
  'ONE', 'HARMONY',
  'ALGO', 'ALGORAND',
  'XTZ', 'TEZOS',
  'KSM', 'KUSAMA',
  'EGLD', 'ELROND',
  'ROSE', 'OASIS',
  'KAVA',
  'MINA',
  'FLOW',
  // Stablecoins (supply expansível/contrátil)
  'USDT', 'TETHER',
  'USDC', 'USD COIN',
  'DAI',
  'BUSD', 'BINANCE USD',
  'TUSD', 'TRUE USD',
  'USDP', 'PAX DOLLAR',
  'GUSD', 'GEMINI DOLLAR',
  'FRAX',
  'LUSD',
  'MIM', 'MAGIC INTERNET MONEY',
  // Outros tokens com supply sem limite máximo
  'SHIB', 'SHIBA INU',
  'ELON', 'DOGELON MARS',
  'PEPE',
  'FLOKI',
]);

/**
 * Verifica se um token tem supply infinito por natureza
 */
export function hasInfiniteSupply(symbol: string | null | undefined, name: string | null | undefined): boolean {
  if (!symbol && !name) return false;

  const normalizedSymbol = symbol?.toUpperCase().trim() || '';
  const normalizedName = name?.toUpperCase().trim() || '';

  return INFINITE_SUPPLY_TOKENS.has(normalizedSymbol) ||
         INFINITE_SUPPLY_TOKENS.has(normalizedName);
}

/**
 * Formata max supply considerando se é infinito ou N/A
 */
export function formatMaxSupply(
  maxSupply: number | null | undefined,
  symbol: string | null | undefined,
  name: string | null | undefined
): string {
  // Se tem max supply definido, mostrar o valor
  if (maxSupply !== null && maxSupply !== undefined && !isNaN(maxSupply)) {
    return formatLargeNumber(maxSupply);
  }

  // Se é um token com supply infinito por natureza, mostrar ∞
  if (hasInfiniteSupply(symbol, name)) {
    return '∞';
  }

  // Caso contrário, N/A (dados não disponíveis)
  return 'N/A';
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
