import { NextRequest, NextResponse } from 'next/server';
import { getStockHistory } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const symbolsParam = req.nextUrl.searchParams.get('symbols');
  const daysParam = req.nextUrl.searchParams.get('days');

  if (!symbolsParam) {
    return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 });
  }

  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  if (symbols.length === 0 || symbols.length > 10) {
    return NextResponse.json({ error: 'Provide 1-10 symbols' }, { status: 400 });
  }

  const days = Math.min(90, Math.max(1, parseInt(daysParam ?? '30', 10)));

  try {
    const rows = await getStockHistory(symbols, days);

    return NextResponse.json(rows, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('Stock history API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch history' },
      { status: 500 },
    );
  }
}
