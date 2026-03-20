import { ThinkingLevel } from '@google/genai';
import { getGemini, GEMINI_MODEL } from '@/lib/ai';
import { buildFindPrompt, buildLearnPrompt, buildActionResponsePrompt } from '@/lib/a2ui/prompt-builder';
import { STOCK_UNIVERSE } from '@/lib/universe';
import { getScenarioById } from '@/lib/scenarios';
import type { DetailLevel } from '@/lib/preferences';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, query, scenarioId, phase, actionType, actionValue, context, detailLevel = 'simple' } = body;

    let prompt: string;

    if (mode === 'find') {
      if (!query) {
        return Response.json({ error: 'Query is required for find mode' }, { status: 400 });
      }
      prompt = buildFindPrompt(query, STOCK_UNIVERSE, detailLevel as DetailLevel);
    } else if (mode === 'learn') {
      if (!scenarioId) {
        return Response.json({ error: 'Scenario ID is required for learn mode' }, { status: 400 });
      }
      const scenario = getScenarioById(scenarioId);
      if (!scenario) {
        return Response.json({ error: 'Scenario not found' }, { status: 404 });
      }
      prompt = buildLearnPrompt(
        scenario,
        (phase as 'backtest' | 'live') || 'backtest',
        detailLevel as DetailLevel,
        actionType && actionValue ? { question: context || '', answer: actionValue } : undefined,
      );
    } else if (mode === 'action') {
      if (!actionType || !actionValue) {
        return Response.json({ error: 'Action type and value required' }, { status: 400 });
      }
      prompt = buildActionResponsePrompt(
        actionType,
        actionValue,
        context || '',
        detailLevel as DetailLevel,
      );
    } else {
      return Response.json({ error: 'Invalid mode. Use "find", "learn", or "action".' }, { status: 400 });
    }

    const gemini = getGemini();

    const response = await gemini.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 1.0,
        maxOutputTokens: 4096,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    // Stream as newline-delimited JSON chunks.
    // Each line: {"type":"text","content":"..."} or {"type":"done"}
    // This avoids SSE's newline-in-data problem.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text ?? '';
            if (text) {
              const line = JSON.stringify({ type: 'chunk', content: text }) + '\n';
              controller.enqueue(encoder.encode(line));
            }
          }
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'done' }) + '\n'));
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Stream error';
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', content: msg }) + '\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('A2UI API error:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
