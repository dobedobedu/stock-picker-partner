'use client';

import type { FilterState, SizeCategory, FocusType } from '@/lib/filters';
import { SIZE_CATEGORIES, FOCUS_OPTIONS } from '@/lib/filters';
import { SECTORS } from '@/lib/universe';

interface StepFunnelProps {
  filters: FilterState;
  onFilterChange: (update: Partial<FilterState>) => void;
  stockCounts: Record<string, number>;
}

const SECTOR_EMOJIS: Record<string, string> = {
  'Technology': '🖥',
  'Healthcare': '💊',
  'Financial Services': '🏦',
  'Consumer Discretionary': '🛍',
  'Consumer Staples': '🍔',
  'Energy': '⚡',
  'Industrials': '🏭',
  'Communication Services': '📡',
  'Real Estate': '🏠',
  'Materials': '⛏',
  'Utilities': '💡',
};

export function StepFunnel({ filters, onFilterChange, stockCounts }: StepFunnelProps) {
  const step = !filters.sector ? 1 : !filters.sizeCategory ? 2 : 3;

  return (
    <div className="space-y-4">
      {/* Step markers */}
      <div className="flex items-center gap-1">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => {
                if (s === 1) onFilterChange({ sector: null, sizeCategory: null, focus: null });
                else if (s === 2 && filters.sector) onFilterChange({ sizeCategory: null, focus: null });
              }}
              disabled={s > step + 1}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${s <= step
                  ? 'bg-accent text-white'
                  : 'bg-border/50 text-text-tertiary'
                }
                ${s <= step ? 'cursor-pointer hover:bg-accent/80' : 'cursor-default'}
              `}
            >
              {s}
            </button>
            {s < 3 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-1 rounded transition-colors ${
                s < step ? 'bg-accent' : 'bg-border/50'
              }`} />
            )}
          </div>
        ))}
        <div className="ml-3 text-xs text-text-tertiary">
          {step === 1 && 'Industry'}
          {step === 2 && 'Size'}
          {step === 3 && 'Focus'}
        </div>
      </div>

      {/* Step 1: Industry */}
      {step >= 1 && (
        <div className="space-y-2">
          <div className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
            {step === 1 ? 'Step 1: Pick an industry' : `Industry: ${filters.sector}`}
          </div>
          {step === 1 ? (
            <div className="flex flex-wrap gap-1.5">
              {SECTORS.map(sector => {
                const count = stockCounts[`sector:${sector}`] ?? 0;
                return (
                  <button
                    key={sector}
                    onClick={() => onFilterChange({ sector })}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                      bg-surface border border-border text-text-secondary
                      hover:bg-surface-hover hover:text-text hover:border-accent/30 transition-all"
                  >
                    <span>{SECTOR_EMOJIS[sector] ?? '📊'}</span>
                    <span>{sector.replace('Consumer ', '').replace('Financial ', 'Fin. ').replace('Communication ', 'Comm. ')}</span>
                    <span className="text-text-tertiary font-mono text-[10px]">{count}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <button
              onClick={() => onFilterChange({ sector: null, sizeCategory: null, focus: null })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors"
            >
              <span>{SECTOR_EMOJIS[filters.sector!] ?? '📊'}</span>
              <span>{filters.sector}</span>
              <span className="ml-1">×</span>
            </button>
          )}
        </div>
      )}

      {/* Step 2: Size */}
      {step >= 2 && (
        <div className="space-y-2">
          <div className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
            {step === 2 ? 'Step 2: Company size' : `Size: ${SIZE_CATEGORIES.find(s => s.id === filters.sizeCategory)?.label ?? ''}-cap`}
          </div>
          {step === 2 ? (
            <div className="flex flex-wrap gap-1.5">
              {SIZE_CATEGORIES.map(size => (
                <button
                  key={size.id}
                  onClick={() => onFilterChange({ sizeCategory: size.id })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                    bg-surface border border-border text-text-secondary
                    hover:bg-surface-hover hover:text-text hover:border-accent/30 transition-all"
                >
                  <span>{size.emoji}</span>
                  <span>{size.label}</span>
                </button>
              ))}
              <button
                onClick={() => onFilterChange({ sizeCategory: 'mega' as SizeCategory })}
                className="px-3 py-2 rounded-lg text-xs text-text-tertiary hover:text-text-secondary transition-colors"
              >
                Skip →
              </button>
            </div>
          ) : (
            <button
              onClick={() => onFilterChange({ sizeCategory: null, focus: null })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors"
            >
              <span>{SIZE_CATEGORIES.find(s => s.id === filters.sizeCategory)?.emoji}</span>
              <span>{SIZE_CATEGORIES.find(s => s.id === filters.sizeCategory)?.label}-cap</span>
              <span className="ml-1">×</span>
            </button>
          )}
        </div>
      )}

      {/* Step 3: Focus */}
      {step >= 3 && (
        <div className="space-y-2">
          <div className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
            Step 3: What matters most?
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FOCUS_OPTIONS.map(focus => (
              <button
                key={focus.id}
                onClick={() => onFilterChange({
                  focus: filters.focus === focus.id ? null : focus.id,
                })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all
                  ${filters.focus === focus.id
                    ? 'bg-accent/15 border border-accent/30 text-accent'
                    : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover hover:text-text'
                  }`}
              >
                <span>{focus.emoji}</span>
                <span>{focus.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
