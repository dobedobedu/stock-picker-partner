'use client';

const COLOR_MAP = {
  green: '#34d399',
  amber: '#fbbf24',
  rose: '#f87171',
  accent: '#4f8cf7',
} as const;

const TEXT_MAP = {
  green: 'text-green',
  amber: 'text-amber',
  rose: 'text-rose',
  accent: 'text-accent',
} as const;

interface DonutChartProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: keyof typeof COLOR_MAP;
}

export function DonutChart({ label, value, max, unit = '%', color = 'accent' }: DonutChartProps) {
  const pct = Math.max(0, Math.min(1, value / (max || 1)));
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - pct);

  return (
    <div className="bg-surface rounded-xl p-4 flex flex-col items-center gap-2">
      <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">{label}</span>
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-border)" strokeWidth="7" />
          {/* Filled */}
          <circle
            cx="40" cy="40" r={r}
            fill="none"
            stroke={COLOR_MAP[color]}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold font-mono ${TEXT_MAP[color]}`}>
            {typeof value === 'number' ? value.toFixed(1) : value}{unit}
          </span>
        </div>
      </div>
    </div>
  );
}
