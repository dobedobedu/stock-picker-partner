'use client';

interface DataPoint {
  label: string;
  value: number;
}

interface Annotation {
  label: string;
  value: number;
  note: string;
}

interface PriceChartProps {
  title: string;
  data: DataPoint[];
  annotations?: Annotation[];
}

export function PriceChart({ title, data, annotations = [] }: PriceChartProps) {
  if (data.length < 2) return null;

  const values = data.map(d => d.value);
  const minVal = Math.min(...values) * 0.95;
  const maxVal = Math.max(...values) * 1.05;
  const range = maxVal - minVal || 1;

  const w = 400;
  const h = 160;
  const padX = 40;
  const padY = 20;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + chartH - ((d.value - minVal) / range) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Gradient area
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  // Color: green if ending higher, rose if lower
  const isUp = data[data.length - 1].value >= data[0].value;
  const color = isUp ? '#34d399' : '#f87171';

  return (
    <div className="bg-surface rounded-xl p-4 border border-border">
      <span className="text-sm font-medium mb-3 block">{title}</span>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`grad-${title.replace(/\s/g, '')}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = padY + chartH * (1 - pct);
          const val = minVal + range * pct;
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={padX + chartW} y2={y} stroke="var(--color-border)" strokeWidth="0.5" />
              <text x={padX - 4} y={y + 3} textAnchor="end" className="text-[8px]" fill="var(--color-text-tertiary)">
                ${val.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#grad-${title.replace(/\s/g, '')})`} />

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />

        {/* X labels (first and last) */}
        <text x={points[0].x} y={padY + chartH + 14} textAnchor="start" className="text-[8px]" fill="var(--color-text-tertiary)">
          {data[0].label}
        </text>
        <text x={points[points.length - 1].x} y={padY + chartH + 14} textAnchor="end" className="text-[8px]" fill="var(--color-text-tertiary)">
          {data[data.length - 1].label}
        </text>

        {/* Annotations */}
        {annotations.map((ann, i) => {
          // Find closest data point
          const closest = points.reduce((prev, curr) =>
            Math.abs(curr.value - ann.value) < Math.abs(prev.value - ann.value) ? curr : prev
          );
          return (
            <g key={i}>
              <circle cx={closest.x} cy={closest.y} r="4" fill={color} stroke="var(--color-bg)" strokeWidth="2" />
              <text x={closest.x} y={closest.y - 10} textAnchor="middle" className="text-[7px]" fill="var(--color-text)">
                {ann.note}
              </text>
            </g>
          );
        })}

        {/* Endpoint dots */}
        <circle cx={points[0].x} cy={points[0].y} r="3" fill={color} />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill={color} />
      </svg>
    </div>
  );
}
