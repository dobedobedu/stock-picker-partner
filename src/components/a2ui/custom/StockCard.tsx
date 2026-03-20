'use client';

const GRADE_COLORS: Record<string, string> = {
  A: 'text-green bg-green/15',
  B: 'text-accent bg-accent/15',
  C: 'text-amber bg-amber/15',
  D: 'text-rose bg-rose/15',
  F: 'text-rose bg-rose/25',
};

interface StockCardProps {
  symbol: string;
  name: string;
  emoji: string;
  sector: string;
  gpa: number;
  grades: { subject: string; grade: string }[];
  insight: string;
  actionId?: string;
  onAction?: (action: { type: string; value: string }) => void;
}

export function StockCard({ symbol, name, emoji, sector, gpa, grades, insight, actionId, onAction }: StockCardProps) {
  const gpaColor = gpa >= 3.5 ? 'text-green' : gpa >= 2.5 ? 'text-accent' : gpa >= 1.5 ? 'text-amber' : 'text-rose';

  return (
    <button
      onClick={() => onAction?.({ type: 'expand-stock', value: symbol })}
      className="w-full bg-surface hover:bg-surface-hover border border-border rounded-xl p-4 text-left transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{name}</span>
              <span className="text-xs text-text-tertiary font-mono">{symbol}</span>
            </div>
            <span className="text-xs text-text-tertiary">{sector}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold font-mono ${gpaColor}`}>{gpa.toFixed(1)}</div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wide">GPA</div>
        </div>
      </div>

      {/* Grade badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {grades.map((g, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${GRADE_COLORS[g.grade] ?? ''}`}
          >
            {g.subject}: {g.grade}
          </span>
        ))}
      </div>

      {/* Insight */}
      <p className="text-xs text-text-secondary leading-relaxed">{insight}</p>

      {/* Hover hint */}
      <div className="mt-2 text-[10px] text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
        Tap to see full analysis →
      </div>
    </button>
  );
}
