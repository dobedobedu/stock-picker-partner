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
      className="w-full bg-surface hover:bg-surface-hover border border-border rounded-xl p-4
        text-left transition-colors group"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{scenario.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{scenario.title}</span>
            <span className="text-xs text-text-tertiary font-mono">{scenario.year}</span>
          </div>
          <p className="text-xs text-text-secondary mb-2">{scenario.subtitle}</p>
          <p className="text-xs text-text-tertiary leading-relaxed">{scenario.keyLesson}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {scenario.metricsFocused.slice(0, 3).map((m) => (
              <span key={m} className="px-1.5 py-0.5 rounded text-[10px] bg-surface-hover text-text-tertiary">
                {m}
              </span>
            ))}
          </div>
        </div>
        <span className="text-text-tertiary group-hover:text-text transition-colors text-sm">→</span>
      </div>
    </button>
  );
}
