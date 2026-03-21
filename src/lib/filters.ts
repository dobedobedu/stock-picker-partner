/* ── Filter model for the Find page ── */

import type { Grade } from './grading';
import { gradeToGPA } from './grading';

export interface BatchStockData {
  symbol: string;
  name: string;
  emoji: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  pe: number;
  revenueGrowth: number;
  profitMargin: number;
  debtToEquity: number;
  dividendYield: number;
  priceChange52w: number;
  gpa: number;
  grades: { subject: string; grade: Grade; value: string; reason: string }[];
}

export type SizeCategory = 'mega' | 'large' | 'mid' | 'small';
export type FocusType = 'growth' | 'value' | 'dividend' | 'momentum';

export interface FilterState {
  sector: string | null;
  sizeCategory: SizeCategory | null;
  focus: FocusType | null;
  subjectMinGrade: Record<string, Grade | null>;
  minGpa: number;
}

export const INITIAL_FILTER_STATE: FilterState = {
  sector: null,
  sizeCategory: null,
  focus: null,
  subjectMinGrade: {},
  minGpa: 0,
};

export const SIZE_CATEGORIES: { id: SizeCategory; label: string; emoji: string; tooltip: string; min: number; max: number }[] = [
  { id: 'mega', label: 'Mega', emoji: '🏔', tooltip: 'Worth over $200 billion — the biggest companies in the world!', min: 200e9, max: Infinity },
  { id: 'large', label: 'Large', emoji: '🏢', tooltip: 'Worth $10B–$200B — big and well-known companies.', min: 10e9, max: 200e9 },
  { id: 'mid', label: 'Mid', emoji: '🏠', tooltip: 'Worth $2B–$10B — growing companies with potential.', min: 2e9, max: 10e9 },
  { id: 'small', label: 'Small', emoji: '🌱', tooltip: 'Worth under $2B — smaller and riskier, but could grow fast!', min: 0, max: 2e9 },
];

export const FOCUS_OPTIONS: { id: FocusType; label: string; emoji: string; subject: string; tooltip: string }[] = [
  { id: 'growth', label: 'Growth', emoji: '📈', subject: 'Growth', tooltip: 'Find companies that are growing fast — selling more every year.' },
  { id: 'value', label: 'Value', emoji: '🏷️', subject: 'Value', tooltip: 'Find companies with a fair price — not too expensive for what you get.' },
  { id: 'dividend', label: 'Dividend', emoji: '🎁', subject: 'Dividend', tooltip: 'Find companies that share profits with you — cash in your pocket!' },
  { id: 'momentum', label: 'Momentum', emoji: '🚀', subject: 'Momentum', tooltip: 'Find companies whose stock price has been going up recently.' },
];

const GRADE_ORDER: Grade[] = ['A', 'B', 'C', 'D', 'F'];

function gradeAtLeast(grade: Grade, minimum: Grade): boolean {
  return GRADE_ORDER.indexOf(grade) <= GRADE_ORDER.indexOf(minimum);
}

/** Apply all filters to the stock list */
export function applyFilters(stocks: BatchStockData[], filters: FilterState): BatchStockData[] {
  return stocks.filter(stock => {
    // Sector filter
    if (filters.sector && stock.sector !== filters.sector) return false;

    // Size filter
    if (filters.sizeCategory) {
      const size = SIZE_CATEGORIES.find(s => s.id === filters.sizeCategory);
      if (size && (stock.marketCap < size.min || stock.marketCap >= size.max)) return false;
    }

    // GPA minimum
    if (filters.minGpa > 0 && stock.gpa < filters.minGpa) return false;

    // Subject grade filters
    for (const [subject, minGrade] of Object.entries(filters.subjectMinGrade)) {
      if (!minGrade) continue;
      const stockGrade = stock.grades.find(g => g.subject === subject);
      if (stockGrade && !gradeAtLeast(stockGrade.grade, minGrade)) return false;
    }

    return true;
  });
}

/** Convert filter state to a natural language query for A2UI */
export function filterStateToQuery(filters: FilterState, stockCount: number): string {
  const parts: string[] = [];

  if (filters.sector) parts.push(`Sector: ${filters.sector}`);
  if (filters.sizeCategory) {
    const size = SIZE_CATEGORIES.find(s => s.id === filters.sizeCategory);
    if (size) parts.push(`Size: ${size.label}-cap`);
  }
  if (filters.focus) {
    const focus = FOCUS_OPTIONS.find(f => f.id === filters.focus);
    if (focus) parts.push(`Focus: ${focus.label}`);
  }

  for (const [subject, grade] of Object.entries(filters.subjectMinGrade)) {
    if (grade) parts.push(`${subject}: ${grade} or better`);
  }

  if (filters.minGpa > 0) parts.push(`Minimum GPA: ${filters.minGpa.toFixed(1)}`);

  parts.push(`${stockCount} stocks match.`);
  parts.push('Rank by GPA and explain why each stock earned its grades.');

  return parts.join('. ');
}

/** Get the focus subject's grade for a stock */
export function getFocusGrade(stock: BatchStockData, focus: FocusType | null): Grade | null {
  if (!focus) return null;
  const focusOpt = FOCUS_OPTIONS.find(f => f.id === focus);
  if (!focusOpt) return null;
  const grade = stock.grades.find(g => g.subject === focusOpt.subject);
  return grade?.grade ?? null;
}
