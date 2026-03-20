'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  loadPortfolio,
  removeFromPortfolio,
  loadAlerts,
  clearAlerts,
  MAX_SLOTS,
  type PortfolioSlot,
  type GradeChange,
} from '@/lib/portfolio';

const GRADE_COLORS: Record<string, string> = {
  A: 'text-green',
  B: 'text-accent',
  C: 'text-amber',
  D: 'text-rose',
  F: 'text-rose',
};

interface PortfolioTrayProps {
  onAlertTap?: (change: GradeChange) => void;
  refreshTrigger?: number;
}

export function PortfolioTray({ onAlertTap, refreshTrigger }: PortfolioTrayProps) {
  const [slots, setSlots] = useState<PortfolioSlot[]>([]);
  const [alerts, setAlerts] = useState<GradeChange[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setSlots(loadPortfolio());
    setAlerts(loadAlerts());
  }, [refreshTrigger]);

  const handleRemove = useCallback((symbol: string) => {
    const updated = removeFromPortfolio(symbol);
    setSlots(updated);
  }, []);

  const handleClearAlerts = useCallback(() => {
    clearAlerts();
    setAlerts([]);
  }, []);

  if (slots.length === 0 && alerts.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Alert banner */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-amber/10 border-t border-amber/20 px-4 py-2 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-amber shrink-0" />
            <div className="flex-1 min-w-0 overflow-x-auto flex gap-3">
              {alerts.map((a, i) => (
                <button
                  key={i}
                  onClick={() => onAlertTap?.(a)}
                  className="text-xs text-amber whitespace-nowrap hover:underline"
                >
                  {a.name}: {a.subject} {a.from}→{a.to}
                </button>
              ))}
            </div>
            <button onClick={handleClearAlerts} className="text-text-tertiary hover:text-text">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portfolio bar */}
      <div className="bg-surface/95 backdrop-blur-sm border-t border-border px-4 py-2">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between py-1"
          >
            <span className="text-xs font-medium text-text-secondary">
              Portfolio ({slots.length}/{MAX_SLOTS})
            </span>
            <span className="text-xs text-text-tertiary">{expanded ? '▼' : '▲'}</span>
          </button>

          {/* Compact view — just symbols */}
          {!expanded && slots.length > 0 && (
            <div className="flex gap-3 pb-1">
              {slots.map((slot) => (
                <div key={slot.symbol} className="flex items-center gap-1.5">
                  <span className="text-sm">{slot.emoji}</span>
                  <span className="text-xs font-mono text-text-secondary">{slot.symbol}</span>
                  <span className={`text-xs font-bold ${
                    slot.gpa >= 3.5 ? 'text-green' : slot.gpa >= 2.5 ? 'text-accent' : 'text-amber'
                  }`}>
                    {slot.gpa.toFixed(1)}
                  </span>
                </div>
              ))}
              {Array.from({ length: MAX_SLOTS - slots.length }).map((_, i) => (
                <div key={`empty-${i}`} className="w-16 h-5 rounded border border-dashed border-border" />
              ))}
            </div>
          )}

          {/* Expanded view */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-5 gap-2 py-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.symbol}
                      className="bg-bg rounded-lg p-3 border border-border relative group"
                    >
                      <button
                        onClick={() => handleRemove(slot.symbol)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity
                          p-0.5 rounded hover:bg-surface-hover"
                      >
                        <X className="w-3 h-3 text-text-tertiary" />
                      </button>
                      <div className="text-center mb-2">
                        <span className="text-xl">{slot.emoji}</span>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-mono font-medium">{slot.symbol}</div>
                        <div className={`text-sm font-bold ${
                          slot.gpa >= 3.5 ? 'text-green' : slot.gpa >= 2.5 ? 'text-accent' : 'text-amber'
                        }`}>
                          {slot.gpa.toFixed(1)} GPA
                        </div>
                      </div>
                      <div className="mt-2 space-y-0.5">
                        {slot.grades.map((g) => (
                          <div key={g.subject} className="flex justify-between text-[10px]">
                            <span className="text-text-tertiary truncate">{g.subject}</span>
                            <span className={`font-medium ${GRADE_COLORS[g.grade] || ''}`}>{g.grade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: MAX_SLOTS - slots.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="rounded-lg p-3 border border-dashed border-border flex items-center justify-center min-h-[120px]"
                    >
                      <span className="text-xs text-text-tertiary">Empty</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
