'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import type { BatchStockData, FocusType } from '@/lib/filters';
import { getFocusGrade } from '@/lib/filters';
import { gradeToColor } from '@/lib/heatmap-colors';
import type { Grade } from '@/lib/grading';

interface HeatmapCellProps {
  stock: BatchStockData;
  focus: FocusType | null;
  matched: boolean;
  selected: boolean;
  onSelect: (symbol: string) => void;
  /** When all 3 filters are set, show contextualized percentile data */
  contextual?: {
    focusPercentile: number;  // 0-100
    focusLabel: string;       // e.g. "Top 12% profit margin"
  };
}

/** Cohort-analysis green gradient: darker green = higher GPA */
function gpaToGreen(gpa: number): string {
  const t = Math.max(0, Math.min(1, gpa / 4));
  const r = Math.round(20 + (1 - t) * 15);
  const g = Math.round(60 + t * 140);
  const b = Math.round(40 + (1 - t) * 10);
  const alpha = 0.3 + t * 0.55;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function HeatmapCell({
  stock,
  focus,
  matched,
  selected,
  onSelect,
  contextual,
}: HeatmapCellProps) {
  const [hovered, setHovered] = useState(false);
  const bgColor = gpaToGreen(stock.gpa);
  const focusGrade = getFocusGrade(stock, focus);

  return (
    <motion.button
      layout
      onClick={() => onSelect(stock.symbol)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        opacity: matched ? 1 : 0.15,
        scale: matched ? 1 : 0.97,
      }}
      whileHover={{ scale: 1.06, zIndex: 20 }}
      transition={{ duration: 0.2 }}
      className={`rounded-lg flex flex-col items-center justify-center
        gap-0.5 relative cursor-pointer transition-shadow
        ${selected ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-bg' : ''}
        ${matched ? 'hover:shadow-lg hover:shadow-green/10' : ''}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Ticker */}
      <span className="text-[11px] font-mono font-bold text-white/90 leading-none tracking-tight">
        {stock.symbol}
      </span>

      {/* GPA */}
      <span className="text-[10px] font-mono text-white/70 leading-none">
        {stock.gpa.toFixed(1)}
      </span>

      {/* Bottom line: contextual percentile when all filters active, else focus grade or change% */}
      {contextual ? (
        <span className="text-[8px] font-mono text-white/80 leading-none text-center px-0.5 truncate w-full">
          Top {Math.max(1, 100 - contextual.focusPercentile)}%
        </span>
      ) : focus && focusGrade ? (
        <span
          className="text-[9px] font-bold leading-none"
          style={{ color: gradeToColor(focusGrade) }}
        >
          {focusGrade}
        </span>
      ) : (
        <span className={`text-[9px] font-mono leading-none ${
          stock.changePercent >= 0 ? 'text-green/70' : 'text-rose/70'
        }`}>
          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
        </span>
      )}

      {/* Hover tooltip — always visible on hover */}
      {hovered && (
        <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2
          bg-surface-raised border border-border rounded-lg shadow-xl
          px-3 py-2 min-w-[160px] pointer-events-none"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">{stock.emoji}</span>
            <span className="font-mono font-bold text-xs text-text">{stock.symbol}</span>
          </div>
          <div className="text-[11px] text-text-secondary truncate mb-1">{stock.name}</div>
          <div className="flex items-center gap-2 text-[10px] mb-1.5">
            <span className="font-mono text-text">${stock.price.toFixed(2)}</span>
            <span className={`font-mono ${stock.changePercent >= 0 ? 'text-green' : 'text-rose'}`}>
              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-text-tertiary">{stock.sector}</span>
            <span className="text-text-tertiary">·</span>
            <span className="font-mono font-bold"
              style={{ color: gradeToColor(
                stock.gpa >= 3.5 ? 'A' : stock.gpa >= 2.5 ? 'B' : stock.gpa >= 1.5 ? 'C' : 'D' as Grade
              )}}
            >
              GPA {stock.gpa.toFixed(1)}
            </span>
          </div>
          {/* Mini grade row */}
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {stock.grades.slice(0, 4).map(g => (
              <span key={g.subject} className="text-[9px] px-1 rounded"
                style={{
                  color: gradeToColor(g.grade),
                  backgroundColor: `${gradeToColor(g.grade)}15`,
                }}
              >
                {g.subject.split(' ')[0]} {g.grade}
              </span>
            ))}
          </div>
          {contextual && (
            <div className="mt-1.5 text-[10px] text-accent font-medium">
              {contextual.focusLabel}
            </div>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
            border-l-4 border-r-4 border-t-4
            border-l-transparent border-r-transparent border-t-border" />
        </div>
      )}
    </motion.button>
  );
}
