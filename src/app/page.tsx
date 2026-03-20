'use client';

import { useState, useCallback, useEffect } from 'react';
import { StockPicker } from '@/components/StockPicker';
import { TabNav, type Tab } from '@/components/TabNav';
import { PreferenceToggle } from '@/components/PreferenceToggle';
import { FindView } from '@/components/find/FindView';
import { LearnView } from '@/components/learn/LearnView';
import { XRayView } from '@/components/xray/XRayView';
import { TreeView } from '@/components/tree/TreeView';
import { ReportView } from '@/components/report/ReportView';
import { PortfolioTray } from '@/components/portfolio/PortfolioTray';
import type { StockData } from '@/lib/stock';
import { loadPreferences, savePreferences, type DetailLevel } from '@/lib/preferences';
import { addToPortfolio, loadPortfolio, type PortfolioSlot } from '@/lib/portfolio';
import type { GradeChange } from '@/lib/portfolio';
import { STOCK_UNIVERSE } from '@/lib/universe';
import { gradeStock, gradeToGPA } from '@/lib/stock';

export default function Home() {
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('find');
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('simple');
  const [portfolioTrigger, setPortfolioTrigger] = useState(0);
  const [learnScenarioId, setLearnScenarioId] = useState<string | undefined>();

  // Load preferences on mount
  useEffect(() => {
    const prefs = loadPreferences();
    setDetailLevel(prefs.detailLevel);
  }, []);

  const handleDetailChange = useCallback((level: DetailLevel) => {
    setDetailLevel(level);
    savePreferences({ detailLevel: level });
  }, []);

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
      setActiveTab('xray');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStock(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddToPortfolio = useCallback((symbol: string) => {
    const universeStock = STOCK_UNIVERSE.find(s => s.symbol === symbol);
    if (!universeStock) return;

    // We need stock data to grade — fetch it
    fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`)
      .then(res => res.json())
      .then((data: StockData) => {
        const grades = gradeStock(data);
        const gpa = grades.reduce((sum, g) => sum + gradeToGPA(g.grade), 0) / grades.length;

        const slot: PortfolioSlot = {
          symbol,
          name: universeStock.name,
          emoji: universeStock.emoji,
          sector: universeStock.sector,
          gpa,
          grades: grades.map(g => ({ subject: g.subject, grade: g.grade })),
          addedAt: Date.now(),
          lastRefreshed: Date.now(),
        };

        addToPortfolio(slot);
        setPortfolioTrigger(prev => prev + 1);
      })
      .catch(console.error);
  }, []);

  const handleAlertTap = useCallback((change: GradeChange) => {
    // Navigate to Learn tab with a relevant scenario
    const subjectToScenario: Record<string, string> = {
      'Value': 'rate-hikes-2022',
      'Safety': 'covid-crash-2020',
      'Growth': 'ai-boom-2023',
      'Making Money': 'nike-earnings-miss-2024',
      'Popularity': 'meme-stocks-2021',
    };
    const scenarioId = subjectToScenario[change.subject] || 'rate-hikes-2022';
    setLearnScenarioId(scenarioId);
    setActiveTab('learn');
  }, []);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    if (tab !== 'learn') {
      setLearnScenarioId(undefined);
    }
  }, []);

  // Determine if we should show stock-specific tabs
  const showStockTabs = stock !== null && !loading;

  return (
    <main className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Stock Literacy</h1>
            <p className="text-sm text-text-secondary">Find great stocks. Learn why they're great.</p>
          </div>
          <div className="flex items-center gap-3">
            <PreferenceToggle value={detailLevel} onChange={handleDetailChange} />
            {(activeTab === 'xray' || activeTab === 'tree' || activeTab === 'report') && (
              <StockPicker onSelect={fetchStock} loading={loading} />
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-6">
        {/* Tab navigation */}
        <TabNav active={activeTab} onChange={handleTabChange} showStockTabs={showStockTabs} />

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose/10 border border-rose/20 text-rose text-sm">
            {error}
          </div>
        )}

        {/* Tab content */}
        <div className="mt-6">
          {activeTab === 'find' && (
            <FindView
              detailLevel={detailLevel}
              onAddToPortfolio={handleAddToPortfolio}
            />
          )}

          {activeTab === 'learn' && (
            <LearnView
              detailLevel={detailLevel}
              initialScenarioId={learnScenarioId}
            />
          )}

          {activeTab === 'xray' && stock && !loading && <XRayView stock={stock} />}
          {activeTab === 'tree' && stock && !loading && <TreeView stock={stock} />}
          {activeTab === 'report' && stock && !loading && <ReportView stock={stock} />}

          {(activeTab === 'xray' || activeTab === 'tree' || activeTab === 'report') && !stock && !loading && (
            <div className="flex-1 flex items-center justify-center min-h-[40vh]">
              <div className="text-center">
                <p className="text-4xl mb-3">📊</p>
                <h2 className="text-base font-medium text-text mb-2">Pick a company to analyze</h2>
                <p className="text-sm text-text-secondary max-w-md">
                  Use the stock picker above to load a specific company's data.
                </p>
              </div>
            </div>
          )}

          {loading && (activeTab === 'xray' || activeTab === 'tree' || activeTab === 'report') && (
            <div className="flex-1 flex items-center justify-center min-h-[40vh]">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-text-secondary">Loading stock data...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Tray */}
      <PortfolioTray
        onAlertTap={handleAlertTap}
        refreshTrigger={portfolioTrigger}
      />
    </main>
  );
}
