import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache, type StockData } from '@/lib/stock';

export const runtime = 'nodejs';

const FMP_BASE = 'https://financialmodelingprep.com/stable';

async function fmpFetch(endpoint: string, symbol: string, extra = ''): Promise<unknown> {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error('FMP_API_KEY not set');
  const url = `${FMP_BASE}/${endpoint}?symbol=${symbol}&apikey=${key}${extra}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FMP ${endpoint} failed: ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase();
  if (!symbol || !/^[A-Z]{1,5}$/.test(symbol)) {
    return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
  }

  // Check cache
  const cached = getCached(symbol);
  if (cached) return NextResponse.json(cached);

  try {
    const [quoteRaw, profileRaw, ratiosRaw, incomeRaw] = await Promise.all([
      fmpFetch('quote', symbol),
      fmpFetch('profile', symbol),
      fmpFetch('ratios-ttm', symbol),
      fmpFetch('income-statement', symbol, '&period=annual&limit=2'),
    ]);

    const quote = (quoteRaw as Record<string, unknown>[])[0];
    const profile = (profileRaw as Record<string, unknown>[])[0];
    const ratios = (ratiosRaw as Record<string, unknown>[])[0];
    const incomeStatements = incomeRaw as Record<string, unknown>[];

    if (!quote || !profile) {
      return NextResponse.json({ error: 'Ticker not found' }, { status: 404 });
    }

    // Calculate revenue growth from last 2 years
    const rev0 = (incomeStatements[0]?.revenue as number) ?? 0;
    const rev1 = (incomeStatements[1]?.revenue as number) ?? 0;
    const revenueGrowth = rev1 > 0 ? (rev0 - rev1) / rev1 : 0;

    // P/E from price / EPS
    const eps = (ratios?.netIncomePerShareTTM as number) ?? 0;
    const price = (quote.price as number) ?? 0;
    const pe = eps > 0 ? price / eps : 0;

    const data: StockData = {
      symbol,
      name: (profile.companyName as string) ?? symbol,
      price,
      change: (quote.change as number) ?? 0,
      changePercent: (quote.changePercentage as number) ?? 0,
      marketCap: (quote.marketCap as number) ?? (profile.marketCap as number) ?? 0,
      pe,
      revenue: rev0,
      revenueGrowth,
      profitMargin: (ratios?.netProfitMarginTTM as number) ?? 0,
      high52: (quote.yearHigh as number) ?? 0,
      low52: (quote.yearLow as number) ?? 0,
      debtToEquity: (ratios?.debtToEquityRatioTTM as number) ?? 0,
      sector: (profile.sector as string) ?? 'Unknown',
      description: (profile.description as string) ?? '',
      image: (profile.image as string) ?? '',
    };

    setCache(symbol, data);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Stock API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch stock data' },
      { status: 500 },
    );
  }
}
