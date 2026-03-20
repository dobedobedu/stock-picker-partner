'use client';

const TIER_COLORS: Record<string, string> = {
  green: 'bg-green/30',
  amber: 'bg-amber/30',
  rose: 'bg-rose/30',
};

const MARKER_COLORS: Record<string, string> = {
  green: 'bg-green',
  amber: 'bg-amber',
  rose: 'bg-rose',
};

interface Tier {
  label: string;
  min: number;
  max: number;
  color: 'green' | 'amber' | 'rose';
}

interface MetricBarProps {
  label: string;
  value: number;
  tiers: Tier[];
  unit?: string;
}

export function MetricBar({ label, value, tiers, unit = '' }: MetricBarProps) {
  if (tiers.length === 0) return null;

  const globalMin = Math.min(...tiers.map(t => t.min));
  const globalMax = Math.max(...tiers.map(t => t.max));
  const range = globalMax - globalMin || 1;
  const markerPct = Math.max(0, Math.min(100, ((value - globalMin) / range) * 100));

  // Find which tier the value falls in
  const activeTier = tiers.find(t => value >= t.min && value < t.max) ?? tiers[tiers.length - 1];

  return (
    <div className="bg-surface rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm font-mono font-semibold ${
          activeTier.color === 'green' ? 'text-green' :
          activeTier.color === 'amber' ? 'text-amber' : 'text-rose'
        }`}>
          {value.toFixed(1)}{unit}
        </span>
      </div>

      {/* Tier bar */}
      <div className="relative h-6 rounded-lg overflow-hidden flex">
        {tiers.map((tier, i) => {
          const width = ((tier.max - tier.min) / range) * 100;
          return (
            <div
              key={i}
              className={`h-full relative ${TIER_COLORS[tier.color]}`}
              style={{ width: `${width}%` }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-text-secondary font-medium">
                {tier.label}
              </span>
            </div>
          );
        })}

        {/* Value marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-text"
          style={{ left: `${markerPct}%` }}
        >
          <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-bg ${MARKER_COLORS[activeTier.color]}`} />
        </div>
      </div>

      {/* Tier labels below */}
      <div className="flex mt-1">
        {tiers.map((tier, i) => {
          const width = ((tier.max - tier.min) / range) * 100;
          return (
            <div key={i} style={{ width: `${width}%` }} className="text-[10px] text-text-tertiary text-center">
              {tier.min}{unit}–{tier.max}{unit}
            </div>
          );
        })}
      </div>
    </div>
  );
}
