/* ── Industry-Aware Grading Engine (7 subjects, 4.0 GPA scale) ── */

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface SubjectGrade {
  subject: string;
  grade: Grade;
  value: string;
  reason: string;
}

export interface SubjectMeta {
  key: string;
  label: string;
  emoji: string;
  question: string;   // kid-friendly "what does this measure?"
  tooltip: string;     // educational explanation
}

export const SUBJECTS: SubjectMeta[] = [
  {
    key: 'making_money',
    label: 'Making Money',
    emoji: '💰',
    question: 'How much profit do they keep?',
    tooltip: 'Profit margin = how much money the company keeps from every dollar it earns. If they sell a $10 toy and keep $3, their margin is 30%. Higher is better!',
  },
  {
    key: 'growth',
    label: 'Growth',
    emoji: '📈',
    question: 'Are they selling more than last year?',
    tooltip: 'Revenue growth = is the company making more money this year vs last year? A company growing 20% is selling way more stuff. Fast growth is exciting but hard to keep up.',
  },
  {
    key: 'value',
    label: 'Value',
    emoji: '🏷️',
    question: 'Is the price fair for what you get?',
    tooltip: 'P/E ratio = how many dollars you pay for each $1 the company earns. A P/E of 20 means you pay $20 for every $1 of profit. Lower usually means cheaper — but it depends on the industry!',
  },
  {
    key: 'popularity',
    label: 'Popularity',
    emoji: '⭐',
    question: 'How big and well-known is this company?',
    tooltip: 'Market cap = the total value of all the company\'s shares. Apple is worth $3 trillion — that\'s a mega-cap! Bigger companies are usually safer but grow slower.',
  },
  {
    key: 'safety',
    label: 'Safety',
    emoji: '🛡️',
    question: 'How much do they owe?',
    tooltip: 'Debt-to-equity = how much the company owes compared to what it owns. Like if you had $100 and owed $50, your ratio is 0.5. Lower debt = safer company!',
  },
  {
    key: 'dividend',
    label: 'Dividend',
    emoji: '🎁',
    question: 'Do they share profits with you?',
    tooltip: 'Dividend yield = the yearly cash payment you get just for owning the stock, as a % of the price. A 3% yield on a $100 stock = $3/year. It\'s like getting an allowance!',
  },
  {
    key: 'momentum',
    label: 'Momentum',
    emoji: '🚀',
    question: 'Is the stock price going up lately?',
    tooltip: '52-week price change = how much the stock price went up or down over the past year. +30% means it went up a lot! But past performance doesn\'t guarantee future results.',
  },
];

/* ── Sector-specific grading thresholds ── */

interface Thresholds {
  a: number;
  b: number;
  c: number;
  d: number;
}

// For "lower is better" metrics (P/E, debt), thresholds are inverted
type SectorThresholds = Record<string, Thresholds>;

// Profit margin thresholds by sector
const MARGIN_THRESHOLDS: SectorThresholds = {
  'Technology':             { a: 0.25, b: 0.15, c: 0.05, d: 0 },
  'Healthcare':             { a: 0.20, b: 0.12, c: 0.05, d: 0 },
  'Financial Services':     { a: 0.30, b: 0.20, c: 0.10, d: 0 },
  'Consumer Discretionary': { a: 0.15, b: 0.08, c: 0.03, d: 0 },
  'Consumer Staples':       { a: 0.15, b: 0.10, c: 0.05, d: 0 },
  'Energy':                 { a: 0.15, b: 0.08, c: 0.03, d: 0 },
  'Industrials':            { a: 0.12, b: 0.08, c: 0.04, d: 0 },
  'Communication Services': { a: 0.20, b: 0.12, c: 0.05, d: 0 },
  'Real Estate':            { a: 0.30, b: 0.20, c: 0.10, d: 0 },
  'Materials':              { a: 0.15, b: 0.10, c: 0.05, d: 0 },
  'Utilities':              { a: 0.15, b: 0.10, c: 0.05, d: 0 },
  _default:                 { a: 0.20, b: 0.12, c: 0.05, d: 0 },
};

// Revenue growth thresholds by sector
const GROWTH_THRESHOLDS: SectorThresholds = {
  'Technology':             { a: 0.20, b: 0.10, c: 0.05, d: 0 },
  'Healthcare':             { a: 0.15, b: 0.08, c: 0.03, d: 0 },
  'Financial Services':     { a: 0.12, b: 0.06, c: 0.02, d: 0 },
  'Consumer Discretionary': { a: 0.15, b: 0.08, c: 0.03, d: 0 },
  'Consumer Staples':       { a: 0.08, b: 0.04, c: 0.01, d: 0 },
  'Energy':                 { a: 0.15, b: 0.08, c: 0.02, d: -0.05 },
  'Industrials':            { a: 0.12, b: 0.06, c: 0.02, d: 0 },
  'Communication Services': { a: 0.15, b: 0.08, c: 0.03, d: 0 },
  'Real Estate':            { a: 0.10, b: 0.05, c: 0.02, d: 0 },
  'Materials':              { a: 0.12, b: 0.06, c: 0.02, d: 0 },
  'Utilities':              { a: 0.08, b: 0.04, c: 0.01, d: 0 },
  _default:                 { a: 0.15, b: 0.08, c: 0.03, d: 0 },
};

