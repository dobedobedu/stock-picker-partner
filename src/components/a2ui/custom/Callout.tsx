'use client';

import { Info, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

const VARIANTS = {
  info: {
    bg: 'bg-accent/10 border-accent/20',
    icon: Info,
    iconColor: 'text-accent',
  },
  warning: {
    bg: 'bg-amber/10 border-amber/20',
    icon: AlertTriangle,
    iconColor: 'text-amber',
  },
  success: {
    bg: 'bg-green/10 border-green/20',
    icon: CheckCircle,
    iconColor: 'text-green',
  },
  lesson: {
    bg: 'bg-purple/10 border-purple/20',
    icon: Lightbulb,
    iconColor: 'text-purple',
  },
} as const;

interface CalloutProps {
  type: keyof typeof VARIANTS;
  title?: string;
  message: string;
}

export function Callout({ type, title, message }: CalloutProps) {
  const variant = VARIANTS[type] ?? VARIANTS.info;
  const Icon = variant.icon;

  return (
    <div className={`rounded-xl border p-4 ${variant.bg}`}>
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${variant.iconColor}`} />
        <div className="flex-1 min-w-0">
          {title && <p className="text-sm font-medium mb-1">{title}</p>}
          <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}
