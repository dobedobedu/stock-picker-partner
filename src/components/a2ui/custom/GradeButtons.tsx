'use client';

import { useState } from 'react';

interface GradeButtonsProps {
  question: string;
  options: string[];
  actionType: string;
  context?: string;
  onAction?: (action: { type: string; value: string; context?: string }) => void;
}

export function GradeButtons({ question, options, actionType, context, onAction }: GradeButtonsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (selected) return; // Only allow one selection
    setSelected(option);
    onAction?.({ type: actionType, value: option, context });
  };

  return (
    <div className="bg-surface rounded-xl p-4 border border-border">
      <p className="text-sm font-medium mb-3">{question}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected === option;
          const isDisabled = selected !== null && !isSelected;

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={isDisabled}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-accent text-white ring-2 ring-accent/30'
                  : isDisabled
                    ? 'bg-surface-hover text-text-tertiary cursor-not-allowed opacity-50'
                    : 'bg-surface-hover text-text hover:bg-border hover:text-text cursor-pointer'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="text-xs text-text-tertiary mt-2 animate-pulse">
          Analyzing your answer...
        </p>
      )}
    </div>
  );
}
