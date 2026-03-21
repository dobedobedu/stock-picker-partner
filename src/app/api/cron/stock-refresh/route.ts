import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { STOCK_UNIVERSE } from '@/lib/universe';
import YahooFinance from 'yahoo-finance2';

export const runtime = 'nodejs';
export const maxDuration = 120;

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

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

  const rows: Record<string, unknown>[] = [];
  const errors: string[] = [];

  // Process stocks sequentially to stay within Yahoo's comfort zone
  for (const symbol of symbols) {
    try {
      // Get quote (price, change, market cap, PE, dividend yield, 52w range)
      const quote = await yf.quote(symbol);

      // Get fundamentals (profit margin, revenue growth, debt-to-equity)
      let profitMargin = 0;
      let revenueGrowth = 0;
      let debtToEquity = 0;

      try {
        const summary = await yf.quoteSummary(symbol, {
          modules: ['financialData'],
        });
        const fd = summary.financialData;
        if (fd) {
          profitMargin = fd.profitMargins ?? 0;
          revenueGrowth = fd.revenueGrowth ?? 0;
          // Yahoo reports D/E as percentage (e.g., 102.63), convert to ratio (1.0263)
          debtToEquity = (fd.debtToEquity ?? 0) / 100;
        }
      } catch {
        // Fundamentals failed — use quote-only data, skip fundamentals
      }

      const price = quote.regularMarketPrice ?? 0;
      const low52 = quote.fiftyTwoWeekLow ?? 0;
      const high52 = quote.fiftyTwoWeekHigh ?? 0;
      const priceChange52w = low52 > 0 ? (price - low52) / low52 : 0;

      // dividendYield from Yahoo is already a percentage (e.g., 0.42 = 0.42%)
      // Convert to decimal for our grading (0.0042)
      const dividendYield = (quote.dividendYield ?? 0) / 100;

      rows.push({
        symbol,
        date: today,
        name: universeMap.get(symbol)?.name ?? quote.shortName ?? symbol,
        sector: universeMap.get(symbol)?.sector ?? 'Unknown',
        emoji: universeMap.get(symbol)?.emoji ?? '📊',
        price,
        change: quote.regularMarketChange ?? 0,
        change_percent: quote.regularMarketChangePercent ?? 0,
        market_cap: quote.marketCap ?? 0,
        pe: quote.trailingPE ?? 0,
        revenue_growth: revenueGrowth,
        profit_margin: profitMargin,
        debt_to_equity: debtToEquity,
        dividend_yield: dividendYield,
        high_52w: high52,
        low_52w: low52,
        price_change_52w: priceChange52w,
      });
    } catch (err) {
      errors.push(`${symbol}: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { error: 'No stocks fetched', errors },
      { status: 500 },
    );
  }

  // Upsert to Supabase
  try {
    const db = createServiceClient();
    const { error } = await db
      .from('stock_daily')
      .upsert(rows, { onConflict: 'symbol,date' });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: rows.length,
      date: today,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Supabase upsert failed' },
      { status: 500 },
    );
  }
}
