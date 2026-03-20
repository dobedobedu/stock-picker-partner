'use client';

import { motion } from 'motion/react';
import { Check, Loader2, Circle } from 'lucide-react';

interface ThinkingStepProps {
  text: string;
  status: 'pending' | 'active' | 'done';
  icon?: string;
}

export function ThinkingStep({ text, status, icon }: ThinkingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-1.5"
    >
      {/* Status icon */}
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        {status === 'done' && <Check className="w-4 h-4 text-green" />}
        {status === 'active' && (
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
        )}
        {status === 'pending' && <Circle className="w-3.5 h-3.5 text-text-tertiary" />}
      </div>

      {/* Optional emoji icon */}
      {icon && <span className="text-sm">{icon}</span>}

      {/* Text */}
      <span className={`text-sm ${
        status === 'done' ? 'text-text-secondary' :
        status === 'active' ? 'text-text' :
        'text-text-tertiary'
      }`}>
        {text}
      </span>
    </motion.div>
  );
}
