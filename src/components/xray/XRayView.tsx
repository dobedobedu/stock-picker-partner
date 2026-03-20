'use client';

import type { StockData } from '@/lib/stock';
import { formatMarketCap, formatLargeNumber } from '@/lib/stock';
import { MetricCard } from './MetricCard';

interface Props {
  stock: StockData;
}

/* ── Market Cap tiers with ranges ── */
const CAP_TIERS = [
  { label: 'Nano', min: 0, max: 50e6, color: '#555' },
  { label: 'Micro', min: 50e6, max: 300e6, color: '#6366f1' },
  { label: 'Small', min: 300e6, max: 2e9, color: '#a78bfa' },
  { label: 'Mid', min: 2e9, max: 10e9, color: '#22d3ee' },
  { label: 'Large', min: 10e9, max: 200e9, color: '#34d399' },
  { label: 'Mega', min: 200e9, max: Infinity, color: '#fbbf24' },
] as const;

function getCapTier(cap: number) {
  return CAP_TIERS.find(t => cap >= t.min && cap < t.max) ?? CAP_TIERS[CAP_TIERS.length - 1];
}

function getCapPercentile(cap: number): number {
  // Log scale percentile across market cap spectrum
  if (cap <= 0) return 0;
  const logCap = Math.log10(cap);
  const logMin = Math.log10(50e6);   // ~$50M = 0%
  const logMax = Math.log10(3e12);   // ~$3T = 100%
  return Math.max(0, Math.min(100, ((logCap - logMin) / (logMax - logMin)) * 100));
}

/* ── P/E categories ── */
const PE_ZONES = [
  { label: 'Deep Value', min: 0, max: 10, color: '#34d399' },
  { label: 'Value', min: 10, max: 20, color: '#22d3ee' },
  { label: 'Growth', min: 20, max: 40, color: '#fbbf24' },
  { label: 'Hyper Growth', min: 40, max: 80, color: '#f87171' },
  { label: 'Speculative', min: 80, max: Infinity, color: '#a78bfa' },
] as const;

function getPeZone(pe: number) {
  if (pe <= 0) return { label: 'N/A', min: 0, max: 0, color: '#555' };
  return PE_ZONES.find(z => pe >= z.min && pe < z.max) ?? PE_ZONES[PE_ZONES.length - 1];
}

export function XRayView({ stock }: Props) {
  const range52Pct =
    stock.high52 > stock.low52
      ? ((stock.price - stock.low52) / (stock.high52 - stock.low52)) * 100
      : 50;

  const capTier = getCapTier(stock.marketCap);
  const capPct = getCapPercentile(stock.marketCap);
  const peZone = getPeZone(stock.pe);
  const marginPct = stock.profitMargin * 100;
  const growthPct = stock.revenueGrowth * 100;

  const metrics = [
    {
      title: 'MARKET CAP',
      metaphor: capTier.label + ' Cap',
      value: formatMarketCap(stock.marketCap),
      metricName: 'Market Capitalization',
      visual: <MarketCapViz cap={stock.marketCap} tier={capTier} percentile={capPct} />,
    },
    {
      title: 'P/E RATIO',
      metaphor: peZone.label,
      value: stock.pe > 0 ? stock.pe.toFixed(1) : 'N/A',
      metricName: 'Price-to-Earnings Ratio',
      visual: <PeRatioViz pe={stock.pe} zone={peZone} />,
    },
    {
      title: 'REVENUE',
      metaphor: 'Money Coming In',
      value: formatLargeNumber(stock.revenue),
      metricName: 'Annual Revenue',
      visual: <RevenueViz revenue={stock.revenue} growth={growthPct} />,
    },
    {
      title: '52-WEEK RANGE',
      metaphor: 'Price Corridor',
      value: `$${stock.low52.toFixed(0)} — $${stock.high52.toFixed(0)}`,
      metricName: '52-Week Price Range',
      visual: <RangeViz low={stock.low52} high={stock.high52} current={stock.price} pct={range52Pct} />,
    },
    {
      title: 'PROFIT MARGIN',
      metaphor: 'What They Keep',
      value: `${marginPct.toFixed(1)}%`,
      metricName: 'Profit Margin',
      visual: <ProfitMarginViz margin={marginPct} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <MetricCard
          key={m.title}
          title={m.title}
          metaphor={m.metaphor}
          value={m.value}
          metricName={m.metricName}
          company={stock.name}
          visual={m.visual}
        />
      ))}
    </div>
  );
}

/* ── Market Cap: tier bar + percentile ── */

