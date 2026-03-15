'use client';

import { useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { PRELOADED_TICKERS } from '@/lib/stock';

interface Props {
  onSelect: (symbol: string) => void;
  loading: boolean;
}

export function StockPicker({ onSelect, loading }: Props) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = search.trim().toUpperCase();
    if (val && /^[A-Z]{1,5}$/.test(val)) {
      onSelect(val);
      setSearch('');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Pre-loaded tickers */}
      <div className="hidden sm:flex items-center gap-1.5">
        {PRELOADED_TICKERS.map((t) => (
          <button
            key={t.symbol}
            onClick={() => onSelect(t.symbol)}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-surface hover:bg-surface-hover
                       transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>{t.emoji}</span>
            <span className="font-medium">{t.symbol}</span>
          </button>
        ))}
      </div>

      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value.toUpperCase().slice(0, 5))}
          placeholder="Ticker..."
          disabled={loading}
          className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-surface
                     placeholder:text-text-tertiary w-28 focus:border-accent transition-colors"
        />
      </form>
    </div>
  );
}
