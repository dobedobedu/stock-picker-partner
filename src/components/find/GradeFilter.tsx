'use client';

import type { Grade } from '@/lib/grading';
import type { SubjectMeta } from '@/lib/grading';
import { gradeToColor } from '@/lib/heatmap-colors';
import { FilterTooltip } from './FilterTooltip';

interface GradeFilterProps {
  subject: SubjectMeta;
  value: Grade | null;
  onChange: (grade: Grade | null) => void;
}

const GRADE_OPTIONS: { grade: Grade | null; label: string }[] = [
  { grade: 'A', label: 'A' },
  { grade: 'B', label: 'B+' },
  { grade: 'C', label: 'C+' },
  { grade: null, label: 'Any' },
];

export function GradeFilter({ subject, value, onChange }: GradeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <FilterTooltip text={subject.tooltip}>
        <span className="flex items-center gap-1 min-w-[100px] text-[11px] text-text-secondary cursor-help">
          <span>{subject.emoji}</span>
          <span className="truncate">{subject.label}</span>
        </span>
      </FilterTooltip>

      <div className="flex gap-0.5 ml-auto">
        {GRADE_OPTIONS.map(opt => {
          const isActive = value === opt.grade;
          const color = opt.grade ? gradeToColor(opt.grade) : undefined;

          return (
            <button
              key={opt.label}
              onClick={() => onChange(opt.grade)}
              className={`w-7 h-6 rounded text-[10px] font-bold transition-all ${
                isActive
                  ? 'ring-1 ring-offset-1 ring-offset-bg'
                  : 'bg-surface border border-border text-text-tertiary hover:text-text-secondary'
              }`}
              style={isActive && color ? {
                backgroundColor: `${color}22`,
                color: color,
                borderColor: `${color}44`,
                // @ts-expect-error CSS custom property
                '--tw-ring-color': `${color}66`,
              } : undefined}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
