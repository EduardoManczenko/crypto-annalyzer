// Import chain mappings for automatic detection
import { findChainMapping } from '@/lib/data-sources/chain-mappings';

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
 * Lista ESTÁTICA de tokens/chains com supply infinito conhecidos
 * Esta lista serve como fallback e para casos especiais (stablecoins, memecoins)
 */
const INFINITE_SUPPLY_TOKENS = new Set([
  // Layer 1 Blockchains principais
  'ETH', 'ETHEREUM',
  'SOL', 'SOLANA',
  'DOGE', 'DOGECOIN',
  'ATOM', 'COSMOS',
  'DOT', 'POLKADOT',
  'AVAX', 'AVALANCHE',
  'FTM', 'FANTOM',
  'NEAR', 'NEAR PROTOCOL',
  'MATIC', 'POLYGON', 'POL',
  'ONE', 'HARMONY',
  'ALGO', 'ALGORAND',
  'XTZ', 'TEZOS',
  'KSM', 'KUSAMA',
  'EGLD', 'ELROND', 'MULTIVERSX',
  'ROSE', 'OASIS',
  'KAVA',
  'MINA',
  'FLOW',
  'APT', 'APTOS',
  'SUI',
  'SEI',
  'BERA', 'BERACHAIN',
  'MOVE', 'MOVEMENT',
  'HYPE', 'HYPERLIQUID',
  'INJ', 'INJECTIVE',
  'TIA', 'CELESTIA',
  'OSMO', 'OSMOSIS',

  // Layer 2s (maioria tem supply infinito ou sem cap)
  'ARB', 'ARBITRUM',
  'OP', 'OPTIMISM',
  'METIS',
  'IMX', 'IMMUTABLE',
  'STRK', 'STARKNET',
  'MANTA',
  'BLAST',
  'MODE',
  'SCROLL',
  'ZKSYNC',
  'LINEA',
  'TAIKO',

  // Stablecoins (supply expansível/contrátil por design)
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
  'USDD',
  'USDJ',
  'USDE',

  // Memecoins (geralmente supply infinito ou muito alto)
  'SHIB', 'SHIBA INU',
  'ELON', 'DOGELON MARS',
  'PEPE',
  'FLOKI',
  'BONK',
  'WIF', 'DOGWIFHAT',
]);

/**
 * Verifica se um token/chain tem supply infinito por natureza
 *
 * LÓGICA:
 * 1. Verifica se é uma chain conhecida (L1/L2) via chain-mappings
 *    - Se for L1 ou L2 → infinite supply (a maioria das chains modernas não tem cap)
 * 2. Verifica se está na lista estática de tokens com infinite supply
 * 3. Caso contrário → não é infinite supply (mas pode ter max supply definido)
 */
export function hasInfiniteSupply(symbol: string | null | undefined, name: string | null | undefined): boolean {
  if (!symbol && !name) return false;

  const normalizedSymbol = symbol?.toUpperCase().trim() || '';
  const normalizedName = name?.toUpperCase().trim() || '';

  // 1. PRIORIDADE: Verificar se é uma chain conhecida via mappings
  const chainMapping = findChainMapping(normalizedName.toLowerCase()) ||
                       findChainMapping(normalizedSymbol.toLowerCase());

  if (chainMapping) {
    // Chains L1 e L2 modernas geralmente têm supply infinito ou sem cap
    // Exceções: Bitcoin (BTC), Litecoin (LTC), Cardano (ADA) têm max supply
    const hasMaxSupply = ['BTC', 'BITCOIN', 'LTC', 'LITECOIN', 'ADA', 'CARDANO', 'XRP', 'RIPPLE'].includes(normalizedSymbol);

    if (hasMaxSupply) {
      return false; // Estas chains TÊM max supply definido
    }

    // Todas as outras L1s e L2s geralmente têm supply infinito
    return chainMapping.category === 'L1' || chainMapping.category === 'L2';
  }

  // 2. Verificar na lista estática (fallback para tokens, stablecoins, memecoins)
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
