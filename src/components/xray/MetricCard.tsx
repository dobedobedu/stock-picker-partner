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
      className="rounded-xl border border-border bg-surface p-4 cursor-pointer
                 hover:bg-surface-hover transition-colors"
      onClick={handleExpand}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-text">{title}</h3>
          <p className="text-xs text-text-tertiary">{metaphor}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-tertiary transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Visual */}
      <div className="mb-3">{visual}</div>

      {/* Value */}
      <p className="text-lg font-semibold font-mono">{value}</p>

      {/* Expandable AI explanation */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber" />
                <span className="text-xs font-medium text-amber">AI Explanation</span>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
                  Thinking...
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
