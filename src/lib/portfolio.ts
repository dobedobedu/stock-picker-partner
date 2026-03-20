/* ── Portfolio: 3-5 slots with grade snapshots, localStorage ── */

import type { Grade } from './stock';

export const MAX_SLOTS = 5;

export interface PortfolioGrade {
  subject: string;
  grade: Grade;
}

export interface PortfolioSlot {
  symbol: string;
  name: string;
  emoji: string;
  sector: string;
  gpa: number;
  grades: PortfolioGrade[];
  addedAt: number;
  lastRefreshed: number;
}

export interface GradeChange {
  symbol: string;
  name: string;
  subject: string;
  from: Grade;
  to: Grade;
  timestamp: number;
}

const STORAGE_KEY = 'stock-literacy-portfolio';
const ALERTS_KEY = 'stock-literacy-grade-alerts';

export function loadPortfolio(): PortfolioSlot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePortfolio(slots: PortfolioSlot[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
}

export function addToPortfolio(slot: PortfolioSlot): PortfolioSlot[] {
  const current = loadPortfolio();
  if (current.length >= MAX_SLOTS) return current;
  if (current.some(s => s.symbol === slot.symbol)) return current;
  const updated = [...current, slot];
  savePortfolio(updated);
  return updated;
}

export function removeFromPortfolio(symbol: string): PortfolioSlot[] {
  const current = loadPortfolio();
  const updated = current.filter(s => s.symbol !== symbol);
  savePortfolio(updated);
  return updated;
}

export function updatePortfolioSlot(symbol: string, updates: Partial<PortfolioSlot>): PortfolioSlot[] {
  const current = loadPortfolio();
  const updated = current.map(s => s.symbol === symbol ? { ...s, ...updates } : s);
  savePortfolio(updated);
  return updated;
}

export function detectGradeChanges(
  symbol: string,
  name: string,
  oldGrades: PortfolioGrade[],
  newGrades: PortfolioGrade[],
): GradeChange[] {
  const changes: GradeChange[] = [];
  for (const newG of newGrades) {
    const oldG = oldGrades.find(g => g.subject === newG.subject);
    if (oldG && oldG.grade !== newG.grade) {
      changes.push({
        symbol,
        name,
        subject: newG.subject,
        from: oldG.grade,
        to: newG.grade,
        timestamp: Date.now(),
      });
    }
  }
  return changes;
}

export function loadAlerts(): GradeChange[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: GradeChange[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

export function clearAlerts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ALERTS_KEY);
}
