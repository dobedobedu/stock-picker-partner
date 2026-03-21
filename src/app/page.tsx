'use client';

import { useState, useCallback } from 'react';
import { TabNav, type Tab } from '@/components/TabNav';
import { FindView } from '@/components/find/FindView';
import { EvaluateView } from '@/components/evaluate/EvaluateView';
import { LearnView } from '@/components/learn/LearnView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [deckSymbols, setDeckSymbols] = useState<string[]>([]);

  const handleAddToDeck = useCallback((symbol: string) => {
    setDeckSymbols(prev => {
      if (prev.includes(symbol) || prev.length >= 5) return prev;
      return [...prev, symbol];
    });
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-semibold tracking-tight">Stock Literacy</h1>
          <p className="text-sm text-text-secondary">Find great stocks. Learn why they're great.</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-6">
        <TabNav active={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'search' && (
            <FindView
              deckSymbols={deckSymbols}
              onDeckChange={setDeckSymbols}
              onAddToDeck={handleAddToDeck}
            />
          )}

          {activeTab === 'evaluate' && (
            <EvaluateView onAddToDeck={handleAddToDeck} />
          )}

          {activeTab === 'learn' && (
            <LearnView />
          )}
        </div>
      </div>
    </main>
  );
}
