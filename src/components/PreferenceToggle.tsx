'use client';

import type { DetailLevel } from '@/lib/preferences';

interface PreferenceToggleProps {
  value: DetailLevel;
  onChange: (level: DetailLevel) => void;
}

export function PreferenceToggle({ value, onChange }: PreferenceToggleProps) {
  return (
    <div className="flex rounded-lg bg-surface border border-border p-0.5">
      <button
        onClick={() => onChange('simple')}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
          value === 'simple'
            ? 'bg-accent/15 text-accent'
            : 'text-text-secondary hover:text-text'
        }`}
      >
        Simple
      </button>
      <button
        onClick={() => onChange('detailed')}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
          value === 'detailed'
            ? 'bg-accent/15 text-accent'
            : 'text-text-secondary hover:text-text'
        }`}
      >
        Detailed
      </button>
    </div>
  );
}
