'use client';

import type { SubjectPercentile } from '@/lib/percentiles';
import { gradeToColor, gradeToBg } from '@/lib/heatmap-colors';
import type { Grade } from '@/lib/grading';

interface GradeCardProps {
  data: SubjectPercentile;
}

export function GradeCard({ data }: GradeCardProps) {
  const color = gradeToColor(data.grade as Grade);
  const bg = gradeToBg(data.grade as Grade);

  return (
    <div
      className="rounded-xl border border-border p-4 space-y-3"
      style={{ backgroundColor: bg }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{data.emoji}</span>
          <span className="text-sm font-medium text-text">{data.subject}</span>
        </div>
        <span
          className="text-2xl font-bold font-mono"
          style={{ color }}
        >
          {data.grade}
        </span>
      </div>

      {/* Metric value */}
      <div className="text-sm text-text-secondary">
        <span className="font-mono font-semibold text-text">{data.metricValue}</span>
        {' '}
        <span>{data.metricLabel}</span>
      </div>

      {/* Percentile bar */}
      <div className="space-y-1.5">
        <div className="relative h-2 bg-border/30 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{
              width: `${data.percentile}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span style={{ color }} className="font-medium">
            Top {Math.max(1, 100 - data.percentile)}% in {data.total > 0 ? `${data.total} stocks` : 'sector'}
          </span>
          <span className="text-text-tertiary">
            Sector avg: {data.sectorAvgFormatted}
          </span>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-text-secondary leading-relaxed">
        {data.explanation}
      </p>
    </div>
  );
}
