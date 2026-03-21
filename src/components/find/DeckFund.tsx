'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { BatchStockData } from '@/lib/filters';
import { gradeToColor } from '@/lib/heatmap-colors';
import type { Grade } from '@/lib/grading';

interface DeckFundProps {
  deckStocks: BatchStockData[];
  onRemove: (symbol: string) => void;
}

const MAX_DECK = 5;

interface HistoryPoint {
  date: string;
  value: number;
}

export function DeckFund({ deckStocks, onRemove }: DeckFundProps) {
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
        const byDate = new Map<string, Map<string, number>>();
        for (const row of rows) {
          if (!byDate.has(row.date)) byDate.set(row.date, new Map());
          byDate.get(row.date)!.set(row.symbol, row.price);
        }

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

  const returnPct = history.length > 1 ? history[history.length - 1].value - 100 : 0;
  const isUp = returnPct >= 0;

  return (
    <div className="border-t border-border pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
            Your Stock Deck
          </span>
          <span className="text-[10px] text-text-tertiary font-mono">
            {deckStocks.length}/{MAX_DECK}
          </span>
        </div>
        {deckStocks.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm"
              style={{ color: gradeToColor(
                avgGpa >= 3.5 ? 'A' : avgGpa >= 2.5 ? 'B' : avgGpa >= 1.5 ? 'C' : 'D' as Grade
              )}}
            >
              Avg GPA: {avgGpa.toFixed(1)}
            </span>
            {history.length > 1 && (
              <span className={`text-xs font-mono ${isUp ? 'text-green' : 'text-rose'}`}>
                30d: {isUp ? '+' : ''}{returnPct.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Running ticker */}
      {deckStocks.length > 0 ? (
        <div className="relative overflow-hidden rounded-xl bg-surface border border-border">
          <div className="ticker-track flex items-center gap-6 py-3 px-4">
            <AnimatePresence>
              {deckStocks.map(stock => (
                <motion.div
                  key={stock.symbol}
                  layout
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  className="flex items-center gap-3 shrink-0 group relative"
                >
                  <span className="text-lg">{stock.emoji}</span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-text">{stock.symbol}</span>
                      <span className="font-mono text-xs text-text-secondary">${stock.price.toFixed(2)}</span>
                      <span className={`font-mono text-xs ${
                        stock.changePercent >= 0 ? 'text-green' : 'text-rose'
                      }`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold"
                        style={{ color: gradeToColor(
                          stock.gpa >= 3.5 ? 'A' : stock.gpa >= 2.5 ? 'B' : stock.gpa >= 1.5 ? 'C' : 'D' as Grade
                        )}}
                      >
                        GPA {stock.gpa.toFixed(1)}
                      </span>
                      <span className="text-text-tertiary text-[10px]">·</span>
                      <span className="text-[10px] text-text-tertiary">{stock.sector}</span>
                    </div>
                  </div>
                  {/* Remove button on hover */}
                  <button
                    onClick={() => onRemove(stock.symbol)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity
                      w-5 h-5 rounded-full bg-surface-hover text-text-tertiary
                      text-xs flex items-center justify-center hover:bg-rose/20 hover:text-rose"
                  >
                    ×
                  </button>

                  {/* Separator */}
                  <div className="w-px h-8 bg-border/50 ml-3" />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty slots indicator */}
            {deckStocks.length < MAX_DECK && (
              <div className="flex items-center gap-1 text-text-tertiary shrink-0">
                {Array.from({ length: MAX_DECK - deckStocks.length }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-lg border border-dashed border-border/50
                      flex items-center justify-center text-xs"
                  >
                    +
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mini chart overlay */}
          {history.length > 1 && !historyLoading && (
            <div className="absolute right-0 top-0 bottom-0 w-[140px] pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-surface to-transparent" />
              <MiniChart data={history} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-4 rounded-xl border border-dashed border-border/50">
          <p className="text-xs text-text-tertiary">
            Click stocks in the heatmap, then "Add to Deck" to build your fund
          </p>
        </div>
      )}
    </div>
  );
}

function MiniChart({ data }: { data: HistoryPoint[] }) {
  const width = 140;
  const height = 50;
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

  const isUp = values[values.length - 1] >= 100;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? '#34d399' : '#f87171'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.6}
      />
    </svg>
  );
}
