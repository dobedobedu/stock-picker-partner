'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { GlossaryTerm } from '@/lib/glossary';

interface GlossaryCardProps {
  term: GlossaryTerm;
}

const CARD_LABELS = ['What is it?', 'Why it matters', 'Make it click'] as const;
const CARD_COLORS = ['#4f8cf7', '#34d399', '#fbbf24'] as const;
const CARD_BG = [
  'rgba(79, 140, 247, 0.08)',
  'rgba(52, 211, 153, 0.08)',
  'rgba(251, 191, 36, 0.08)',
] as const;

export function GlossaryCard({ term }: GlossaryCardProps) {
  const [activeCard, setActiveCard] = useState(0);
  const cards = [term.cards.ballpark, term.cards.why, term.cards.hook];

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Term header — compact */}
      <div className="flex items-center gap-2 px-3 py-2 bg-surface">
        <span className="text-base">{term.emoji}</span>
        <span className="font-semibold text-sm text-text">{term.term}</span>
      </div>

      {/* 3-card tabs */}
      <div className="flex border-b border-border">
        {CARD_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => setActiveCard(i)}
            className="flex-1 px-2 py-1.5 text-[10px] font-medium transition-colors relative"
            style={{
              color: activeCard === i ? CARD_COLORS[i] : undefined,
            }}
          >
            <span className={activeCard !== i ? 'text-text-tertiary' : ''}>{label}</span>
            {activeCard === i && (
              <motion.div
                layoutId={`glossary-tab-${term.id}`}
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: CARD_COLORS[i] }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Card content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCard}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="px-3 py-3 space-y-2"
          style={{ backgroundColor: CARD_BG[activeCard] }}
        >
          <div className="text-xs font-medium text-text">
            {cards[activeCard].headline}
          </div>

          {/* Ballpark value (card 0) */}
          {activeCard === 0 && 'value' in cards[0] && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold" style={{ color: CARD_COLORS[0] }}>
                {(cards[0] as typeof term.cards.ballpark).value}
              </span>
              <span className="text-[10px] text-text-tertiary">
                {(cards[0] as typeof term.cards.ballpark).valueLabel}
              </span>
            </div>
          )}

          {/* Formula (card 1) */}
          {activeCard === 1 && 'formula' in cards[1] && (cards[1] as typeof term.cards.why).formula && (
            <div className="px-2.5 py-1.5 rounded-lg bg-surface font-mono text-xs text-accent border border-border/50">
              {(cards[1] as typeof term.cards.why).formula}
            </div>
          )}

          <p className="text-[11px] text-text-secondary leading-relaxed">
            {cards[activeCard].explain}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Compact tile for the glossary grid */
export function GlossaryTile({
  term,
  onSelect,
}: {
  term: GlossaryTerm;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(term.id)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg
        bg-surface border border-border text-left
        hover:bg-surface-hover hover:border-accent/20 transition-all group"
    >
      <span className="text-base">{term.emoji}</span>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-text">{term.term}</span>
      </div>
      <span className="text-[10px] text-text-tertiary group-hover:text-text transition-colors">→</span>
    </button>
  );
}
