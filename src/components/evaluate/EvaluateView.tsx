'use client';

import { useState, useMemo, useCallback } from 'react';
import { useBatchStocks } from '@/lib/hooks/useBatchStocks';
import { computeAllPercentiles } from '@/lib/percentiles';
import { TickerInput } from './TickerInput';
import { GradeCard } from './GradeCard';
import { gradeToColor } from '@/lib/heatmap-colors';
import type { Grade } from '@/lib/grading';
import type { BatchStockData } from '@/lib/filters';

interface EvaluateViewProps {
  onAddToDeck?: (symbol: string) => void;
}

export function EvaluateView({ onAddToDeck }: EvaluateViewProps) {
  const { stocks, loading } = useBatchStocks();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const selectedStock = useMemo(
    () => stocks.find(s => s.symbol === selectedSymbol) ?? null,
    [stocks, selectedSymbol],
  );

  const percentiles = useMemo(
    () => selectedStock ? computeAllPercentiles(selectedStock, stocks) : [],
    [selectedStock, stocks],
  );

  const handleSelect = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
  }, []);

  const gpaColor = selectedStock
    ? gradeToColor(
        selectedStock.gpa >= 3.5 ? 'A' :
        selectedStock.gpa >= 2.5 ? 'B' :
        selectedStock.gpa >= 1.5 ? 'C' : 'D' as Grade,
      )
    : '#888';

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div>
        <h3 className="text-base font-medium mb-1">Evaluate a stock</h3>
        <p className="text-sm text-text-secondary">
          Enter a ticker to see its full grade breakdown with sector percentiles.
        </p>
      </div>

      {/* Search */}
      <TickerInput onSelect={handleSelect} />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {selectedStock && !loading && (
        <div className="space-y-6">
          {/* Stock header */}
          <div className="flex items-center justify-between bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedStock.emoji}</span>
              <div>
                <div className="font-semibold text-text">{selectedStock.name}</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-text-secondary">{selectedStock.symbol}</span>
                  <span className="text-text-tertiary">·</span>
                  <span className="text-text-secondary">{selectedStock.sector}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-lg text-text">
                ${selectedStock.price.toFixed(2)}
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className={`font-mono text-sm ${
                  selectedStock.changePercent >= 0 ? 'text-green' : 'text-rose'
                }`}>
                  {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                </span>
                <span className="text-text-tertiary">·</span>
                <span className="font-mono font-bold" style={{ color: gpaColor }}>
                  GPA {selectedStock.gpa.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Grade cards grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {percentiles.map(p => (
              <GradeCard key={p.subject} data={p} />
            ))}
          </div>

          {/* Add to deck */}
          {onAddToDeck && (
            <button
              onClick={() => onAddToDeck(selectedStock.symbol)}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium
                bg-surface border border-border text-text
                hover:bg-surface-hover transition-colors"
            >
              Add {selectedStock.symbol} to Deck
            </button>
          )}
        </div>
      )}
    </div>
  );
}
