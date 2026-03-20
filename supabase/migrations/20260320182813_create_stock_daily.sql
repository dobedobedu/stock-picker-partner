CREATE TABLE IF NOT EXISTS stock_daily (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  symbol text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  name text,
  sector text,
  emoji text,
  price numeric,
  change numeric,
  change_percent numeric,
  market_cap numeric,
  pe numeric,
  revenue_growth numeric,
  profit_margin numeric,
  debt_to_equity numeric,
  dividend_yield numeric,
  high_52w numeric,
  low_52w numeric,
  price_change_52w numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE(symbol, date)
);

CREATE INDEX IF NOT EXISTS idx_stock_daily_date ON stock_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_daily_symbol ON stock_daily(symbol);

-- Enable RLS but allow public reads
ALTER TABLE stock_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON stock_daily
  FOR SELECT USING (true);
