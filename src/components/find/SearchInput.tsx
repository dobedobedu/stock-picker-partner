'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface Tile {
  id: string;
  label: string;
  group: 'strategy' | 'industry' | 'priority';
}

const TILES: Tile[] = [
  // Strategy
  { id: 'growth', label: 'Growth', group: 'strategy' },
  { id: 'value', label: 'Value', group: 'strategy' },
  { id: 'dividend', label: 'Dividend', group: 'strategy' },

  // Industry
  { id: 'tech', label: 'Technology', group: 'industry' },
  { id: 'health', label: 'Healthcare', group: 'industry' },
  { id: 'finance', label: 'Finance', group: 'industry' },
  { id: 'energy', label: 'Energy', group: 'industry' },
  { id: 'consumer', label: 'Consumer', group: 'industry' },
  { id: 'industrial', label: 'Industrial', group: 'industry' },
  { id: 'realestate', label: 'Real Estate', group: 'industry' },
  { id: 'comms', label: 'Comms', group: 'industry' },

  // Priority
  { id: 'low-debt', label: 'Low Debt', group: 'priority' },
  { id: 'high-margins', label: 'High Margins', group: 'priority' },
  { id: 'profitability', label: 'Profitability', group: 'priority' },
  { id: 'top-gpa', label: 'Top GPA', group: 'priority' },
];

const GROUP_LABELS: Record<string, string> = {
  strategy: 'Strategy',
  industry: 'Industry',
  priority: 'Priority',
};

interface SearchInputProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function SearchInput({ onSearch, loading }: SearchInputProps) {
  const [active, setActive] = useState<Set<string>>(new Set());
  const [freeform, setFreeform] = useState('');

  const toggle = (id: string) => {
    setActive(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSearch = () => {
    const activeTiles = TILES.filter(t => active.has(t.id));
    const parts: string[] = [];

    const strategies = activeTiles.filter(t => t.group === 'strategy').map(t => t.label);
    const industries = activeTiles.filter(t => t.group === 'industry').map(t => t.label);
    const priorities = activeTiles.filter(t => t.group === 'priority').map(t => t.label);

    if (strategies.length) parts.push(`Strategy: ${strategies.join(', ')}`);
    if (industries.length) parts.push(`Industry: ${industries.join(', ')}`);
    if (priorities.length) parts.push(`Prioritize: ${priorities.join(', ')}`);
    if (freeform.trim()) parts.push(freeform.trim());

    if (parts.length === 0) {
      onSearch('Show me the highest GPA stocks overall');
      return;
    }

    onSearch(parts.join('. ') + '. Rank by GPA.');
  };

  const groups = ['strategy', 'industry', 'priority'] as const;

  return (
    <div className="space-y-5">
      {/* Active filters bar */}
      <div className="flex items-center gap-2 min-h-[44px]">
        <div className="flex-1 flex flex-wrap items-center gap-1.5 px-3 py-2 bg-surface border border-border rounded-xl min-h-[44px]">
          {active.size === 0 && (
            <span className="text-sm text-text-tertiary">Select tiles to build your search</span>
          )}
          {TILES.filter(t => active.has(t.id)).map(t => (
            <span
              key={t.id}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-accent/15 text-accent border border-accent/25"
            >
              {t.label}
            </span>
          ))}

          {/* Freeform input inline */}
          <input
            value={freeform}
            onChange={e => setFreeform(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !loading) handleSearch(); }}
            placeholder={active.size > 0 ? 'add detail...' : ''}
            className="flex-1 min-w-[80px] text-sm bg-transparent placeholder:text-text-tertiary"
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="h-[44px] px-4 rounded-xl bg-accent text-white text-sm font-medium
            hover:bg-accent-dim transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {/* Tile groups */}
      {groups.map(group => (
        <div key={group}>
          <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2 block">
            {GROUP_LABELS[group]}
          </span>
          <div className="flex flex-wrap gap-2">
            {TILES.filter(t => t.group === group).map(t => {
              const isActive = active.has(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  disabled={loading}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-accent/15 text-accent border border-accent/30 ring-1 ring-accent/10'
                      : 'bg-surface text-text-secondary border border-border hover:bg-surface-hover hover:text-text'
                  } disabled:opacity-50`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
