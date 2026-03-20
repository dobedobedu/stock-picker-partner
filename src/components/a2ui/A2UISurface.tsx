'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gauge } from './custom/Gauge';
import { GradeCard } from './custom/GradeCard';
import { MetricBar } from './custom/MetricBar';
import { CompareTable } from './custom/CompareTable';
import { Callout } from './custom/Callout';
import { DonutChart } from './custom/DonutChart';
import { StockCard } from './custom/StockCard';
import { ThinkingStep } from './custom/ThinkingStep';
import { PriceChart } from './custom/PriceChart';
import { GradeButtons } from './custom/GradeButtons';

/* eslint-disable @typescript-eslint/no-explicit-any */
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  Gauge,
  GradeCard,
  MetricBar,
  CompareTable,
  Callout,
  DonutChart,
  StockCard,
  ThinkingStep,
  PriceChart,
  GradeButtons,
};

interface A2UIComponent {
  component: string;
  props: Record<string, any>;
}

interface A2UISurfaceProps {
  request: {
    mode: 'find' | 'learn' | 'action';
    query?: string;
    scenarioId?: string;
    phase?: 'backtest' | 'live';
    actionType?: string;
    actionValue?: string;
    context?: string;
    detailLevel?: string;
  } | null;
  onAction?: (action: { type: string; value: string; context?: string }) => void;
  onComplete?: () => void;
}

const A2UI_DELIMITER = '---a2ui_JSON---';

/**
 * Extract A2UI component objects from a JSON string that may contain
 * markdown fences, stray text, etc.
 */
function extractComponents(raw: string): A2UIComponent[] {
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Try as a full JSON array
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed.filter((p: any) => p?.component);
    if (parsed?.component) return [parsed];
  } catch { /* continue */ }

  // Find outermost [ ... ]
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      const arr = JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
      if (Array.isArray(arr)) return arr.filter((p: any) => p?.component);
    } catch { /* continue */ }
  }

  // Extract individual {"component": ...} objects via brace matching
  const results: A2UIComponent[] = [];
  let depth = 0;
  let objStart = -1;

  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{' && depth === 0) objStart = i;
    if (cleaned[i] === '{') depth++;
    if (cleaned[i] === '}') {
      depth--;
      if (depth === 0 && objStart !== -1) {
        const candidate = cleaned.slice(objStart, i + 1);
        if (candidate.includes('"component"')) {
          try {
            const parsed = JSON.parse(candidate);
            if (parsed.component) results.push(parsed);
          } catch { /* skip */ }
        }
        objStart = -1;
      }
    }
  }

  return results;
}

export function A2UISurface({ request, onAction, onComplete }: A2UISurfaceProps) {
  const [displayText, setDisplayText] = useState('');
  const [components, setComponents] = useState<A2UIComponent[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stream = useCallback(async () => {
    if (!request) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setDisplayText('');
    setComponents([]);
    setStreaming(true);
    setError(null);

    let fullResponse = '';

    try {
      const res = await fetch('/api/a2ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to get AI response');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let lineBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        lineBuffer += decoder.decode(value, { stream: true });

        // Process complete NDJSON lines
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() ?? ''; // Keep incomplete last line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.type === 'chunk') {
              fullResponse += msg.content;

              // Show text before delimiter progressively
              const delimIdx = fullResponse.indexOf(A2UI_DELIMITER);
              if (delimIdx === -1) {
                setDisplayText(fullResponse);
              } else {
                setDisplayText(fullResponse.slice(0, delimIdx).trim());
              }
            } else if (msg.type === 'error') {
              throw new Error(msg.content);
            }
          } catch (e) {
            if (e instanceof Error && e.message !== line) throw e;
            // Skip unparseable lines
          }
        }
      }

      // Process any remaining buffer
      if (lineBuffer.trim()) {
        try {
          const msg = JSON.parse(lineBuffer);
          if (msg.type === 'chunk') fullResponse += msg.content;
        } catch { /* skip */ }
      }

      // --- Final parse: split text from A2UI components ---
      const delimIdx = fullResponse.indexOf(A2UI_DELIMITER);
      if (delimIdx !== -1) {
        const textPart = fullResponse.slice(0, delimIdx).trim();
        const jsonPart = fullResponse.slice(delimIdx + A2UI_DELIMITER.length);
        setDisplayText(textPart);
        setComponents(extractComponents(jsonPart));
      } else {
        // No delimiter — try to find embedded component JSON
        const comps = extractComponents(fullResponse);
        if (comps.length > 0) {
          // Find where JSON starts and show text before it
          const idx = fullResponse.indexOf('{"component"');
          const bracketIdx = fullResponse.indexOf('[{"component"');
          const jsonStart = Math.min(
            idx === -1 ? Infinity : idx,
            bracketIdx === -1 ? Infinity : bracketIdx,
          );
          if (jsonStart !== Infinity) {
            setDisplayText(fullResponse.slice(0, jsonStart).trim());
          }
          setComponents(comps);
        } else {
          setDisplayText(fullResponse);
        }
      }

      onComplete?.();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setStreaming(false);
    }
  }, [request, onComplete]);

  useEffect(() => {
    if (request) stream();
    return () => abortRef.current?.abort();
  }, [request]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [displayText, components]);

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose/10 border border-rose/20 text-rose text-sm">
        {error}
      </div>
    );
  }

  if (!request && components.length === 0 && !displayText) return null;

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Streaming text */}
      {displayText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap"
        >
          {displayText}
          {streaming && <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 animate-pulse" />}
        </motion.div>
      )}

      {/* A2UI Components */}
      <AnimatePresence mode="popLayout">
        {components.map((comp, i) => {
          const Component = COMPONENT_MAP[comp.component];
          if (!Component) return null;

          return (
            <motion.div
              key={`${comp.component}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <Component {...comp.props} onAction={onAction} />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Loading */}
      {streaming && components.length === 0 && !displayText && (
        <div className="flex items-center gap-3 py-4">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-text-secondary">Agent is thinking...</span>
        </div>
      )}
    </div>
  );
}
