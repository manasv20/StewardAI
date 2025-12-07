export interface UserProfile {
  age: number | string;
  retirementAge: number | string;
  annualIncome: number | string;
  // Broken down assets
  cash: number | string;
  brokerageBalance: number | string;
  rothBalance: number | string;
  
  monthlyContribution: number | string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'growth_maximalist';
  taxFilingStatus: 'single' | 'married_joint' | 'head_household';
  goals: string[]; // e.g., "beat_inflation", "dividends", "early_retirement"
  geographicFocus: string[]; // e.g., 'US Focused', 'Europe', 'Emerging Markets'
  currentPortfolio: string; // Raw text or CSV content of current holdings
}

export interface TechnicalAnalysis {
  summary: string;
  support: string;
  resistance: string;
  indicatorSignal: string;
}

export interface MarketSentiment {
  score: 'Very Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Very Bearish';
  summary: string;
  analystRating: string;
}

export interface AllocationItem {
  ticker: string;
  name: string;
  sector: string;
  percentage: number;
  type: 'Stock' | 'ETF' | 'Bond' | 'REIT' | 'Crypto';
  rationale: string;
  accountType: 'Roth IRA' | 'Brokerage' | 'Both';
  dividendYield?: number;
  technicalAnalysis: TechnicalAnalysis;
  marketSentiment: MarketSentiment;
}

export interface ProjectionData {
  year: number;
  conservative: number;
  expected: number;
  aggressive: number;
  inflationAdjusted: number;
  totalContributions: number;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface SecEvent {
  ticker: string;
  type: string; // e.g., "10-K", "Earnings Call", "Insider Trading"
  date: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface SectorTrend {
  sector: string;
  trend: 'accumulate' | 'hold' | 'reduce';
  performance: number; // e.g. 5.2 (percent)
  reasoning: string;
}

export interface MarketAnalysis {
  macroOutlook: string;
  inflationForecast: string;
  interestRateView: string;
}

export interface RebalancingOrder {
  ticker: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  amount: string; // e.g. "$5,000" or "50 shares"
  reason: string;
}

export interface PortfolioAnalysis {
  currentScore: number; // 0-100
  analysis: string; // Text analysis of current overlap/risks
  rebalancingOrders: RebalancingOrder[];
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    sources?: GroundingSource[];
}

export interface InvestmentPlan {
  summary: string;
  riskAnalysis: string;
  actionableSteps: string[];
  swot: SWOTAnalysis;
  allocations: AllocationItem[];
  projections: ProjectionData[];
  sources: GroundingSource[];
  marketAnalysis: MarketAnalysis;
  secEvents: SecEvent[];
  sectorTrends: SectorTrend[];
  portfolioAnalysis?: PortfolioAnalysis;
}

export const DEFAULT_PROFILE: UserProfile = {
  age: '',
  retirementAge: '',
  annualIncome: '',
  cash: '',
  brokerageBalance: '',
  rothBalance: '',
  monthlyContribution: '',
  riskTolerance: 'moderate',
  taxFilingStatus: 'single',
  goals: [],
  geographicFocus: [],
  currentPortfolio: '',
};
