'use client';

import { motion } from 'motion/react';
import type { BatchStockData, FocusType } from '@/lib/filters';
import { getFocusGrade } from '@/lib/filters';
import { changeToColor, gpaToColor, gradeToColor } from '@/lib/heatmap-colors';
import type { Grade } from '@/lib/grading';

interface HeatmapCellProps {
  stock: BatchStockData;
  colorMode: 'change' | 'gpa';
  focus: FocusType | null;
  matched: boolean;
  selected: boolean;
  onSelect: (symbol: string) => void;
  size: 'sm' | 'md' | 'lg';
}

export function HeatmapCell({
  stock,
  colorMode,
  focus,
  matched,
  selected,
  onSelect,
  size,
}: HeatmapCellProps) {
  const bgColor = colorMode === 'change'
    ? changeToColor(stock.changePercent)
    : gpaToColor(stock.gpa);

  const focusGrade = getFocusGrade(stock, focus);

  const sizeClasses = {
    sm: 'min-w-[52px] h-[52px]',
    md: 'min-w-[68px] h-[62px]',
    lg: 'min-w-[88px] h-[72px]',
  };

  return (
    <motion.button
      layout
      onClick={() => onSelect(stock.symbol)}
      animate={{
        opacity: matched ? 1 : 0.08,
        scale: matched ? 1 : 0.92,
      }}
      whileHover={matched ? { scale: 1.06, zIndex: 10 } : undefined}
      transition={{ duration: 0.25 }}
      className={`${sizeClasses[size]} rounded-lg flex flex-col items-center justify-center
        gap-0.5 relative cursor-pointer transition-shadow
        ${selected ? 'ring-2 ring-accent ring-offset-1 ring-offset-bg' : ''}
        ${matched ? 'hover:shadow-lg' : 'pointer-events-none'}`}
      style={{ backgroundColor: bgColor }}
    >
      <span className="text-sm leading-none">{stock.emoji}</span>
      <span className="text-[10px] font-mono font-bold text-white/90 leading-none">
        {stock.symbol}
      </span>

      {/* Show focus grade or change% */}
      {focus && focusGrade ? (
        <span
          className="text-[9px] font-bold leading-none"
          style={{ color: gradeToColor(focusGrade) }}
        >
          {focusGrade}
        </span>
      ) : (
        <span className={`text-[9px] font-mono leading-none ${
          stock.changePercent >= 0 ? 'text-green/80' : 'text-rose/80'
        }`}>
          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
        </span>
      )}
    </motion.button>
  );
}
