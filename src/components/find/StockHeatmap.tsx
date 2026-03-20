'use client';

import { useMemo } from 'react';
import type { BatchStockData, FocusType } from '@/lib/filters';
import { HeatmapCell } from './HeatmapCell';
import { SECTORS } from '@/lib/universe';

interface StockHeatmapProps {
  allStocks: BatchStockData[];
  filteredSymbols: Set<string>;
  colorMode: 'change' | 'gpa';
  focus: FocusType | null;
  selectedSymbol: string | null;
  onSelectStock: (symbol: string) => void;
  activeSector: string | null;
}

export function StockHeatmap({
  allStocks,
  filteredSymbols,
  colorMode,
  focus,
  selectedSymbol,
  onSelectStock,
  activeSector,
}: StockHeatmapProps) {
  // Group stocks by sector, sorted by market cap within each
  const grouped = useMemo(() => {
    const sectors = activeSector ? [activeSector] : SECTORS;
    const groups: { sector: string; stocks: BatchStockData[] }[] = [];

    for (const sector of sectors) {
      const sectorStocks = allStocks
        .filter(s => s.sector === sector)
        .sort((a, b) => b.marketCap - a.marketCap);

      if (sectorStocks.length > 0) {
        groups.push({ sector, stocks: sectorStocks });
      }
    }
    return groups;
  }, [allStocks, activeSector]);

  const getCellSize = (marketCap: number): 'sm' | 'md' | 'lg' => {
    if (marketCap > 200e9) return 'lg';
    if (marketCap > 20e9) return 'md';
    return 'sm';
  };

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

  return (
    <div className="space-y-4">
      {grouped.map(group => (
        <div key={group.sector}>
          <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-1.5 block">
            {group.sector}
          </span>
          <div className="flex flex-wrap gap-1">
            {group.stocks.map(stock => (
              <HeatmapCell
                key={stock.symbol}
                stock={stock}
                colorMode={colorMode}
                focus={focus}
                matched={filteredSymbols.has(stock.symbol)}
                selected={selectedSymbol === stock.symbol}
                onSelect={onSelectStock}
                size={getCellSize(stock.marketCap)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
