/* ── Stream parser: splits AI text from A2UI JSONL ── */

const A2UI_DELIMITER = '---a2ui_JSON---';

export interface ParsedChunk {
  type: 'text' | 'a2ui';
  content: string;
}

/**
 * Splits a complete AI response into text and A2UI parts.
 * The AI outputs text first, then `---a2ui_JSON---`, then JSONL.
 */
export function splitResponse(raw: string): { text: string; a2uiLines: string[] } {
  const delimIdx = raw.indexOf(A2UI_DELIMITER);
  if (delimIdx === -1) {
    return { text: raw, a2uiLines: [] };
  }
  const text = raw.slice(0, delimIdx).trim();
  const jsonPart = raw.slice(delimIdx + A2UI_DELIMITER.length).trim();
  const a2uiLines = jsonPart
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  return { text, a2uiLines };
}

/**
 * Parses A2UI JSONL lines. Each line may be a standalone JSON object
 * or part of a JSON array. Handles both formats.
 */
export function parseA2UILines(lines: string[]): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];

  // Try parsing as a single JSON array first (common when AI outputs [{ }, { }])
  const joined = lines.join('\n');
  try {
    const parsed = JSON.parse(joined);
    if (Array.isArray(parsed)) return parsed;
    results.push(parsed);
    return results;
  } catch {
    // Fall through to line-by-line parsing
  }

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (Array.isArray(parsed)) {
        results.push(...parsed);
      } else {
        results.push(parsed);
      }
    } catch {
      // Skip malformed lines
    }
  }
  return results;
}

/**
 * Incrementally parses a streaming buffer, extracting complete
 * text chunks and A2UI JSON objects as they arrive.
 */
export class StreamParser {
  private buffer = '';
  private inA2UI = false;
  private jsonBuffer = '';

  push(chunk: string): ParsedChunk[] {
    this.buffer += chunk;
    const results: ParsedChunk[] = [];

    if (!this.inA2UI) {
      const delimIdx = this.buffer.indexOf(A2UI_DELIMITER);
      if (delimIdx === -1) {
        // No delimiter yet — emit all text
        if (this.buffer.length > 0) {
          results.push({ type: 'text', content: this.buffer });
          this.buffer = '';
        }
      } else {
        // Found delimiter — emit text before it, switch to A2UI mode
        const text = this.buffer.slice(0, delimIdx);
        if (text.trim()) {
          results.push({ type: 'text', content: text });
        }
        this.buffer = this.buffer.slice(delimIdx + A2UI_DELIMITER.length);
        this.inA2UI = true;
      }
    }

    if (this.inA2UI) {
      this.jsonBuffer += this.buffer;
      this.buffer = '';

      // Try to extract complete JSON lines
      const lines = this.jsonBuffer.split('\n');
      // Keep the last line in buffer (might be incomplete)
      this.jsonBuffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          JSON.parse(trimmed);
          results.push({ type: 'a2ui', content: trimmed });
        } catch {
          // Incomplete JSON, put back
          this.jsonBuffer = trimmed + '\n' + this.jsonBuffer;
        }
      }
    }

    return results;
  }

  flush(): ParsedChunk[] {
    const results: ParsedChunk[] = [];
    if (this.jsonBuffer.trim()) {
      try {
        JSON.parse(this.jsonBuffer.trim());
        results.push({ type: 'a2ui', content: this.jsonBuffer.trim() });
      } catch {
        // Try as text fallback
        results.push({ type: 'text', content: this.jsonBuffer.trim() });
      }
    }
    if (this.buffer.trim()) {
      results.push({ type: 'text', content: this.buffer.trim() });
    }
    this.buffer = '';
    this.jsonBuffer = '';
    return results;
  }
}
