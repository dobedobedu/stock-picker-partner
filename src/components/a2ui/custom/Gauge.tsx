'use client';

const COLOR_MAP = {
  green: 'text-green',
  amber: 'text-amber',
  rose: 'text-rose',
  accent: 'text-accent',
} as const;

const STROKE_MAP = {
  green: '#34d399',
  amber: '#fbbf24',
  rose: '#f87171',
  accent: '#4f8cf7',
} as const;

interface GaugeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  color?: keyof typeof COLOR_MAP;
}

export function Gauge({ label, value, min, max, unit = '', color = 'accent' }: GaugeProps) {
  const range = max - min;
  const pct = Math.max(0, Math.min(1, (value - min) / (range || 1)));
  // Arc from -135° to +135° (270° sweep)
  const angle = -135 + pct * 270;
  const r = 40;
  const cx = 50;
  const cy = 50;

  // Needle endpoint
  const rad = (angle * Math.PI) / 180;
  const nx = cx + r * 0.75 * Math.cos(rad);
  const ny = cy + r * 0.75 * Math.sin(rad);

  // Arc path for the track
  const startAngle = -135;
  const endAngle = 135;
  const arcPath = describeArc(cx, cy, r, startAngle, endAngle);
  const filledPath = describeArc(cx, cy, r, startAngle, -135 + pct * 270);

  return (
    <div className="bg-surface rounded-xl p-4 flex flex-col items-center gap-2">
      <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">{label}</span>
      <svg viewBox="0 0 100 70" className="w-28 h-20">
        {/* Track */}
        <path d={arcPath} fill="none" stroke="var(--color-border)" strokeWidth="6" strokeLinecap="round" />
        {/* Filled arc */}
        <path d={filledPath} fill="none" stroke={STROKE_MAP[color]} strokeWidth="6" strokeLinecap="round" />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="3" fill="var(--color-text)" />
      </svg>
      <div className="flex items-baseline gap-1">
        <span className={`text-lg font-semibold font-mono ${COLOR_MAP[color]}`}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        {unit && <span className="text-xs text-text-tertiary">{unit}</span>}
      </div>
    </div>
  );
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
