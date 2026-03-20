'use client';

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-green/20 text-green border-green/30',
  B: 'bg-accent/20 text-accent border-accent/30',
  C: 'bg-amber/20 text-amber border-amber/30',
  D: 'bg-rose/20 text-rose border-rose/30',
  F: 'bg-rose/30 text-rose border-rose/40',
};

interface GradeCardProps {
  subject: string;
  grade: string;
  reason: string;
  value?: string;
}

export function GradeCard({ subject, grade, reason, value }: GradeCardProps) {
  const colors = GRADE_COLORS[grade] ?? GRADE_COLORS.C;

  return (
    <div className="bg-surface rounded-xl p-4 border border-border flex items-start gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold border ${colors} shrink-0`}>
        {grade}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{subject}</span>
          {value && <span className="text-xs text-text-tertiary font-mono">{value}</span>}
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{reason}</p>
      </div>
    </div>
  );
}
