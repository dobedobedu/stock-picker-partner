'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BatchStockData } from '@/lib/filters';

const CACHE_KEY = 'stock-literacy-batch';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: BatchStockData[];
  timestamp: number;
}

export function useBatchStocks() {
  const [stocks, setStocks] = useState<BatchStockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStocks = useCallback(async (force = false) => {
    // Check sessionStorage cache
    if (!force) {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          if (Date.now() - entry.timestamp < CACHE_TTL) {
            setStocks(entry.data);
            setLoading(false);
            return;
          }
        }
      } catch { /* ignore parse errors */ }
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stock/batch');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to fetch stocks');
      }

      const data: BatchStockData[] = await res.json();
      setStocks(data);

      // Cache in sessionStorage
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now(),
        } satisfies CacheEntry));
      } catch { /* sessionStorage might be full */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  return {
    stocks,
    loading,
    error,
    refresh: () => fetchStocks(true),
  };
}
