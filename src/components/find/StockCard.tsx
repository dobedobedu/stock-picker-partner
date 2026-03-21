'use client';

import { motion } from 'motion/react';
import type { BatchStockData } from '@/lib/filters';
import { gradeToColor } from '@/lib/heatmap-colors';
import { getSectorStyle, getPatternSize } from '@/lib/sector-patterns';

interface StockCardProps {
  stock: BatchStockData;
  variant: 'compact' | 'full';
  rotation?: number;
  onAdd?: () => void;
  onRemove?: () => void;
}

export function StockCard({ stock, variant, rotation = 0, onAdd, onRemove }: StockCardProps) {
  const style = getSectorStyle(stock.sector);
  const patternSize = getPatternSize(stock.sector);

  if (variant === 'compact') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, rotate: rotation }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ y: -12, scale: 1.05, zIndex: 20, rotate: 0 }}
        className="relative w-[72px] h-[96px] rounded-xl overflow-hidden cursor-pointer
          border border-border shadow-md flex flex-col"
        style={{ backgroundColor: style.bg }}
      >
        {/* Pattern area */}
        <div
          className="h-[40px] w-full"
          style={{
            background: style.pattern,
            backgroundSize: patternSize,
          }}
        />

        {/* Info */}
        <div className="flex-1 flex flex-col items-center justify-center px-1 gap-0.5">
          <span className="text-base leading-none">{stock.emoji}</span>
          <span className="text-[10px] font-mono font-bold text-text leading-none">
            {stock.symbol}
          </span>
          <span
            className="text-[10px] font-bold leading-none"
            style={{ color: style.color }}
          >
            {stock.gpa.toFixed(1)}
          </span>
        </div>

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-bg/60 text-text-tertiary
              text-[10px] flex items-center justify-center hover:bg-rose/30 hover:text-rose transition-colors"
          >
            ×
          </button>
        )}
      </motion.div>
    );
  }

  // Full variant — grade panel card
  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ backgroundColor: style.bg }}>
      {/* Pattern header */}
      <div
        className="h-[60px] w-full relative"
        style={{
          background: style.pattern,
          backgroundSize: patternSize,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
      </div>

      {/* Stock info */}
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{stock.emoji}</span>
          <div>
            <div className="font-medium text-sm text-text">{stock.name}</div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-mono text-text-secondary">{stock.symbol}</span>
              <span className="text-text-tertiary">·</span>
              <span className="font-mono text-text-secondary">${stock.price.toFixed(2)}</span>
              <span className={`font-mono ${stock.changePercent >= 0 ? 'text-green' : 'text-rose'}`}>
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Grade breakdown */}
        <div className="space-y-1.5">
          {stock.grades.map(g => {
            const color = gradeToColor(g.grade);
            const pct = { A: 100, B: 75, C: 50, D: 25, F: 10 }[g.grade];
            return (
              <div key={g.subject} className="flex items-center gap-2">
                <span className="text-[11px] text-text-secondary w-[90px] truncate">{g.subject}</span>
                <div className="flex-1 h-1.5 bg-border/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <span
                  className="text-[11px] font-bold w-4 text-right"
                  style={{ color }}
                >
                  {g.grade}
                </span>
              </div>
            );
          })}
        </div>

        {/* GPA */}
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <span className="text-[11px] text-text-tertiary">GPA</span>
          <span className="font-mono font-bold text-sm" style={{ color: style.color }}>
            {stock.gpa.toFixed(1)}
          </span>
        </div>

        {/* Actions */}
        {onAdd && (
          <button
            onClick={onAdd}
            className="w-full px-3 py-1.5 rounded-lg text-[11px] font-medium
              bg-surface border border-border text-text-secondary
              hover:bg-surface-hover hover:text-text transition-colors"
          >
            Add to Deck
          </button>
        )}
      </div>
    </div>
  );
}
