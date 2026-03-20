'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScenarioCard } from './ScenarioCard';
import { A2UISurface } from '../a2ui/A2UISurface';
import { SCENARIOS, getScenarioById } from '@/lib/scenarios';
import type { DetailLevel } from '@/lib/preferences';

interface LearnViewProps {
  detailLevel: DetailLevel;
  initialScenarioId?: string;
}

export function LearnView({ detailLevel, initialScenarioId }: LearnViewProps) {
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(initialScenarioId ?? null);
  const [phase, setPhase] = useState<'backtest' | 'live'>('backtest');
  const [request, setRequest] = useState<{
    mode: 'find' | 'learn' | 'action';
    scenarioId?: string;
    phase?: 'backtest' | 'live';
    actionType?: string;
    actionValue?: string;
    context?: string;
    detailLevel: string;
  } | null>(initialScenarioId ? {
    mode: 'learn',
    scenarioId: initialScenarioId,
    phase: 'backtest',
    detailLevel,
  } : null);

  const activeScenario = activeScenarioId ? getScenarioById(activeScenarioId) : null;

  const handleSelectScenario = useCallback((id: string) => {
    setActiveScenarioId(id);
    setPhase('backtest');
    setRequest({
      mode: 'learn',
      scenarioId: id,
      phase: 'backtest',
      detailLevel,
    });
  }, [detailLevel]);

  const handleBack = useCallback(() => {
    setActiveScenarioId(null);
    setPhase('backtest');
    setRequest(null);
  }, []);

  const handleAction = useCallback((action: { type: string; value: string; context?: string }) => {
    if (!activeScenarioId) return;

    if (action.type === 'grade' || action.type === 'answer') {
      // User answered a question — send to AI for feedback
      setRequest({
        mode: 'learn',
        scenarioId: activeScenarioId,
        phase,
        actionType: action.type,
        actionValue: action.value,
        context: action.context || '',
        detailLevel,
      });
    } else if (action.type === 'continue-to-live') {
      // Transition from backtest to live application
      setPhase('live');
      setRequest({
        mode: 'learn',
        scenarioId: activeScenarioId,
        phase: 'live',
        detailLevel,
      });
    } else {
      setRequest({
        mode: 'action',
        actionType: action.type,
        actionValue: action.value,
        context: action.context || `Scenario: ${activeScenario?.title}`,
        detailLevel,
      });
    }
  }, [activeScenarioId, activeScenario, phase, detailLevel]);

  const handleComplete = useCallback(() => {
    // After backtest completes, show "Try it live" button
    if (phase === 'backtest') {
      // The AI should include a GradeButtons component for this,
      // but we can also offer the transition here
    }
  }, [phase]);

  // Scenario list
  if (!activeScenarioId) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-base font-medium mb-1">Learn why grades change</h3>
          <p className="text-sm text-text-secondary">
            Each scenario shows how the same metric means different things in different contexts.
            Pick one to start.
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

  // Active lesson
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
            <span className="text-lg">{activeScenario?.emoji}</span>
            <span className="font-medium text-sm">{activeScenario?.title}</span>
            <span className="text-xs text-text-tertiary font-mono">{activeScenario?.year}</span>
          </div>
        </div>

        {/* Phase toggle */}
        <div className="flex rounded-lg bg-surface border border-border p-0.5">
          <button
            onClick={() => {
              setPhase('backtest');
              setRequest({ mode: 'learn', scenarioId: activeScenarioId, phase: 'backtest', detailLevel });
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              phase === 'backtest' ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text'
            }`}
          >
            Backtest
          </button>
          <button
            onClick={() => {
              setPhase('live');
              setRequest({ mode: 'learn', scenarioId: activeScenarioId, phase: 'live', detailLevel });
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              phase === 'live' ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text'
            }`}
          >
            Apply It
          </button>
        </div>
      </div>

      {/* A2UI Surface */}
      <A2UISurface
        request={request}
        onAction={handleAction}
        onComplete={handleComplete}
      />
    </div>
  );
}
