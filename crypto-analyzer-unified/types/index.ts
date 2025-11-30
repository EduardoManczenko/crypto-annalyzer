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
  };
  priceChange: {
    '24h': number | null;
    '7d': number | null;
    '30d': number | null;
  };
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
