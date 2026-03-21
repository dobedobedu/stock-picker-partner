'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import type { BatchStockData, FocusType } from '@/lib/filters';
import { getFocusGrade } from '@/lib/filters';
import { gradeToColor } from '@/lib/heatmap-colors';
import type { Grade } from '@/lib/grading';

export type ColorMode = 'gpa' | 'delta';

interface HeatmapCellProps {
  stock: BatchStockData;
  focus: FocusType | null;
  matched: boolean;
  selected: boolean;
  colorMode: ColorMode;
  onSelect: (symbol: string) => void;
  contextual?: {
    focusPercentile: number;
    focusLabel: string;
  };
}

/** GPA mode: green gradient (darker = higher GPA) */
function gpaToGreen(gpa: number): string {
  const t = Math.max(0, Math.min(1, gpa / 4));
  const r = Math.round(20 + (1 - t) * 15);
  const g = Math.round(60 + t * 140);
  const b = Math.round(40 + (1 - t) * 10);
  const alpha = 0.3 + t * 0.55;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Delta mode: full red → amber → green spectrum
 * -5% = deep red, 0% = amber/neutral, +5% = deep green
 * People in the middle (near 0%) get amber so learners can see the spread
 */
function deltaToSpectrum(changePercent: number): string {
  const clamped = Math.max(-5, Math.min(5, changePercent));
  const t = (clamped + 5) / 10; // 0 = deep red, 0.5 = amber, 1 = deep green

  let r: number, g: number, b: number;
  if (t < 0.5) {
    // Red → Amber: interpolate red(220,50,50) → amber(220,170,40)
    const s = t * 2; // 0..1
    r = Math.round(220);
    g = Math.round(50 + s * 120);
    b = Math.round(50 - s * 10);
  } else {
    // Amber → Green: interpolate amber(220,170,40) → green(40,190,60)
    const s = (t - 0.5) * 2; // 0..1
    r = Math.round(220 - s * 180);
    g = Math.round(170 + s * 20);
    b = Math.round(40 + s * 20);
  }

  const alpha = 0.35 + Math.abs(clamped) * 0.09;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function HeatmapCell({
  stock,
  focus,
  matched,
  selected,
  colorMode,
  onSelect,
  contextual,
}: HeatmapCellProps) {
  const [hovered, setHovered] = useState(false);
  const bgColor = colorMode === 'gpa' ? gpaToGreen(stock.gpa) : deltaToSpectrum(stock.changePercent);
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

      {/* Primary value based on color mode */}
      {colorMode === 'gpa' ? (
        <span className="text-[10px] font-mono text-white/70 leading-none">
          {stock.gpa.toFixed(1)}
        </span>
      ) : (
        <span className={`text-[10px] font-mono leading-none ${
          stock.changePercent >= 0 ? 'text-white/80' : 'text-white/80'
        }`}>
          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
        </span>
      )}

      {/* Bottom line: contextual percentile, focus grade, or secondary value */}
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
      ) : colorMode === 'gpa' ? (
        <span className={`text-[9px] font-mono leading-none ${
          stock.changePercent >= 0 ? 'text-green/70' : 'text-rose/70'
        }`}>
          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
        </span>
      ) : (
        <span className="text-[9px] font-mono text-white/50 leading-none">
          {stock.gpa.toFixed(1)}
        </span>
      )}

      {/* Hover tooltip */}
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
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
            border-l-4 border-r-4 border-t-4
            border-l-transparent border-r-transparent border-t-border" />
        </div>
      )}
    </motion.button>
  );
}
