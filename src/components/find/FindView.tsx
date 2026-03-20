'use client';

import { useState, useCallback, useMemo, useReducer } from 'react';
import { useBatchStocks } from '@/lib/hooks/useBatchStocks';
import { applyFilters, filterStateToQuery, INITIAL_FILTER_STATE, type FilterState, type BatchStockData } from '@/lib/filters';
import { SECTORS } from '@/lib/universe';
import { FilterPanel } from './FilterPanel';
import { StockHeatmap } from './StockHeatmap';
import { StatsBar } from './StatsBar';
import { StockCard } from './StockCard';
import { DeckFund } from './DeckFund';
import { A2UISurface } from '../a2ui/A2UISurface';
import type { DetailLevel } from '@/lib/preferences';

interface FindViewProps {
  detailLevel: DetailLevel;
  onAddToPortfolio?: (symbol: string) => void;
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

export function FindView({ detailLevel, onAddToPortfolio }: FindViewProps) {
  const { stocks, loading, error: fetchError } = useBatchStocks();
  const [filters, dispatch] = useReducer(filterReducer, INITIAL_FILTER_STATE);
  const [colorMode, setColorMode] = useState<'change' | 'gpa'>('change');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [deckSymbols, setDeckSymbols] = useState<string[]>([]);
  const [aiRequest, setAiRequest] = useState<{
    mode: 'find' | 'action';
    query?: string;
    actionType?: string;
    actionValue?: string;
    context?: string;
    detailLevel: string;
  } | null>(null);

  // Apply filters
  const filtered = useMemo(() => applyFilters(stocks, filters), [stocks, filters]);
  const filteredSymbols = useMemo(() => new Set(filtered.map(s => s.symbol)), [filtered]);

  // Stock counts for filter panel
  const stockCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sector of SECTORS) {
      counts[`sector:${sector}`] = stocks.filter(s => s.sector === sector).length;
    }
    return counts;
  }, [stocks]);

  // Selected stock data
  const selectedStock = useMemo(
    () => stocks.find(s => s.symbol === selectedSymbol) ?? null,
    [stocks, selectedSymbol]
  );

  // Deck stocks
  const deckStocks = useMemo(
    () => deckSymbols.map(sym => stocks.find(s => s.symbol === sym)).filter(Boolean) as BatchStockData[],
    [deckSymbols, stocks]
  );

  const handleFilterChange = useCallback((update: Partial<FilterState>) => {
    dispatch({ type: 'update', payload: update });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: 'reset' });
    setSelectedSymbol(null);
  }, []);

  const handleSelectStock = useCallback((symbol: string) => {
    setSelectedSymbol(prev => prev === symbol ? null : symbol);
  }, []);

  const handleAddToDeck = useCallback((symbol: string) => {
    setDeckSymbols(prev => {
      if (prev.includes(symbol)) return prev;
      if (prev.length >= 5) return prev;
      return [...prev, symbol];
    });
  }, []);

  const handleRemoveFromDeck = useCallback((symbol: string) => {
    setDeckSymbols(prev => prev.filter(s => s !== symbol));
  }, []);

  const handleAskAI = useCallback((symbol: string) => {
    setAiRequest({
      mode: 'action',
      actionType: 'expand-stock',
      actionValue: symbol,
      context: `Detailed analysis of ${symbol} in the context of ${filters.sector ?? 'all sectors'}. Show full grade breakdown with adaptive metrics.`,
      detailLevel,
    });
  }, [filters.sector, detailLevel]);

  const handleAskAIFiltered = useCallback(() => {
    const query = filterStateToQuery(filters, filtered.length);
    setAiRequest({ mode: 'find', query, detailLevel });
  }, [filters, filtered.length, detailLevel]);

  const handleCompare = useCallback((symbols: string[]) => {
    setAiRequest({
      mode: 'find',
      query: `Compare these stocks side by side: ${symbols.join(', ')}. Show a CompareTable with all 7 subjects. Explain which is the best overall pick and why.`,
      detailLevel,
    });
  }, [detailLevel]);

  const handleAction = useCallback((action: { type: string; value: string; context?: string }) => {
    if (action.type === 'add-portfolio') {
      onAddToPortfolio?.(action.value);
    } else if (action.type === 'expand-stock') {
      handleAskAI(action.value);
    }
  }, [onAddToPortfolio, handleAskAI]);

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
      {/* Split view: filters left, heatmap + grade panel right */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          stockCounts={stockCounts}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Stats bar + controls */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <StatsBar
                filtered={filtered}
                total={stocks.length}
                onReset={handleReset}
              />
            </div>

            {/* Color mode toggle */}
            <div className="flex bg-surface border border-border rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => setColorMode('change')}
                className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  colorMode === 'change'
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                Daily Δ
              </button>
              <button
                onClick={() => setColorMode('gpa')}
                className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  colorMode === 'gpa'
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                GPA
              </button>
            </div>
          </div>

          {/* Heatmap + Grade Panel split */}
          <div className="flex gap-4">
            {/* Heatmap */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-sm text-text-secondary">Loading market data...</p>
                  </div>
                </div>
              ) : (
                <StockHeatmap
                  allStocks={stocks}
                  filteredSymbols={filteredSymbols}
                  colorMode={colorMode}
                  focus={filters.focus}
                  selectedSymbol={selectedSymbol}
                  onSelectStock={handleSelectStock}
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
                  onAskAI={() => handleAskAI(selectedStock.symbol)}
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
                onAskAI={() => handleAskAI(selectedStock.symbol)}
              />
            </div>
          )}

          {/* Ask AI about filtered stocks */}
          {filtered.length > 0 && filtered.length <= 20 && !loading && (
            <button
              onClick={handleAskAIFiltered}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium
                bg-accent/10 border border-accent/20 text-accent
                hover:bg-accent/20 transition-colors"
            >
              Ask AI about these {filtered.length} stocks 🤖
            </button>
          )}

          {/* A2UI Zone */}
          {aiRequest && (
            <div className="mt-4">
              <A2UISurface
                request={aiRequest}
                onAction={handleAction}
              />
            </div>
          )}
        </div>
      </div>

      {/* Stock Deck / Index Fund */}
      <DeckFund
        deckStocks={deckStocks}
        onRemove={handleRemoveFromDeck}
        onCompare={handleCompare}
      />
    </div>
  );
}
