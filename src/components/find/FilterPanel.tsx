'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SECTORS } from '@/lib/universe';
import { SIZE_CATEGORIES, FOCUS_OPTIONS, type FilterState, type SizeCategory, type FocusType } from '@/lib/filters';
import { SUBJECTS } from '@/lib/grading';
import { GradeFilter } from './GradeFilter';
import { FilterTooltip } from './FilterTooltip';
import { getSectorStyle } from '@/lib/sector-patterns';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (update: Partial<FilterState>) => void;
  stockCounts: Record<string, number>;
}

function Section({
  title,
  emoji,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  emoji: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface/50 rounded-xl border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-surface-hover transition-colors"
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-text">
          <span>{emoji}</span>
          {title}
        </span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-text-tertiary" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
        )}
      </button>
      {expanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export function FilterPanel({ filters, onFilterChange, stockCounts }: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['sector', 'size', 'focus', 'grades'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const sectorHasGrades = filters.sector !== null;

  return (
    <div className="space-y-1 w-full lg:w-[280px] shrink-0">
      {/* Sector */}
      <Section
        title="Industry"
        emoji="🏭"
        expanded={expandedSections.has('sector')}
        onToggle={() => toggleSection('sector')}
      >
        <div className="flex flex-wrap gap-1.5">
          {SECTORS.map(sector => {
            const style = getSectorStyle(sector);
            const isActive = filters.sector === sector;
            const count = stockCounts[`sector:${sector}`] ?? 0;
            return (
              <button
                key={sector}
                onClick={() => onFilterChange({ sector: isActive ? null : sector })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'ring-1 ring-opacity-40 text-white'
                    : 'bg-surface text-text-secondary border border-border hover:bg-surface-hover hover:text-text'
                }`}
                style={isActive ? {
                  backgroundColor: `${style.color}22`,
                  borderColor: `${style.color}44`,
                  color: style.color,
                } : undefined}
              >
                {sector.replace('Consumer ', '').replace('Financial ', 'Fin. ').replace('Communication ', 'Comm. ')}
                <span className="ml-1 opacity-50">{count}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Size */}
      <Section
        title="Company Size"
        emoji="📏"
        expanded={expandedSections.has('size')}
        onToggle={() => toggleSection('size')}
      >
        <div className="flex flex-wrap gap-1.5">
          {SIZE_CATEGORIES.map(size => {
            const isActive = filters.sizeCategory === size.id;
            return (
              <FilterTooltip key={size.id} text={size.tooltip}>
                <button
                  onClick={() => onFilterChange({
                    sizeCategory: isActive ? null : size.id as SizeCategory
                  })}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-accent/15 text-accent border border-accent/30 ring-1 ring-accent/10'
                      : 'bg-surface text-text-secondary border border-border hover:bg-surface-hover hover:text-text'
                  }`}
                >
                  <span>{size.emoji}</span>
                  {size.label}
                </button>
              </FilterTooltip>
            );
          })}
        </div>
      </Section>

      {/* Focus */}
      <Section
        title="What matters most?"
        emoji="🎯"
        expanded={expandedSections.has('focus')}
        onToggle={() => toggleSection('focus')}
      >
        <div className="flex flex-wrap gap-1.5">
          {FOCUS_OPTIONS.map(focus => {
            const isActive = filters.focus === focus.id;
            return (
              <FilterTooltip key={focus.id} text={focus.tooltip}>
                <button
                  onClick={() => onFilterChange({
                    focus: isActive ? null : focus.id as FocusType
                  })}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-accent/15 text-accent border border-accent/30 ring-1 ring-accent/10'
                      : 'bg-surface text-text-secondary border border-border hover:bg-surface-hover hover:text-text'
                  }`}
                >
                  <span>{focus.emoji}</span>
                  {focus.label}
                </button>
              </FilterTooltip>
            );
          })}
        </div>
      </Section>

      {/* Subject Grades — only shown after sector is picked */}
      {sectorHasGrades ? (
        <Section
          title="Report Card Filters"
          emoji="📋"
          expanded={expandedSections.has('grades')}
          onToggle={() => toggleSection('grades')}
        >
          <div className="space-y-2">
            {/* Overall GPA */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { label: 'Honor Roll', min: 3.5, emoji: '🌟' },
                { label: 'B Average', min: 2.5, emoji: '👍' },
                { label: 'Passing', min: 1.5, emoji: '✅' },
                { label: 'All', min: 0, emoji: '📊' },
              ].map(opt => {
                const isActive = filters.minGpa === opt.min;
                return (
                  <button
                    key={opt.label}
                    onClick={() => onFilterChange({ minGpa: isActive ? 0 : opt.min })}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                      isActive
                        ? 'bg-accent/15 text-accent border border-accent/30'
                        : 'bg-surface text-text-tertiary border border-border hover:text-text-secondary'
                    }`}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Per-subject grade filters */}
            {SUBJECTS.map(subject => (
              <GradeFilter
                key={subject.key}
                subject={subject}
                value={filters.subjectMinGrade[subject.label] ?? null}
                onChange={(grade) => onFilterChange({
                  subjectMinGrade: {
                    ...filters.subjectMinGrade,
                    [subject.label]: grade,
                  },
                })}
              />
            ))}
          </div>
        </Section>
      ) : (
        <div className="px-3 py-4 text-center">
          <p className="text-[11px] text-text-tertiary">
            Pick an industry above to unlock grade filters
          </p>
        </div>
      )}
    </div>
  );
}