// P/E ratio thresholds (lower is better) by sector
const PE_THRESHOLDS: SectorThresholds = {
  'Technology':             { a: 25, b: 35, c: 50, d: 70 },
  'Healthcare':             { a: 20, b: 30, c: 45, d: 60 },
  'Financial Services':     { a: 12, b: 18, c: 25, d: 35 },
  'Consumer Discretionary': { a: 18, b: 25, c: 35, d: 50 },
  'Consumer Staples':       { a: 18, b: 24, c: 30, d: 40 },
  'Energy':                 { a: 10, b: 15, c: 22, d: 30 },
  'Industrials':            { a: 15, b: 22, c: 30, d: 40 },
  'Communication Services': { a: 18, b: 25, c: 35, d: 50 },
  'Real Estate':            { a: 20, b: 30, c: 40, d: 55 },
  'Materials':              { a: 14, b: 20, c: 28, d: 38 },
  'Utilities':              { a: 15, b: 20, c: 28, d: 35 },
  _default:                 { a: 18, b: 28, c: 40, d: 55 },
};

// Debt-to-equity thresholds (lower is better) by sector
const DEBT_THRESHOLDS: SectorThresholds = {
  'Technology':             { a: 0.5, b: 1.0, c: 2.0, d: 3.5 },
  'Healthcare':             { a: 0.6, b: 1.2, c: 2.0, d: 3.5 },
  'Financial Services':     { a: 2.0, b: 4.0, c: 8.0, d: 12.0 }, // Banks naturally carry more debt
  'Consumer Discretionary': { a: 0.5, b: 1.0, c: 2.0, d: 3.0 },
  'Consumer Staples':       { a: 0.8, b: 1.5, c: 2.5, d: 4.0 },
  'Energy':                 { a: 0.4, b: 0.8, c: 1.5, d: 2.5 },
  'Industrials':            { a: 0.5, b: 1.0, c: 2.0, d: 3.0 },
  'Communication Services': { a: 0.8, b: 1.5, c: 2.5, d: 4.0 },
  'Real Estate':            { a: 1.0, b: 2.0, c: 3.5, d: 5.0 }, // REITs carry more debt
  'Materials':              { a: 0.4, b: 0.8, c: 1.5, d: 2.5 },
  'Utilities':              { a: 1.0, b: 1.5, c: 2.5, d: 4.0 }, // Utilities naturally leverage
  _default:                 { a: 0.5, b: 1.0, c: 2.0, d: 3.5 },
};

// Dividend yield thresholds by sector
const DIVIDEND_THRESHOLDS: SectorThresholds = {
  'Technology':             { a: 1.5, b: 0.8, c: 0.3, d: 0 },
  'Healthcare':             { a: 2.0, b: 1.2, c: 0.5, d: 0 },
  'Financial Services':     { a: 3.0, b: 2.0, c: 1.0, d: 0 },
  'Consumer Discretionary': { a: 2.0, b: 1.2, c: 0.5, d: 0 },
  'Consumer Staples':       { a: 3.0, b: 2.0, c: 1.0, d: 0 },
  'Energy':                 { a: 4.0, b: 3.0, c: 1.5, d: 0 },
  'Industrials':            { a: 2.5, b: 1.5, c: 0.8, d: 0 },
  'Communication Services': { a: 2.0, b: 1.2, c: 0.5, d: 0 },
  'Real Estate':            { a: 5.0, b: 3.5, c: 2.0, d: 0 },
  'Materials':              { a: 2.5, b: 1.5, c: 0.8, d: 0 },
  'Utilities':              { a: 4.0, b: 3.0, c: 2.0, d: 0 },
  _default:                 { a: 2.5, b: 1.5, c: 0.8, d: 0 },
};

// Momentum (52w price change) — universal across sectors
const MOMENTUM_THRESHOLDS: Thresholds = { a: 0.30, b: 0.15, c: 0, d: -0.15 };

// Market cap — universal across sectors
const MARKETCAP_THRESHOLDS: Thresholds = { a: 200e9, b: 50e9, c: 10e9, d: 2e9 };

/* ── Grading Functions ── */

function getThresholds(table: SectorThresholds, sector: string): Thresholds {
  return table[sector] ?? table._default;
}

/** Grade a "higher is better" metric */
function gradeHigherBetter(value: number, t: Thresholds): Grade {
  if (value >= t.a) return 'A';
  if (value >= t.b) return 'B';
  if (value >= t.c) return 'C';
  if (value >= t.d) return 'D';
  return 'F';
}

