export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface ChartData {
  '24h': PricePoint[];
  '7d': PricePoint[];
  '30d': PricePoint[];
  '365d': PricePoint[];
}

export interface CryptoData {
  name: string;
  symbol: string;
  price: number | null;
  marketCap: number | null;
  fdv: number | null;
  volume24h: number | null;
  circulating: number | null;
  total: number | null;
  max: number | null;
  tvl: number | null;
  tvlChange: {
    '1d': number | null;
    '7d': number | null;
    '30d': number | null;
    '365d': number | null;
  };
  priceChange: {
    '24h': number | null;
    '7d': number | null;
    '30d': number | null;
    '365d': number | null;
  };
  priceHistory?: ChartData;
  chains: Record<string, number> | null;
  category: string;
}

export interface RiskAnalysis {
  flags: string[];
  warnings: string[];
  positives: string[];
}

export interface RiskScore {
  score: number;
  classification: string;
  recommendation: string;
}

export interface AnalysisReport {
  data: CryptoData;
  riskAnalysis: RiskAnalysis;
  riskScore: RiskScore;
}
