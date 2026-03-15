'use client';

import type { StockData } from '@/lib/stock';
import { formatMarketCap, formatLargeNumber } from '@/lib/stock';
import { MetricCard } from './MetricCard';

interface Props {
  stock: StockData;
}

export function XRayView({ stock }: Props) {
  // Calculate where current price sits in 52-week range
  const range52Pct =
    stock.high52 > stock.low52
      ? ((stock.price - stock.low52) / (stock.high52 - stock.low52)) * 100
      : 50;

  const metrics = [
    {
      title: 'Market Cap',
      metaphor: 'Company Size',
      value: formatMarketCap(stock.marketCap),
      metricName: 'Market Capitalization',
      visual: (
        <div className="flex items-end gap-1 h-16">
          {/* Building metaphor — taller = bigger */}
          {[1e9, 10e9, 100e9, 500e9, 1e12].map((threshold, i) => (
            <div
              key={i}
              className={`w-6 rounded-t transition-all ${
                stock.marketCap >= threshold ? 'bg-accent' : 'bg-border'
              }`}
              style={{ height: `${20 + i * 12}%` }}
            />
          ))}
        </div>
      ),
    },
    {
      title: 'P/E Ratio',
      metaphor: 'Price Tag',
      value: stock.pe > 0 ? stock.pe.toFixed(1) : 'N/A',
      metricName: 'Price-to-Earnings Ratio',
      visual: (
        <GaugeDial value={stock.pe} max={80} />
      ),
    },
    {
      title: 'Revenue',
      metaphor: 'Money Coming In',
      value: formatLargeNumber(stock.revenue),
      metricName: 'Annual Revenue',
      visual: (
        <div className="h-16 flex items-end">
          <div className="w-full bg-border rounded-t h-full relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-green rounded-t transition-all"
              style={{ height: `${Math.min(100, Math.max(10, (stock.revenue / 400e9) * 100))}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      title: '52-Week Range',
      metaphor: 'Temperature Check',
      value: `$${stock.low52.toFixed(0)} — $${stock.high52.toFixed(0)}`,
      metricName: '52-Week Price Range',
      visual: (
        <div className="h-16 flex flex-col justify-center">
          <div className="relative h-3 bg-border rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-accent-dim to-accent rounded-full"
              style={{ width: `${range52Pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-text-tertiary font-mono">
            <span>${stock.low52.toFixed(0)}</span>
            <span className="text-accent font-medium">${stock.price.toFixed(0)}</span>
            <span>${stock.high52.toFixed(0)}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Profit Margin',
      metaphor: 'What They Keep',
      value: `${(stock.profitMargin * 100).toFixed(1)}%`,
      metricName: 'Profit Margin',
      visual: (
        <div className="h-16 flex items-center justify-center">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18" cy="18" r="15.915"
                fill="none" stroke="currentColor"
                className="text-border" strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15.915"
                fill="none"
                className={stock.profitMargin > 0 ? 'text-green' : 'text-rose'}
                strokeWidth="3"
                strokeDasharray={`${Math.abs(stock.profitMargin) * 100} ${100 - Math.abs(stock.profitMargin) * 100}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-medium">
              {(stock.profitMargin * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      ),
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

/* ── Inline Gauge Dial ── */

function GaugeDial({ value, max }: { value: number; max: number }) {
  const clamped = Math.max(0, Math.min(value, max));
  const pct = (clamped / max) * 100;
  const color =
    value <= 0 ? 'text-text-tertiary'
    : value < 20 ? 'text-green'
    : value < 40 ? 'text-amber'
    : 'text-rose';

  return (
    <div className="h-16 flex flex-col items-center justify-center">
      <div className="relative w-20 h-10 overflow-hidden">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none" stroke="currentColor"
            className="text-border" strokeWidth="8" strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none" stroke="currentColor"
            className={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${pct * 1.26} 126`}
          />
        </svg>
      </div>
      <span className={`text-xs font-mono font-medium ${color}`}>
        {value > 0 ? value.toFixed(1) : 'N/A'}
      </span>
    </div>
  );
}
