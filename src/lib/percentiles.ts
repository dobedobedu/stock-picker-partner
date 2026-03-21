/* ── Sector percentile computation for Evaluate tab ── */

import type { BatchStockData } from './filters';

export interface PercentileResult {
  rank: number;        // 1-based rank in sector (1 = best)
  total: number;       // total stocks in sector
  percentile: number;  // 0-100, higher is always better
  sectorAvg: number;   // average value in sector
}

/**
 * Compute a stock's percentile within its sector for a given metric.
 * @param value - the stock's metric value
 * @param allValues - all values in the sector for this metric
 * @param lowerIsBetter - true for P/E, debt-to-equity
 */
export function computePercentile(
  value: number,
  allValues: number[],
  lowerIsBetter: boolean,
): PercentileResult {
  const sorted = [...allValues].sort((a, b) =>
    lowerIsBetter ? a - b : b - a
  );
  const rank = sorted.indexOf(value) + 1 || Math.ceil(sorted.length / 2);
  const total = sorted.length;
  const percentile = total > 1 ? Math.round(((total - rank) / (total - 1)) * 100) : 50;
  const sectorAvg = allValues.length > 0
    ? allValues.reduce((s, v) => s + v, 0) / allValues.length
    : 0;

  return { rank, total, percentile, sectorAvg };
}

export interface SubjectPercentile {
  subject: string;
  emoji: string;
  grade: string;
  metricLabel: string;
  metricValue: string;
  rawValue: number;
  percentile: number;
  sectorAvg: number;
  sectorAvgFormatted: string;
  rank: number;
  total: number;
  explanation: string;
  lowerIsBetter: boolean;
}

/** Subject-to-metric mapping */
const SUBJECT_METRICS: {
  subject: string;
  emoji: string;
  field: keyof BatchStockData;
  lowerIsBetter: boolean;
  format: (v: number) => string;
  label: (v: number) => string;
  explain: (name: string, v: number, pct: number, sector: string) => string;
}[] = [
  {
    subject: 'Making Money',
    emoji: '💰',
    field: 'profitMargin',
    lowerIsBetter: false,
    format: v => `${(v * 100).toFixed(1)}%`,
    label: () => 'profit margin',
    explain: (name, v, pct, sector) =>
      `${name} keeps ${(v * 100).toFixed(0)}¢ of every dollar it earns. That's better than ${pct}% of ${sector} companies.`,
  },
  {
    subject: 'Growth',
    emoji: '📈',
    field: 'revenueGrowth',
    lowerIsBetter: false,
    format: v => `${(v * 100).toFixed(1)}%`,
    label: () => 'revenue growth',
    explain: (name, v, pct, sector) =>
      v > 0
        ? `${name}'s revenue grew ${(v * 100).toFixed(0)}% — faster than ${pct}% of ${sector} companies.`
        : `${name}'s revenue shrank ${(v * 100).toFixed(0)}%. Most ${sector} companies are doing better.`,
  },
  {
    subject: 'Value',
    emoji: '🏷️',
    field: 'pe',
    lowerIsBetter: true,
    format: v => v > 0 ? v.toFixed(1) : 'N/A',
    label: () => 'P/E ratio',
    explain: (name, v, pct, sector) =>
      v > 0
        ? `Investors pay $${v.toFixed(0)} for each $1 ${name} earns. That's cheaper than ${pct}% of ${sector} stocks.`
        : `${name} doesn't have positive earnings right now, so P/E isn't meaningful.`,
  },
  {
    subject: 'Popularity',
    emoji: '⭐',
    field: 'marketCap',
    lowerIsBetter: false,
    format: v => {
      if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
      if (v >= 1e9) return `$${(v / 1e9).toFixed(0)}B`;
      return `$${(v / 1e6).toFixed(0)}M`;
    },
    label: () => 'market cap',
    explain: (name, _v, pct, sector) =>
      `${name} is bigger than ${pct}% of ${sector} companies. Larger companies are usually more stable.`,
  },
  {
    subject: 'Safety',
    emoji: '🛡️',
    field: 'debtToEquity',
    lowerIsBetter: true,
    format: v => v.toFixed(2),
    label: () => 'debt-to-equity',
    explain: (name, v, pct, sector) =>
      v <= 1
        ? `${name} owes $${v.toFixed(2)} for every $1 it owns — safer than ${pct}% of ${sector} companies.`
        : `${name} carries more debt than average. It's safer than ${pct}% of ${sector} stocks.`,
  },
  {
    subject: 'Dividend',
    emoji: '🎁',
    field: 'dividendYield',
    lowerIsBetter: false,
    format: v => v > 0 ? `${v.toFixed(2)}%` : 'None',
    label: () => 'dividend yield',
    explain: (name, v, pct, sector) =>
      v > 0
        ? `${name} pays ${v.toFixed(2)}% back to shareholders each year — more than ${pct}% of ${sector} stocks.`
        : `${name} doesn't pay a dividend yet. It reinvests all profits back into the business.`,
  },
  {
    subject: 'Momentum',
    emoji: '🚀',
    field: 'priceChange52w',
    lowerIsBetter: false,
    format: v => `${(v * 100).toFixed(1)}%`,
    label: () => '52-week change',
    explain: (name, v, pct, sector) =>
      v >= 0
        ? `${name}'s stock is up ${(v * 100).toFixed(0)}% this year — beating ${pct}% of ${sector} stocks.`
        : `${name}'s stock is down ${(Math.abs(v) * 100).toFixed(0)}% this year. Only ${100 - pct}% of ${sector} stocks did worse.`,
  },
];

/**
 * Compute percentiles for all 7 subjects of a stock within its sector.
 */
export function computeAllPercentiles(
  stock: BatchStockData,
  allStocks: BatchStockData[],
): SubjectPercentile[] {
  const sectorStocks = allStocks.filter(s => s.sector === stock.sector);
  const stockGrades = stock.grades;

  return SUBJECT_METRICS.map(metric => {
    const rawValue = stock[metric.field] as number;
    const allValues = sectorStocks.map(s => s[metric.field] as number).filter(v => {
      if (metric.field === 'pe') return v > 0;
      return true;
    });

    const result = computePercentile(rawValue, allValues, metric.lowerIsBetter);
    const grade = stockGrades.find(g => g.subject === metric.subject);

    return {
      subject: metric.subject,
      emoji: metric.emoji,
      grade: grade?.grade ?? 'C',
      metricLabel: metric.label(rawValue),
      metricValue: metric.format(rawValue),
      rawValue,
      percentile: result.percentile,
      sectorAvg: result.sectorAvg,
      sectorAvgFormatted: metric.format(result.sectorAvg),
      rank: result.rank,
      total: result.total,
      explanation: metric.explain(stock.name, rawValue, result.percentile, stock.sector),
      lowerIsBetter: metric.lowerIsBetter,
    };
  });
}
