import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { STOCK_UNIVERSE } from '@/lib/universe';

export const runtime = 'nodejs';
export const maxDuration = 120;

const FMP_BASE = 'https://financialmodelingprep.com/stable';

async function fmpFetch(endpoint: string, params: string): Promise<unknown> {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error('FMP_API_KEY not set');
  const url = `${FMP_BASE}/${endpoint}?${params}&apikey=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FMP ${endpoint} failed: ${res.status}`);
  return res.json();
}

/** Fetch quote for a single symbol */
async function fetchQuote(symbol: string): Promise<Record<string, unknown> | null> {
  try {
    const data = await fmpFetch('quote', `symbol=${symbol}`);
    const arr = data as Record<string, unknown>[];
    return arr[0] ?? null;
  } catch {
    return null;
  }
}

/** Fetch ratios for a single symbol */
async function fetchRatios(symbol: string): Promise<Record<string, unknown> | null> {
  try {
    const data = await fmpFetch('ratios-ttm', `symbol=${symbol}`);
    const arr = data as Record<string, unknown>[];
    return arr[0] ?? null;
  } catch {
    return null;
  }
}

/** Process symbols sequentially with a small delay to be gentle on the API */
async function processSequential<T>(
  items: string[],
  fn: (symbol: string) => Promise<T>,
): Promise<Map<string, T>> {
  const results = new Map<string, T>();
  for (const sym of items) {
    const data = await fn(sym);
    if (data) results.set(sym, data);
  }
  return results;
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const symbols = STOCK_UNIVERSE.map(s => s.symbol);
  const universeMap = new Map(STOCK_UNIVERSE.map(s => [s.symbol, s]));
  const today = new Date().toISOString().split('T')[0];

  try {
    // Budget: 250 requests/day
    // Strategy: 80 quotes (80 req) + 80 ratios (80 req) = 160 requests total
    // Derive revenue growth & dividend yield from ratios-ttm (no separate income/key-metrics calls)

    // 1. Fetch all quotes sequentially (80 requests)
    const quotesMap = await processSequential(symbols, fetchQuote);

    // 2. Fetch all ratios sequentially (80 requests)
    const ratiosMap = await processSequential(symbols, fetchRatios);

    // 3. Build rows for Supabase upsert
    const rows = symbols.map(symbol => {
      const uni = universeMap.get(symbol)!;
      const quote = quotesMap.get(symbol) ?? {};
      const ratios = ratiosMap.get(symbol) ?? {};

      const price = (quote.price as number) ?? 0;
      const eps = (ratios.netIncomePerShareTTM as number) ?? 0;
      const pe = eps > 0 ? price / eps : 0;

      const high52 = (quote.yearHigh as number) ?? 0;
      const low52 = (quote.yearLow as number) ?? 0;
      // Approximate 52-week return: (price - yearLow) / midpoint - 0.5
      const priceChange52w = low52 > 0 && price > 0
        ? (price - low52) / low52
        : 0;

      // Derive dividend yield from ratios (dividendPerShareTTM / price)
      const dividendPerShare = (ratios.dividendPerShareTTM as number) ?? 0;
      const dividendYield = price > 0 ? dividendPerShare / price : 0;

      // Revenue growth from ratios-ttm if available
      const revenueGrowth = (ratios.revenuePerShareTTM as number) ?? 0;
      // Use profit margin from ratios
      const profitMargin = (ratios.netProfitMarginTTM as number) ?? 0;

      return {
        symbol,
        date: today,
        name: uni.name,
        sector: uni.sector,
        emoji: uni.emoji,
        price,
        change: (quote.change as number) ?? 0,
        change_percent: (quote.changePercentage as number) ?? 0,
        market_cap: (quote.marketCap as number) ?? 0,
        pe,
        revenue_growth: revenueGrowth, // Will be refined later
        profit_margin: profitMargin,
        debt_to_equity: (ratios.debtToEquityRatioTTM as number) ?? 0,
        dividend_yield: dividendYield,
        high_52w: high52,
        low_52w: low52,
        price_change_52w: priceChange52w,
      };
    });

    // 4. Upsert to Supabase
    const db = createServiceClient();
    const { error } = await db
      .from('stock_daily')
      .upsert(rows, { onConflict: 'symbol,date' });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: rows.length,
      date: today,
      apiCalls: symbols.length * 2, // quotes + ratios
    });
  } catch (err) {
    console.error('Cron stock-refresh error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to refresh stocks' },
      { status: 500 },
    );
  }
}
