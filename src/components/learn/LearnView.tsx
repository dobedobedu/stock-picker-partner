'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScenarioCard } from './ScenarioCard';
import { GlossaryCard, GlossaryTile } from './GlossaryCard';
import { SCENARIOS, getScenarioById } from '@/lib/scenarios';
import { GLOSSARY, GLOSSARY_CATEGORIES, getTermById, type GlossaryTerm } from '@/lib/glossary';

type View = 'home' | 'scenario' | 'glossary-term';

interface LearnViewProps {
  initialScenarioId?: string;
}

export function LearnView({ initialScenarioId }: LearnViewProps) {
  const [view, setView] = useState<View>(initialScenarioId ? 'scenario' : 'home');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(initialScenarioId ?? null);
  const [activeTermId, setActiveTermId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'backtest' | 'live'>('backtest');
  const [glossaryFilter, setGlossaryFilter] = useState<string | null>(null);

  const activeScenario = activeScenarioId ? getScenarioById(activeScenarioId) : null;
  const activeTerm = activeTermId ? getTermById(activeTermId) : null;

  const handleSelectScenario = useCallback((id: string) => {
    setActiveScenarioId(id);
    setPhase('backtest');
    setView('scenario');
  }, []);

  const handleSelectTerm = useCallback((id: string) => {
    setActiveTermId(id);
    setView('glossary-term');
  }, []);

  const handleBack = useCallback(() => {
    setView('home');
    setActiveScenarioId(null);
    setActiveTermId(null);
    setPhase('backtest');
  }, []);

  const filteredTerms = glossaryFilter
    ? GLOSSARY.filter(t => t.category === glossaryFilter)
    : GLOSSARY;

  // Home view — scenarios + glossary
  if (view === 'home') {
    return (
      <div className="space-y-6 pb-16">
        {/* Scenarios */}
        <div>
          <h3 className="text-sm font-medium mb-2">Case Studies</h3>
          <p className="text-xs text-text-secondary mb-3">
            Real market events that show how metrics work in context.
          </p>
          <div className="grid gap-1.5">
            {SCENARIOS.map(s => (
              <ScenarioCard key={s.id} scenario={s} onSelect={handleSelectScenario} />
            ))}
          </div>
        </div>

        {/* Glossary */}
        <div>
          <h3 className="text-sm font-medium mb-2">Glossary ELI5</h3>
          <p className="text-xs text-text-secondary mb-3">
            Financial terms explained with real numbers, simple formulas, and analogies.
          </p>

          {/* Category filter */}
          <div className="flex gap-1.5 mb-3">
            <button
              onClick={() => setGlossaryFilter(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all
                ${!glossaryFilter
                  ? 'bg-accent/15 text-accent border border-accent/25'
                  : 'bg-surface border border-border text-text-tertiary hover:text-text-secondary'
                }`}
            >
              All
            </button>
            {GLOSSARY_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setGlossaryFilter(glossaryFilter === cat.id ? null : cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all
                  ${glossaryFilter === cat.id
                    ? 'bg-accent/15 text-accent border border-accent/25'
                    : 'bg-surface border border-border text-text-tertiary hover:text-text-secondary'
                  }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Terms grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {filteredTerms.map(term => (
              <GlossaryTile key={term.id} term={term} onSelect={handleSelectTerm} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Glossary term detail — 3-card view
  if (view === 'glossary-term' && activeTerm) {
    return (
      <div className="space-y-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-xs text-text-secondary hover:text-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Learn
        </button>
        <GlossaryCard term={activeTerm} />

        {/* Related terms */}
        <div className="space-y-2">
          <div className="text-xs text-text-tertiary font-medium">Related</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {GLOSSARY.filter(t => t.category === activeTerm.category && t.id !== activeTerm.id)
              .slice(0, 3)
              .map(t => (
                <GlossaryTile key={t.id} term={t} onSelect={handleSelectTerm} />
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Scenario detail
  if (view === 'scenario' && activeScenario) {
    return (
      <div className="space-y-4">
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

        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <p className="text-sm text-text-secondary">{activeScenario.subtitle}</p>
          <div className="bg-surface-raised rounded-lg p-4 text-sm text-text leading-relaxed">
            {activeScenario.context}
          </div>
          <div className="space-y-2">
            <div className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Key Lesson</div>
            <p className="text-sm font-medium text-accent">{activeScenario.keyLesson}</p>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Metrics to Watch</div>
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
              <div className="text-xs font-medium text-accent uppercase tracking-wider">Apply It: Today's Market</div>
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

  return null;
}
