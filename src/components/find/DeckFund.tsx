'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { BatchStockData } from '@/lib/filters';
import { StockCard } from './StockCard';

interface DeckFundProps {
  deckStocks: BatchStockData[];
  onRemove: (symbol: string) => void;
  onCompare: (symbols: string[]) => void;
}

const MAX_DECK = 5;
const ROTATIONS = [-8, -4, 0, 4, 8];

interface HistoryPoint {
  date: string;
  value: number;
}

export function DeckFund({ deckStocks, onRemove, onCompare }: DeckFundProps) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const avgGpa = useMemo(() => {
    if (deckStocks.length === 0) return 0;
    return deckStocks.reduce((s, d) => s + d.gpa, 0) / deckStocks.length;
  }, [deckStocks]);

  // Fetch 30-day history when deck changes
  useEffect(() => {
    if (deckStocks.length < 2) {
      setHistory([]);
      return;
    }

    const symbols = deckStocks.map(s => s.symbol).join(',');
    setHistoryLoading(true);

    fetch(`/api/stock/history?symbols=${symbols}&days=30`)
      .then(res => res.json())
      .then((rows: { symbol: string; date: string; price: number }[]) => {
        // Compute equal-weight portfolio value per day
        const byDate = new Map<string, Map<string, number>>();
        for (const row of rows) {
          if (!byDate.has(row.date)) byDate.set(row.date, new Map());
          byDate.get(row.date)!.set(row.symbol, row.price);
        }

        // Normalize: day 1 = 100
        const dates = [...byDate.keys()].sort();
        if (dates.length === 0) { setHistory([]); return; }

        const firstPrices = byDate.get(dates[0])!;
        const points: HistoryPoint[] = dates.map(date => {
          const prices = byDate.get(date)!;
          let totalReturn = 0;
          let count = 0;

          for (const [sym, price] of prices) {
            const base = firstPrices.get(sym);
            if (base && base > 0) {
              totalReturn += price / base;
              count++;
            }
          }

          return {
            date,
            value: count > 0 ? (totalReturn / count) * 100 : 100,
          };
        });

        setHistory(points);
      })
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [deckStocks]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg/90 backdrop-blur-md border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-end gap-4">
          {/* Card slots */}
          <div className="flex items-end gap-[-8px] min-w-0">
            <AnimatePresence>
              {deckStocks.map((stock, i) => (
                <div key={stock.symbol} className="-ml-2 first:ml-0">
                  <StockCard
                    stock={stock}
                    variant="compact"
                    rotation={ROTATIONS[i] ?? 0}
                    onRemove={() => onRemove(stock.symbol)}
                  />
                </div>
              ))}
            </AnimatePresence>

            {/* Empty slots */}
            {Array.from({ length: MAX_DECK - deckStocks.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="-ml-2 first:ml-0 w-[72px] h-[96px] rounded-xl
                  border-2 border-dashed border-border/40
                  flex items-center justify-center text-text-tertiary text-lg"
                style={{ transform: `rotate(${ROTATIONS[deckStocks.length + i] ?? 0}deg)` }}
              >
                +
              </div>
            ))}
          </div>

          {/* Fund stats + chart */}
          {deckStocks.length >= 2 && (
            <div className="flex-1 flex items-center gap-4 min-w-0">
              {/* Mini chart */}
              <div className="flex-1 h-[60px] min-w-[120px] max-w-[300px]">
                {historyLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : history.length > 1 ? (
                  <MiniChart data={history} />
                ) : (
                  <div className="h-full flex items-center justify-center text-[10px] text-text-tertiary">
                    No history yet
                  </div>
                )}
              </div>

              {/* Fund info */}
              <div className="text-right shrink-0">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Your Fund</div>
                <div className="font-mono font-bold text-sm text-text">
                  GPA {avgGpa.toFixed(1)}
                </div>
                {history.length > 1 && (
                  <div className={`text-[11px] font-mono ${
                    history[history.length - 1].value >= 100 ? 'text-green' : 'text-rose'
                  }`}>
                    {history[history.length - 1].value >= 100 ? '+' : ''}
                    {(history[history.length - 1].value - 100).toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Compare button */}
              <button
                onClick={() => onCompare(deckStocks.map(s => s.symbol))}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium shrink-0
                  bg-accent/15 border border-accent/25 text-accent
                  hover:bg-accent/25 transition-colors"
              >
                Compare
              </button>
            </div>
          )}

          {deckStocks.length < 2 && deckStocks.length > 0 && (
            <div className="text-[11px] text-text-tertiary">
              Add {2 - deckStocks.length} more to build your fund
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Lightweight SVG line chart */
function MiniChart({ data }: { data: HistoryPoint[] }) {
  const width = 280;
  const height = 55;
  const padding = 2;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.value - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const lastValue = values[values.length - 1];
  const isUp = lastValue >= 100;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {/* Baseline at 100 */}
      <line
        x1={padding}
        y1={height - padding - ((100 - min) / range) * (height - 2 * padding)}
        x2={width - padding}
        y2={height - padding - ((100 - min) / range) * (height - 2 * padding)}
        stroke="rgba(255,255,255,0.08)"
        strokeDasharray="4,4"
      />
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? '#34d399' : '#f87171'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
