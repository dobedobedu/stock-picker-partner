import { NextRequest, NextResponse } from 'next/server';
import { getAI, DEFAULT_MODEL } from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
  }

  try {
    const completion = await getAI().chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 256,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content ?? 'No explanation available.';
    return NextResponse.json({ text });
  } catch (err) {
    console.error('Explain API error:', err);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 },
    );
  }
}
