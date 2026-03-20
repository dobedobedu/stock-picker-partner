import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

/* ── OpenRouter (existing, kept for explain endpoint) ── */

export const DEFAULT_MODEL = 'x-ai/grok-4.20-multi-agent-beta';

let _ai: OpenAI | null = null;

export function getAI(): OpenAI {
  if (!_ai) {
    _ai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY ?? '',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'Stock Literacy',
      },
    });
  }
  return _ai;
}

/* ── Gemini Flash 3 (A2UI generation) ── */

export const GEMINI_MODEL = 'gemini-3-flash-preview';

let _gemini: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!_gemini) {
    _gemini = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY ?? '',
    });
  }
  return _gemini;
}
