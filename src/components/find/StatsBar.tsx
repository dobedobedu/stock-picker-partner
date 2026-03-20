'use client';

import type { BatchStockData } from '@/lib/filters';

interface StatsBarProps {
  filtered: BatchStockData[];
  total: number;
  onReset: () => void;
}

export function StatsBar({ filtered, total, onReset }: StatsBarProps) {
  if (filtered.length === 0 && total > 0) {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-rose/5 border border-rose/15 rounded-lg">
        <span className="text-xs text-rose">No stocks match your filters</span>
        <button
          onClick={onReset}
          className="text-[11px] text-accent hover:underline"
        >
          Reset filters
        </button>
      </div>
    );
  }

  const avgGpa = filtered.length > 0
    ? filtered.reduce((sum, s) => sum + s.gpa, 0) / filtered.length
    : 0;

  const topStock = filtered.length > 0
    ? filtered.reduce((best, s) => s.gpa > best.gpa ? s : best, filtered[0])
    : null;

  // Most common sector
  const sectorCounts = new Map<string, number>();
  for (const s of filtered) {
    sectorCounts.set(s.sector, (sectorCounts.get(s.sector) ?? 0) + 1);
  }
  const topSector = [...sectorCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-surface/50 backdrop-blur-sm
      border border-border rounded-lg text-[11px] text-text-secondary overflow-x-auto">
      <span>
        <span className="font-mono text-text font-medium">{filtered.length}</span>
        <span className="text-text-tertiary"> of {total}</span>
      </span>

      <span className="text-border">|</span>

      <span>
        Avg GPA <span className="font-mono text-text font-medium">{avgGpa.toFixed(1)}</span>
      </span>

      {topSector && (
        <>
          <span className="text-border">|</span>
          <span>
            Top: <span className="text-text">{topSector[0].replace('Consumer ', '').replace('Financial ', 'Fin. ')}</span>
            <span className="text-text-tertiary"> ({topSector[1]})</span>
          </span>
        </>
      )}

      {topStock && (
        <>
          <span className="text-border">|</span>
          <span>
            Best: <span className="font-mono text-text font-medium">{topStock.symbol}</span>
            <span className="text-text-tertiary"> ({topStock.gpa.toFixed(1)})</span>
          </span>
        </>
      )}
    </div>
  );
}
