'use client';

import { Search, BarChart3, GraduationCap } from 'lucide-react';

export type Tab = 'search' | 'evaluate' | 'learn';

const TABS: { id: Tab; label: string; icon: typeof Search }[] = [
  { id: 'search', label: 'Search', icon: Search },
  { id: 'evaluate', label: 'Evaluate', icon: BarChart3 },
  { id: 'learn', label: 'Learn', icon: GraduationCap },
];

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export function TabNav({ active, onChange }: Props) {
  return (
    <div className="flex border-b border-border">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors
              border-b-2 -mb-px ${
              isActive
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
