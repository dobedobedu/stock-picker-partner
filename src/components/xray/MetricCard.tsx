'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { buildExplainPrompt } from '@/lib/prompts';

interface Props {
  title: string;
  metaphor: string;
  value: string;
  metricName: string;
  company: string;
  visual: ReactNode;
}

export function MetricCard({ title, metaphor, value, metricName, company, visual }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);

    if (!explanation) {
      setLoading(true);
      try {
        const res = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: buildExplainPrompt(metricName, value, company),
          }),
        });
        const data = await res.json();
        setExplanation(data.text ?? 'No explanation available.');
      } catch {
        setExplanation('Could not load explanation right now.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className="xray-card rounded-xl border border-border/60 bg-surface p-5 cursor-pointer
                 hover:border-accent/30 transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, #191919 0%, #141420 100%)',
        boxShadow: expanded ? '0 0 20px rgba(79, 140, 247, 0.08)' : 'none',
      }}
      onClick={handleExpand}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <h3 className="text-[11px] font-mono font-bold tracking-[0.2em] text-accent/80 uppercase">
            {title}
          </h3>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mt-0.5">
            {metaphor}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-tertiary transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Visual */}
      <div className="mb-3 relative z-10">{visual}</div>

      {/* Expandable AI explanation */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden relative z-10"
          >
            <div className="mt-3 pt-3 border-t border-accent/10">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber" />
                <span className="text-[10px] font-mono font-bold tracking-wider text-amber uppercase">
                  AI Analysis
                </span>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
                  <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
                  SCANNING...
                </div>
              ) : (
                <p className="text-sm text-text-secondary leading-relaxed">{explanation}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
