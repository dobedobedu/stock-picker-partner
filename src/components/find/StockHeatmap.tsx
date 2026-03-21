'use client';

import { useMemo } from 'react';
import type { BatchStockData, FocusType } from '@/lib/filters';
import { HeatmapCell, type ColorMode } from './HeatmapCell';
import { computePercentile } from '@/lib/percentiles';

/** Maps focus type to BatchStockData field + direction */
const FOCUS_METRIC: Record<string, { field: keyof BatchStockData; lowerIsBetter: boolean; label: string }> = {
  growth: { field: 'revenueGrowth', lowerIsBetter: false, label: 'revenue growth' },
  value: { field: 'pe', lowerIsBetter: true, label: 'P/E' },
  dividend: { field: 'dividendYield', lowerIsBetter: false, label: 'dividend yield' },
  momentum: { field: 'priceChange52w', lowerIsBetter: false, label: '52w momentum' },
};

interface StockHeatmapProps {
  allStocks: BatchStockData[];
  filteredSymbols: Set<string>;
  focus: FocusType | null;
  selectedSymbol: string | null;
  onSelectStock: (symbol: string) => void;
  allFiltersActive: boolean;
  activeSector: string | null;
  colorMode: ColorMode;
}

export function StockHeatmap({
  allStocks,
  filteredSymbols,
  focus,
  selectedSymbol,
  onSelectStock,
  allFiltersActive,
  activeSector,
  colorMode,
}: StockHeatmapProps) {
  // Flat list sorted by GPA descending
  const sorted = useMemo(
    () => [...allStocks].sort((a, b) => b.gpa - a.gpa),
    [allStocks],
  );

  // Pre-compute contextual percentiles when all filters active
  const contextualMap = useMemo(() => {
    if (!allFiltersActive || !focus || !activeSector) return null;

    const metric = FOCUS_METRIC[focus];
    if (!metric) return null;

    const sectorStocks = allStocks.filter(s => s.sector === activeSector);
    const allValues = sectorStocks
      .map(s => s[metric.field] as number)
      .filter(v => metric.field === 'pe' ? v > 0 : true);

    const map = new Map<string, { focusPercentile: number; focusLabel: string }>();
    for (const stock of sectorStocks) {
      const val = stock[metric.field] as number;
      const result = computePercentile(val, allValues, metric.lowerIsBetter);
      map.set(stock.symbol, {
        focusPercentile: result.percentile,
        focusLabel: `Top ${Math.max(1, 100 - result.percentile)}% ${metric.label} in ${activeSector}`,
      });
    }
    return map;
  }, [allFiltersActive, focus, activeSector, allStocks]);

  if (allStocks.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-text-secondary">Loading stocks...</p>
        </div>
      </div>
    );
  }

  const matchCount = sorted.filter(s => filteredSymbols.has(s.symbol)).length;

  return (
    <div className="space-y-2">
      {matchCount < allStocks.length && matchCount > 0 && (
        <div className="text-xs text-text-tertiary">
          {matchCount} of {allStocks.length} stocks highlighted
        </div>
      )}
      <div
        className="heatmap-grid grid gap-1"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))' }}
      >
        {sorted.map(stock => (
          <HeatmapCell
            key={stock.symbol}
            stock={stock}
            focus={focus}
            matched={filteredSymbols.has(stock.symbol)}
            selected={selectedSymbol === stock.symbol}
            colorMode={colorMode}
            onSelect={onSelectStock}
            contextual={contextualMap?.get(stock.symbol)}
          />
        ))}
      </div>
    </div>
  );
}
