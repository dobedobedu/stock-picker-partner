'use client';

import { useState, useCallback, useMemo } from 'react';
import { Search } from 'lucide-react';
import { STOCK_UNIVERSE } from '@/lib/universe';

interface TickerInputProps {
  onSelect: (symbol: string) => void;
}

const QUICK_PICKS = ['AAPL', 'NVDA', 'NKE', 'RBLX', 'TSLA', 'DIS'];

export function TickerInput({ onSelect }: TickerInputProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return STOCK_UNIVERSE.filter(
      s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  const handleSelect = useCallback((symbol: string) => {
    setQuery('');
    setFocused(false);
    onSelect(symbol);
  }, [onSelect]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const match = STOCK_UNIVERSE.find(
      s => s.symbol.toLowerCase() === query.trim().toLowerCase(),
    );
    if (match) handleSelect(match.symbol);
  }, [query, handleSelect]);

  return (
    <div className="space-y-3">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="Search by ticker or company name..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-border
                text-sm text-text placeholder:text-text-tertiary
                focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-medium
              bg-accent text-white hover:bg-accent/90 transition-colors"
          >
            Evaluate
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {focused && suggestions.length > 0 && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0
            bg-surface-raised border border-border rounded-xl shadow-xl overflow-hidden">
            {suggestions.map(s => (
              <button
                key={s.symbol}
                type="button"
                onMouseDown={() => handleSelect(s.symbol)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left
                  hover:bg-surface-hover transition-colors"
              >
                <span className="text-base">{s.emoji}</span>
                <span className="font-mono text-sm font-semibold text-text">{s.symbol}</span>
                <span className="text-sm text-text-secondary">{s.name}</span>
                <span className="text-xs text-text-tertiary ml-auto">{s.sector}</span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Quick picks */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-text-tertiary">Quick picks:</span>
        {QUICK_PICKS.map(sym => {
          const stock = STOCK_UNIVERSE.find(s => s.symbol === sym);
          return (
            <button
              key={sym}
              onClick={() => handleSelect(sym)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs
                bg-surface border border-border text-text-secondary
                hover:bg-surface-hover hover:text-text transition-colors"
            >
              <span>{stock?.emoji}</span>
              <span className="font-mono font-medium">{sym}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
