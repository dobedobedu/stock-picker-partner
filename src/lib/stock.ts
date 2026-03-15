/* ── Types ── */

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  pe: number;
  revenue: number;
  revenueGrowth: number;
  profitMargin: number;
  high52: number;
  low52: number;
  debtToEquity: number;
  sector: string;
  description: string;
  image: string;
}

export interface TickerOption {
  symbol: string;
  name: string;
  color: string;
  emoji: string;
}

export const PRELOADED_TICKERS: TickerOption[] = [
  { symbol: 'AAPL', name: 'Apple', color: '#a3a3a3', emoji: '🍎' },
  { symbol: 'NVDA', name: 'Nvidia', color: '#76b900', emoji: '🎮' },
  { symbol: 'NKE', name: 'Nike', color: '#f97316', emoji: '👟' },
  { symbol: 'RBLX', name: 'Roblox', color: '#e11d48', emoji: '🎲' },
];

/* ── Grading logic for Report Card ── */

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface SubjectGrade {
  subject: string;
  description: string;
  grade: Grade;
  value: string;
  reason: string;
}

function letterFromScore(score: number): Grade {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function gradeStock(data: StockData): SubjectGrade[] {
  // Making Money — profit margin
  const profitScore = data.profitMargin > 0.25 ? 95
    : data.profitMargin > 0.15 ? 80
    : data.profitMargin > 0.05 ? 65
    : data.profitMargin > 0 ? 45 : 20;

  // Growth — revenue growth
  const growthScore = data.revenueGrowth > 0.2 ? 95
    : data.revenueGrowth > 0.1 ? 80
    : data.revenueGrowth > 0.05 ? 65
    : data.revenueGrowth > 0 ? 50 : 25;

  // Value — P/E ratio (lower is better, but not negative)
  const valueScore = data.pe <= 0 ? 30
    : data.pe < 15 ? 95
    : data.pe < 25 ? 80
    : data.pe < 40 ? 60
    : data.pe < 60 ? 40 : 20;

  // Popularity — market cap
  const popScore = data.marketCap > 1e12 ? 95
    : data.marketCap > 100e9 ? 80
    : data.marketCap > 10e9 ? 65
    : data.marketCap > 1e9 ? 50 : 35;

  // Safety — debt to equity (lower is better)
  const safetyScore = data.debtToEquity < 0.3 ? 95
    : data.debtToEquity < 0.8 ? 80
    : data.debtToEquity < 1.5 ? 60
    : data.debtToEquity < 3 ? 40 : 20;

  return [
    {
      subject: 'Making Money',
      description: 'How much profit does this company keep?',
      grade: letterFromScore(profitScore),
      value: `${(data.profitMargin * 100).toFixed(1)}% profit margin`,
      reason: data.profitMargin > 0.15
        ? 'This company keeps a lot of money from each sale!'
        : data.profitMargin > 0
        ? 'This company makes some profit, but could do better.'
        : 'This company is losing money right now.',
    },
    {
      subject: 'Growth',
      description: 'Is this company getting bigger?',
      grade: letterFromScore(growthScore),
      value: `${(data.revenueGrowth * 100).toFixed(1)}% revenue growth`,
      reason: data.revenueGrowth > 0.1
        ? 'Growing fast — more people are buying their stuff!'
        : data.revenueGrowth > 0
        ? 'Growing slowly but steadily.'
        : 'Revenue is shrinking — fewer sales than before.',
    },
    {
      subject: 'Value',
      description: 'Is the stock price fair for what you get?',
      grade: letterFromScore(valueScore),
      value: data.pe > 0 ? `P/E ratio: ${data.pe.toFixed(1)}` : 'Not profitable (no P/E)',
      reason: data.pe > 0 && data.pe < 25
        ? 'Looks like a fair price for the earnings!'
        : data.pe >= 25
        ? 'Investors are paying a premium — they expect big things.'
        : 'Hard to judge value when the company isn\'t profitable.',
    },
    {
      subject: 'Popularity',
      description: 'How big and well-known is this company?',
      grade: letterFromScore(popScore),
      value: formatMarketCap(data.marketCap),
      reason: data.marketCap > 100e9
        ? 'A giant company that almost everyone knows!'
        : data.marketCap > 10e9
        ? 'A well-known company, but not the biggest.'
        : 'A smaller company — could grow, but also riskier.',
    },
    {
      subject: 'Safety',
      description: 'How much debt does this company have?',
      grade: letterFromScore(safetyScore),
      value: `Debt-to-equity: ${data.debtToEquity.toFixed(2)}`,
      reason: data.debtToEquity < 0.8
        ? 'Low debt — this company is financially healthy!'
        : data.debtToEquity < 1.5
        ? 'Moderate debt — pretty normal for most companies.'
        : 'High debt — this company owes a lot of money.',
    },
  ];
}

export function gradeToGPA(grade: Grade): number {
  switch (grade) {
    case 'A': return 4.0;
    case 'B': return 3.0;
    case 'C': return 2.0;
    case 'D': return 1.0;
    case 'F': return 0.0;
  }
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(0)}M`;
  return `$${cap.toLocaleString()}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatLargeNumber(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

/* ── In-memory cache ── */

const cache = new Map<string, { data: StockData; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached(symbol: string): StockData | null {
  const entry = cache.get(symbol);
  if (entry && Date.now() < entry.expires) return entry.data;
  cache.delete(symbol);
  return null;
}

export function setCache(symbol: string, data: StockData): void {
  cache.set(symbol, { data, expires: Date.now() + CACHE_TTL });
}
