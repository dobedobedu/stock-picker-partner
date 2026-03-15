import OpenAI from 'openai';

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
