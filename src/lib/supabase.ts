import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Server-side client with service role (for cron writes) */
export function createServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

/** Client-side / read-only client */
export function createAnonClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export interface StockDailyRow {
  symbol: string;
  date: string;
  name: string;
  sector: string;
  emoji: string;
  price: number;
  change: number;
  change_percent: number;
  market_cap: number;
  pe: number;
  revenue_growth: number;
  profit_margin: number;
  debt_to_equity: number;
  dividend_yield: number;
  high_52w: number;
  low_52w: number;
  price_change_52w: number;
}

/** Get today's (or latest available) stock data */
export async function getLatestStocks(): Promise<StockDailyRow[]> {
  const db = createServiceClient();
  // Get the most recent date that has data
  const { data: dateRow } = await db
    .from('stock_daily')
    .select('date')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (!dateRow) return [];

  const { data, error } = await db
    .from('stock_daily')
    .select('*')
    .eq('date', dateRow.date)
    .order('market_cap', { ascending: false });

  if (error) throw error;
  return (data ?? []) as StockDailyRow[];
}

/** Get price history for backtest chart */
export async function getStockHistory(
  symbols: string[],
  days: number = 30,
): Promise<StockDailyRow[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from('stock_daily')
    .select('symbol, date, price, change_percent')
    .in('symbol', symbols)
    .order('date', { ascending: true })
    .limit(days * symbols.length);

  if (error) throw error;
  return (data ?? []) as StockDailyRow[];
}
