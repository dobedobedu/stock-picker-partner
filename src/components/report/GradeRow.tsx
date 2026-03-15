'use client';

import { useState } from 'react';
import type { Grade, SubjectGrade } from '@/lib/stock';

const GRADES: Grade[] = ['A', 'B', 'C', 'D', 'F'];

const gradeColor: Record<Grade, string> = {
  A: 'text-green bg-green/10 border-green/20',
  B: 'text-accent bg-accent/10 border-accent/20',
  C: 'text-amber bg-amber/10 border-amber/20',
  D: 'text-rose bg-rose/10 border-rose/20',
  F: 'text-rose bg-rose/10 border-rose/20',
};

interface Props {
  grade: SubjectGrade;
  onOverride: (grade: Grade) => void;
}

export function GradeRow({ grade, onOverride }: Props) {
  const [showOverride, setShowOverride] = useState(false);

  return (
    <div className="p-4 hover:bg-surface-hover transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-medium">{grade.subject}</h4>
            <span className="text-xs text-text-tertiary">{grade.description}</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">{grade.value}</p>
          <p className="text-xs text-text-tertiary mt-0.5">{grade.reason}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Grade badge */}
          <button
            onClick={() => setShowOverride(!showOverride)}
            className={`w-10 h-10 rounded-lg border text-lg font-bold flex items-center justify-center
                        ${gradeColor[grade.grade]} transition-colors`}
            title="Click to override grade"
          >
            {grade.grade}
          </button>
        </div>
      </div>

      {/* Override picker */}
      {showOverride && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-text-tertiary">Override:</span>
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => {
                onOverride(g);
                setShowOverride(false);
              }}
              className={`w-7 h-7 rounded text-xs font-bold border transition-colors ${
                g === grade.grade ? gradeColor[g] : 'border-border text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
