import { NextResponse } from 'next/server';
import { getLatestStocks, type StockDailyRow } from '@/lib/supabase';
import { STOCK_UNIVERSE } from '@/lib/universe';
import { gradeStockFull, computeGPA, type GradingInput } from '@/lib/grading';
import type { BatchStockData } from '@/lib/filters';

export const runtime = 'nodejs';

function rowToGradingInput(row: StockDailyRow): GradingInput {
  return {
    profitMargin: row.profit_margin ?? 0,
    revenueGrowth: row.revenue_growth ?? 0,
    pe: row.pe ?? 0,
    marketCap: row.market_cap ?? 0,
    debtToEquity: row.debt_to_equity ?? 0,
    dividendYield: (row.dividend_yield ?? 0) * 100, // Convert decimal to percentage
    priceChange52w: row.price_change_52w ?? 0,
  };
}

export async function GET() {
  try {
    const rows = await getLatestStocks();

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No stock data available. Run the cron job first.' },
        { status: 404 },
      );
    }

    const universeMap = new Map(STOCK_UNIVERSE.map(s => [s.symbol, s]));

    const stocks: BatchStockData[] = rows.map(row => {
      const uni = universeMap.get(row.symbol);
      const input = rowToGradingInput(row);
      const grades = gradeStockFull(input, row.sector ?? 'Unknown');
      const gpa = computeGPA(grades);

      return {
        symbol: row.symbol,
        name: row.name ?? uni?.name ?? row.symbol,
        emoji: row.emoji ?? uni?.emoji ?? '📊',
        sector: row.sector ?? uni?.sector ?? 'Unknown',
        price: row.price ?? 0,
        change: row.change ?? 0,
        changePercent: row.change_percent ?? 0,
        marketCap: row.market_cap ?? 0,
        pe: row.pe ?? 0,
        revenueGrowth: row.revenue_growth ?? 0,
        profitMargin: row.profit_margin ?? 0,
        debtToEquity: row.debt_to_equity ?? 0,
        dividendYield: row.dividend_yield ?? 0,
        priceChange52w: row.price_change_52w ?? 0,
        gpa,
        grades,
      };
    });

    return NextResponse.json(stocks, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('Batch stock API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch stocks' },
      { status: 500 },
    );
  }
}
