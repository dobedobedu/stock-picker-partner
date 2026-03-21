'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScenarioCard } from './ScenarioCard';
import { SCENARIOS, getScenarioById } from '@/lib/scenarios';

interface LearnViewProps {
  initialScenarioId?: string;
}

export function LearnView({ initialScenarioId }: LearnViewProps) {
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(initialScenarioId ?? null);
  const [phase, setPhase] = useState<'backtest' | 'live'>('backtest');

  const activeScenario = activeScenarioId ? getScenarioById(activeScenarioId) : null;

  const handleSelectScenario = useCallback((id: string) => {
    setActiveScenarioId(id);
    setPhase('backtest');
  }, []);

  const handleBack = useCallback(() => {
    setActiveScenarioId(null);
    setPhase('backtest');
  }, []);

  // Scenario list
  if (!activeScenarioId || !activeScenario) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-base font-medium mb-1">Learn why grades change</h3>
          <p className="text-sm text-text-secondary">
            Each scenario shows how the same metric means different things in different contexts.
            Pick one to explore.
          </p>
        </div>
        <div className="grid gap-3">
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.id} scenario={s} onSelect={handleSelectScenario} />
          ))}
        </div>
      </div>
    );
  }

  // Active lesson — static content (no AI)
  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-text-secondary" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{activeScenario.emoji}</span>
            <span className="font-medium text-sm">{activeScenario.title}</span>
            <span className="text-xs text-text-tertiary font-mono">{activeScenario.year}</span>
          </div>
        </div>

        {/* Phase toggle */}
        <div className="flex rounded-lg bg-surface border border-border p-0.5">
          <button
            onClick={() => setPhase('backtest')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              phase === 'backtest' ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text'
            }`}
          >
            Backtest
          </button>
          <button
            onClick={() => setPhase('live')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              phase === 'live' ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text'
            }`}
          >
            Apply It
          </button>
        </div>
      </div>

      {/* Scenario content */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <p className="text-sm text-text-secondary">{activeScenario.subtitle}</p>

        <div className="bg-surface-raised rounded-lg p-4 text-sm text-text leading-relaxed">
          {activeScenario.context}
        </div>

        <div className="space-y-2">
          <div className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
            Key Lesson
          </div>
          <p className="text-sm font-medium text-accent">{activeScenario.keyLesson}</p>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
            Metrics to Watch
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeScenario.metricsFocused.map(m => (
              <span key={m} className="px-2 py-1 rounded-lg text-xs bg-surface-hover text-text-secondary border border-border">
                {m}
              </span>
            ))}
          </div>
        </div>

        {phase === 'live' && (
          <div className="bg-accent/5 border border-accent/15 rounded-lg p-4 space-y-2">
            <div className="text-xs font-medium text-accent uppercase tracking-wider">
              Apply It: Today's Market
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Think about the current market conditions. Which stocks in our universe
              might be affected by similar dynamics? Go to the <strong>Search</strong> tab and
              look for stocks where the metrics mentioned above tell a story. Use the
              <strong> Evaluate</strong> tab to check their percentiles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