/** Grade a "lower is better" metric (P/E, debt) */
function gradeLowerBetter(value: number, t: Thresholds): Grade {
  if (value <= 0) return 'D'; // negative P/E or missing data
  if (value <= t.a) return 'A';
  if (value <= t.b) return 'B';
  if (value <= t.c) return 'C';
  if (value <= t.d) return 'D';
  return 'F';
}

export interface GradingInput {
  profitMargin: number;
  revenueGrowth: number;
  pe: number;
  marketCap: number;
  debtToEquity: number;
  dividendYield: number;
  priceChange52w: number;
}

export interface CustomThresholds {
  [subjectKey: string]: Thresholds;
}

/**
 * Grade a stock on all 7 subjects using industry-specific thresholds.
 * Optionally accepts custom thresholds (for "Let me grade" feature).
 */
export function gradeStockFull(
  data: GradingInput,
  sector: string,
  custom?: CustomThresholds,
): SubjectGrade[] {
  const marginT = custom?.making_money ?? getThresholds(MARGIN_THRESHOLDS, sector);
  const growthT = custom?.growth ?? getThresholds(GROWTH_THRESHOLDS, sector);
  const peT = custom?.value ?? getThresholds(PE_THRESHOLDS, sector);
  const capT = custom?.popularity ?? MARKETCAP_THRESHOLDS;
  const debtT = custom?.safety ?? getThresholds(DEBT_THRESHOLDS, sector);
  const divT = custom?.dividend ?? getThresholds(DIVIDEND_THRESHOLDS, sector);
  const momT = custom?.momentum ?? MOMENTUM_THRESHOLDS;

  return [
    {
      subject: 'Making Money',
      grade: gradeHigherBetter(data.profitMargin, marginT),
      value: `${(data.profitMargin * 100).toFixed(1)}% margin`,
      reason: data.profitMargin > marginT.b
        ? 'Great at keeping money from each sale!'
        : data.profitMargin > 0
        ? 'Makes some profit, room to grow.'
        : 'Losing money right now.',
    },
    {
      subject: 'Growth',
      grade: gradeHigherBetter(data.revenueGrowth, growthT),
      value: `${(data.revenueGrowth * 100).toFixed(1)}% growth`,
      reason: data.revenueGrowth > growthT.b
        ? 'Growing fast — selling more and more!'
        : data.revenueGrowth > 0
        ? 'Growing steadily.'
        : 'Sales are shrinking.',
    },
    {
      subject: 'Value',
      grade: data.pe > 0 ? gradeLowerBetter(data.pe, peT) : 'D' as Grade,
      value: data.pe > 0 ? `P/E ${data.pe.toFixed(1)}` : 'No earnings',
      reason: data.pe > 0 && data.pe <= peT.b
        ? 'Looks fairly priced for this industry!'
        : data.pe > peT.c
        ? 'Pricey — investors expect big things.'
        : 'Hard to value without profits.',
    },
    {
      subject: 'Popularity',
      grade: gradeHigherBetter(data.marketCap, capT),
      value: formatCap(data.marketCap),
      reason: data.marketCap > capT.b
        ? 'A well-known giant!'
        : data.marketCap > capT.d
        ? 'Mid-size company with room to grow.'
        : 'A smaller company — more risk, more potential.',
    },
    {
      subject: 'Safety',
      grade: gradeLowerBetter(data.debtToEquity, debtT),
      value: `D/E ${data.debtToEquity.toFixed(2)}`,
      reason: data.debtToEquity <= debtT.b
        ? 'Low debt — financially healthy!'
        : data.debtToEquity <= debtT.c
        ? 'Normal debt for this industry.'
        : 'High debt — owes a lot.',
    },
    {
      subject: 'Dividend',
      grade: gradeHigherBetter(data.dividendYield, divT),
      value: data.dividendYield > 0 ? `${data.dividendYield.toFixed(2)}% yield` : 'No dividend',
      reason: data.dividendYield >= divT.b
        ? 'Nice cash payments to shareholders!'
        : data.dividendYield > 0
        ? 'Small dividend — some cash back.'
        : 'Doesn\'t pay dividends yet.',
    },
    {
      subject: 'Momentum',
      grade: gradeHigherBetter(data.priceChange52w, momT),
      value: `${(data.priceChange52w * 100).toFixed(1)}% this year`,
      reason: data.priceChange52w > momT.b
        ? 'Stock price is climbing!'
        : data.priceChange52w > 0
        ? 'Slight upward trend.'
        : 'Price has been falling.',
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

export function computeGPA(grades: SubjectGrade[]): number {
  if (grades.length === 0) return 0;
  return grades.reduce((sum, g) => sum + gradeToGPA(g.grade), 0) / grades.length;
}

function formatCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(0)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(0)}M`;
  return `$${cap.toLocaleString()}`;
}
