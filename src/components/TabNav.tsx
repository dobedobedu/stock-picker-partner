'use client';

import { Search, GraduationCap, Scan, GitBranch, ClipboardList } from 'lucide-react';

export type Tab = 'find' | 'learn' | 'xray' | 'tree' | 'report';

const PRIMARY_TABS: { id: Tab; label: string; icon: typeof Search }[] = [
  { id: 'find', label: 'Find', icon: Search },
  { id: 'learn', label: 'Learn', icon: GraduationCap },
];

const STOCK_TABS: { id: Tab; label: string; icon: typeof Scan }[] = [
  { id: 'xray', label: 'X-Ray', icon: Scan },
  { id: 'tree', label: 'Decision Tree', icon: GitBranch },
  { id: 'report', label: 'Report Card', icon: ClipboardList },
];

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
  showStockTabs?: boolean;
}

export function TabNav({ active, onChange, showStockTabs }: Props) {
  const tabs = showStockTabs ? [...PRIMARY_TABS, ...STOCK_TABS] : PRIMARY_TABS;

  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => {
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
