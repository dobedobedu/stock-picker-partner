'use client';

import { useState, useCallback, useMemo, useReducer } from 'react';
import { useBatchStocks } from '@/lib/hooks/useBatchStocks';
import { applyFilters, INITIAL_FILTER_STATE, type FilterState, type BatchStockData } from '@/lib/filters';
import { SECTORS } from '@/lib/universe';
import { StepFunnel } from './StepFunnel';
import { StockHeatmap } from './StockHeatmap';
import { StockCard } from './StockCard';
import { DeckFund } from './DeckFund';

interface FindViewProps {
  onAddToDeck?: (symbol: string) => void;
  deckSymbols: string[];
  onDeckChange: (symbols: string[]) => void;
}

type FilterAction =
  | { type: 'update'; payload: Partial<FilterState> }
  | { type: 'reset' };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'update':
      return { ...state, ...action.payload };
    case 'reset':
      return INITIAL_FILTER_STATE;
    default:
      return state;
  }
}

export function FindView({ onAddToDeck, deckSymbols, onDeckChange }: FindViewProps) {
  const { stocks, loading, error: fetchError } = useBatchStocks();
  const [filters, dispatch] = useReducer(filterReducer, INITIAL_FILTER_STATE);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const filtered = useMemo(() => applyFilters(stocks, filters), [stocks, filters]);
  const filteredSymbols = useMemo(() => {
    // When no filters active, all stocks match (full opacity)
    if (!filters.sector && !filters.sizeCategory && !filters.focus) {
      return new Set(stocks.map(s => s.symbol));
    }
    return new Set(filtered.map(s => s.symbol));
  }, [filtered, filters, stocks]);

  const stockCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sector of SECTORS) {
      counts[`sector:${sector}`] = stocks.filter(s => s.sector === sector).length;
    }
    return counts;
  }, [stocks]);

  const selectedStock = useMemo(
    () => stocks.find(s => s.symbol === selectedSymbol) ?? null,
    [stocks, selectedSymbol],
  );

  const deckStocks = useMemo(
    () => deckSymbols.map(sym => stocks.find(s => s.symbol === sym)).filter(Boolean) as BatchStockData[],
    [deckSymbols, stocks],
  );

  const allFiltersActive = !!(filters.sector && filters.sizeCategory && filters.focus);

  const handleFilterChange = useCallback((update: Partial<FilterState>) => {
    dispatch({ type: 'update', payload: update });
  }, []);

  const handleSelectStock = useCallback((symbol: string) => {
    setSelectedSymbol(prev => prev === symbol ? null : symbol);
  }, []);

  const handleAddToDeck = useCallback((symbol: string) => {
    if (deckSymbols.includes(symbol) || deckSymbols.length >= 5) return;
    onDeckChange([...deckSymbols, symbol]);
  }, [deckSymbols, onDeckChange]);

  const handleRemoveFromDeck = useCallback((symbol: string) => {
    onDeckChange(deckSymbols.filter(s => s !== symbol));
  }, [deckSymbols, onDeckChange]);

  if (fetchError) {
    return (
      <div className="p-4 rounded-xl bg-rose/10 border border-rose/20 text-rose text-sm">
        {fetchError}
        <p className="mt-2 text-text-tertiary text-xs">
          Make sure the cron job has run at least once to populate stock data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-32">
      {/* Step Funnel */}
      <StepFunnel
        filters={filters}
        onFilterChange={handleFilterChange}
        stockCounts={stockCounts}
      />

      {/* Main content */}
      <div className="flex gap-4">
        {/* Heatmap */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <StockHeatmap
              allStocks={stocks}
              filteredSymbols={filteredSymbols}
              focus={filters.focus}
              selectedSymbol={selectedSymbol}
              onSelectStock={handleSelectStock}
              allFiltersActive={allFiltersActive}
              activeSector={filters.sector}
            />
          )}
        </div>

        {/* Grade Panel (right sidebar) */}
        {selectedStock && (
          <div className="w-[260px] shrink-0 hidden lg:block">
            <StockCard
              stock={selectedStock}
              variant="full"
              onAdd={() => handleAddToDeck(selectedStock.symbol)}
            />
          </div>
        )}
      </div>

      {/* Mobile grade panel */}
      {selectedStock && (
        <div className="lg:hidden">
          <StockCard
            stock={selectedStock}
            variant="full"
            onAdd={() => handleAddToDeck(selectedStock.symbol)}
          />
        </div>
      )}

      {/* Stock Deck */}
      <DeckFund
        deckStocks={deckStocks}
        onRemove={handleRemoveFromDeck}
      />
    </div>
  );
}