function MarketCapViz({ cap, tier, percentile }: { cap: number; tier: typeof CAP_TIERS[number]; percentile: number }) {
  return (
    <div className="h-20 flex flex-col justify-between">
      {/* Tier labels */}
      <div className="flex gap-1 mb-2">
        {CAP_TIERS.filter(t => t.label !== 'Nano').map(t => (
          <div
            key={t.label}
            className="flex-1 text-center"
          >
            <div
              className={`text-[9px] font-mono uppercase tracking-wider transition-all ${
                t.label === tier.label ? 'opacity-100' : 'opacity-25'
              }`}
              style={{ color: t.color }}
            >
              {t.label}
            </div>
          </div>
        ))}
      </div>
      {/* Percentile bar */}
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: '#1a1a2e' }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${percentile}%`,
            background: `linear-gradient(90deg, ${tier.color}88, ${tier.color})`,
            boxShadow: `0 0 12px ${tier.color}66, 0 0 4px ${tier.color}44`,
          }}
        />
        {/* Tick marks for tier boundaries */}
        {[18, 35, 52, 70, 87].map((pos, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${pos}%`, background: 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>
      {/* Percentile label */}
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-[10px] font-mono text-text-tertiary">$50M</span>
        <span
          className="text-xs font-mono font-bold neon-text"
          style={{ color: tier.color }}
        >
          {formatMarketCap(cap)}
        </span>
        <span className="text-[10px] font-mono text-text-tertiary">$3T</span>
      </div>
    </div>
  );
}

/* ── P/E Ratio: zone indicator with ranges ── */

function PeRatioViz({ pe, zone }: { pe: number; zone: ReturnType<typeof getPeZone> }) {
  const clampedPe = Math.max(0, Math.min(pe, 100));
  // Map PE to position: 0-100 PE maps to 0-100% across the zones
  const position = pe <= 0 ? 0 : Math.min(100, (clampedPe / 100) * 100);

  return (
    <div className="h-20 flex flex-col justify-between">
      {/* Zone segments */}
      <div className="flex gap-0.5 h-6 rounded overflow-hidden">
        {PE_ZONES.filter(z => z.max !== Infinity || z.label === 'Speculative').slice(0, 4).map(z => {
          const isActive = zone.label === z.label;
          const width = z.label === 'Deep Value' ? '12%' : z.label === 'Value' ? '13%' : z.label === 'Growth' ? '35%' : '40%';
          return (
            <div
              key={z.label}
              className="relative flex items-center justify-center transition-all"
              style={{
                width,
                background: isActive ? `${z.color}33` : '#1a1a2e',
                borderBottom: isActive ? `2px solid ${z.color}` : '2px solid transparent',
                boxShadow: isActive ? `0 0 8px ${z.color}22` : 'none',
              }}
            >
              <span
                className={`text-[9px] font-mono uppercase tracking-wide ${isActive ? '' : 'opacity-30'}`}
                style={{ color: z.color }}
              >
                {z.label.replace('Deep ', 'D.')}
              </span>
            </div>
          );
        })}
      </div>
      {/* PE scale bar with needle */}
      <div className="relative mt-2">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a2e' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${position}%`,
              background: `linear-gradient(90deg, #34d399, #22d3ee, #fbbf24, #f87171)`,
            }}
          />
        </div>
        {pe > 0 && (
          <div
            className="absolute -top-1 w-0.5 h-3.5 rounded-full transition-all duration-500"
            style={{
              left: `${position}%`,
              background: zone.color,
              boxShadow: `0 0 6px ${zone.color}`,
            }}
          />
        )}
      </div>
      {/* Labels */}
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-[10px] font-mono text-text-tertiary">0</span>
        <span
          className="text-sm font-mono font-bold neon-text"
          style={{ color: zone.color }}
        >
          {pe > 0 ? pe.toFixed(1) : 'N/A'}
        </span>
        <span className="text-[10px] font-mono text-text-tertiary">80+</span>
      </div>
    </div>
  );
}

/* ── Revenue: bar with growth percentage ── */

