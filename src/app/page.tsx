'use client';

import { useState, useCallback } from 'react';
import { StockPicker } from '@/components/StockPicker';
import { TabNav, type Tab } from '@/components/TabNav';
import { XRayView } from '@/components/xray/XRayView';
import { TreeView } from '@/components/tree/TreeView';
import { ReportView } from '@/components/report/ReportView';
import type { StockData } from '@/lib/stock';

export default function Home() {
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('xray');

  const fetchStock = useCallback(async (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to load ${symbol}`);
      }
      const data: StockData = await res.json();
      setStock(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStock(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Stock Literacy</h1>
            <p className="text-sm text-text-secondary">Learn how to evaluate stocks with real data</p>
          </div>
          <StockPicker onSelect={fetchStock} loading={loading} />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose/10 border border-rose/20 text-rose text-sm">
            {error}
          </div>
        )}

        {!stock && !loading && !error && (
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-5xl mb-4">📊</p>
              <h2 className="text-lg font-medium text-text mb-2">Pick a company to get started</h2>
              <p className="text-sm text-text-secondary max-w-md">
                Choose from Apple, Nvidia, Nike, or Roblox — or search for any stock ticker.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-text-secondary">Loading stock data...</p>
            </div>
          </div>
        )}

        {stock && !loading && (
          <>
            {/* Stock header */}
            <div className="mb-6 flex items-center gap-4">
              {stock.image && (
                <img
                  src={stock.image}
                  alt={stock.name}
                  className="w-10 h-10 rounded-lg bg-surface"
                />
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">{stock.name}</h2>
                  <span className="text-sm text-text-secondary font-mono">{stock.symbol}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono font-medium">${stock.price.toFixed(2)}</span>
                  <span className={stock.change >= 0 ? 'text-green' : 'text-rose'}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <TabNav active={activeTab} onChange={setActiveTab} />

            {/* Tab content */}
            <div className="mt-6">
              {activeTab === 'xray' && <XRayView stock={stock} />}
              {activeTab === 'tree' && <TreeView stock={stock} />}
              {activeTab === 'report' && <ReportView stock={stock} />}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
