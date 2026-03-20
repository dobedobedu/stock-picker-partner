'use client';

import { useState, useRef, type ReactNode } from 'react';

interface FilterTooltipProps {
  text: string;
  children: ReactNode;
}

export function FilterTooltip({ text, children }: FilterTooltipProps) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShow(true), 400);
  };

  const handleLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={() => setShow(!show)}
    >
      {children}
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2
          bg-surface-raised border border-border rounded-lg shadow-lg
          text-[11px] text-text-secondary leading-relaxed
          w-[220px] pointer-events-none animate-in fade-in duration-150"
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px
            border-4 border-transparent border-t-border" />
        </span>
      )}
    </span>
  );
}