function RevenueViz({ revenue, growth }: { revenue: number; growth: number }) {
  const growthColor = growth > 20 ? '#34d399' : growth > 5 ? '#22d3ee' : growth > 0 ? '#fbbf24' : '#f87171';
  const growthLabel = growth > 20 ? 'RAPID' : growth > 5 ? 'STEADY' : growth > 0 ? 'SLOW' : 'DECLINING';
  // Normalize bar height: log scale from $1M to $500B
  const logRev = revenue > 0 ? Math.log10(revenue) : 0;
  const barPct = Math.max(5, Math.min(100, ((logRev - 6) / (11.7 - 6)) * 100));

  return (
    <div className="h-20 flex gap-4 items-end">
      {/* Revenue bar */}
      <div className="flex-1 h-full flex items-end">
        <div className="w-full h-full relative rounded-t overflow-hidden" style={{ background: '#1a1a2e' }}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t transition-all duration-700"
            style={{
              height: `${barPct}%`,
              background: 'linear-gradient(180deg, #22d3ee, #22d3ee44)',
              boxShadow: '0 0 15px rgba(34, 211, 238, 0.2)',
            }}
          />
          {/* Grid lines */}
          {[25, 50, 75].map(y => (
            <div
              key={y}
              className="absolute left-0 right-0 h-px"
              style={{ bottom: `${y}%`, background: 'rgba(255,255,255,0.04)' }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-mono font-bold text-white/80">
              {formatLargeNumber(revenue)}
            </span>
          </div>
        </div>
      </div>
      {/* Growth indicator */}
      <div className="flex flex-col items-center justify-end gap-1 min-w-[72px]">
        <div
          className="text-[9px] font-mono uppercase tracking-wider"
          style={{ color: growthColor }}
        >
          {growthLabel}
        </div>
        <div className="relative w-16 h-10">
          {/* Growth percentage ring */}
          <svg viewBox="0 0 64 40" className="w-full h-full">
            <path
              d="M 4 38 A 28 28 0 0 1 60 38"
              fill="none" stroke="#1a1a2e" strokeWidth="4" strokeLinecap="round"
            />
            <path
              d="M 4 38 A 28 28 0 0 1 60 38"
              fill="none" strokeWidth="4" strokeLinecap="round"
              stroke={growthColor}
              strokeDasharray={`${Math.min(88, Math.max(0, Math.abs(growth) / 50 * 88))} 88`}
              style={{ filter: `drop-shadow(0 0 4px ${growthColor}66)` }}
            />
          </svg>
        </div>
        <span
          className="text-sm font-mono font-bold neon-text"
          style={{ color: growthColor }}
        >
          {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

/* ── 52-Week Range: cyberpunk corridor ── */

function RangeViz({ low, high, current, pct }: { low: number; high: number; current: number; pct: number }) {
  const posColor = pct > 70 ? '#34d399' : pct > 30 ? '#22d3ee' : '#f87171';

  return (
    <div className="h-20 flex flex-col justify-center">
      {/* Position label */}
      <div className="text-center mb-2">
        <span className="text-[10px] font-mono text-text-tertiary">POSITION IN RANGE: </span>
        <span
          className="text-xs font-mono font-bold"
          style={{ color: posColor }}
        >
          {pct.toFixed(0)}%
        </span>
      </div>
      {/* Range bar */}
      <div className="relative h-5 rounded" style={{ background: '#1a1a2e' }}>
        {/* Gradient fill */}
        <div
          className="absolute inset-y-0 left-0 rounded transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, #f8717144, ${posColor}88)`,
          }}
        />
        {/* Current price marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 transition-all duration-500"
          style={{
            left: `${pct}%`,
            background: posColor,
            boxShadow: `0 0 8px ${posColor}, 0 0 2px ${posColor}`,
          }}
        />
        {/* Marker diamond */}
        <div
          className="absolute -top-1 w-3 h-3 rotate-45 transition-all duration-500"
          style={{
            left: `calc(${pct}% - 6px)`,
            background: posColor,
            boxShadow: `0 0 8px ${posColor}88`,
          }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] font-mono text-text-tertiary">
          LOW ${low.toFixed(0)}
        </span>
        <span
          className="text-xs font-mono font-bold neon-text"
          style={{ color: posColor }}
        >
          ${current.toFixed(0)}
        </span>
        <span className="text-[10px] font-mono text-text-tertiary">
          HIGH ${high.toFixed(0)}
        </span>
      </div>
    </div>
  );
}

/* ── Profit Margin: large cyberpunk gauge ── */

function ProfitMarginViz({ margin }: { margin: number }) {
  const color = margin > 20 ? '#34d399' : margin > 10 ? '#22d3ee' : margin > 0 ? '#fbbf24' : '#f87171';
  const label = margin > 20 ? 'HIGH' : margin > 10 ? 'SOLID' : margin > 0 ? 'THIN' : 'LOSS';
  const absMargin = Math.abs(margin);
  // Arc calculation: 0-50% maps to full arc
  const arcPct = Math.min(100, (absMargin / 50) * 100);
  const circumference = 2 * Math.PI * 42;
  const dashLen = (arcPct / 100) * circumference * 0.75; // 270deg arc
  const dashGap = circumference;

  return (
    <div className="h-28 flex flex-col items-center justify-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-225deg)' }}>
          {/* Background arc */}
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="6"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${dashLen} ${dashGap}`}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${color}88)`,
              transition: 'stroke-dasharray 0.7s ease',
            }}
          />
          {/* Tick marks */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => {
            const angle = (-225 + t * 270) * (Math.PI / 180);
            const x1 = 50 + 36 * Math.cos(angle);
            const y1 = 50 + 36 * Math.sin(angle);
            const x2 = 50 + 39 * Math.cos(angle);
            const y2 = 50 + 39 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-mono font-bold neon-text"
            style={{ color }}
          >
            {margin.toFixed(1)}%
          </span>
          <span
            className="text-[9px] font-mono uppercase tracking-widest mt-0.5"
            style={{ color }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
