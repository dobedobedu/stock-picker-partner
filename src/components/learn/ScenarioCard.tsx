'use client';

import type { Scenario } from '@/lib/scenarios';

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: (id: string) => void;
}

export function ScenarioCard({ scenario, onSelect }: ScenarioCardProps) {
  return (
    <button
      onClick={() => onSelect(scenario.id)}
      className="bg-surface hover:bg-surface-hover border border-border rounded-lg px-3 py-2.5
        text-left transition-colors group"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-lg shrink-0">{scenario.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-xs text-text truncate">{scenario.title}</span>
            <span className="text-[10px] text-text-tertiary font-mono shrink-0">{scenario.year}</span>
          </div>
          <p className="text-[10px] text-text-tertiary truncate">{scenario.keyLesson}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          {scenario.metricsFocused.slice(0, 2).map((m) => (
            <span key={m} className="px-1.5 py-0.5 rounded text-[9px] bg-surface-hover text-text-tertiary hidden sm:inline">
              {m.split(' ')[0]}
            </span>
          ))}
        </div>
        <span className="text-text-tertiary group-hover:text-text transition-colors text-xs shrink-0">→</span>
      </div>
    </button>
  );
}
