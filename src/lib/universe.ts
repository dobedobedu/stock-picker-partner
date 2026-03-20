/* ── Stock Universe (~80 curated stocks for agentic search) ── */

export interface UniverseStock {
  symbol: string;
  name: string;
  sector: string;
  emoji: string;
}

export const STOCK_UNIVERSE: UniverseStock[] = [
  // Technology
  { symbol: 'AAPL', name: 'Apple', sector: 'Technology', emoji: '🍎' },
  { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology', emoji: '🪟' },
  { symbol: 'GOOGL', name: 'Alphabet', sector: 'Technology', emoji: '🔍' },
  { symbol: 'AMZN', name: 'Amazon', sector: 'Technology', emoji: '📦' },
  { symbol: 'NVDA', name: 'Nvidia', sector: 'Technology', emoji: '🎮' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Technology', emoji: '👓' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor', sector: 'Technology', emoji: '🔬' },
  { symbol: 'AVGO', name: 'Broadcom', sector: 'Technology', emoji: '📡' },
  { symbol: 'CRM', name: 'Salesforce', sector: 'Technology', emoji: '☁️' },
  { symbol: 'ORCL', name: 'Oracle', sector: 'Technology', emoji: '🗄️' },
  { symbol: 'ADBE', name: 'Adobe', sector: 'Technology', emoji: '🎨' },
  { symbol: 'AMD', name: 'AMD', sector: 'Technology', emoji: '💻' },
  { symbol: 'INTC', name: 'Intel', sector: 'Technology', emoji: '🧊' },
  { symbol: 'CSCO', name: 'Cisco', sector: 'Technology', emoji: '🌐' },
  { symbol: 'RBLX', name: 'Roblox', sector: 'Technology', emoji: '🎲' },
  { symbol: 'SNAP', name: 'Snap', sector: 'Technology', emoji: '👻' },
  { symbol: 'SHOP', name: 'Shopify', sector: 'Technology', emoji: '🛒' },
  { symbol: 'SQ', name: 'Block', sector: 'Technology', emoji: '💳' },

  // Healthcare
  { symbol: 'UNH', name: 'UnitedHealth', sector: 'Healthcare', emoji: '🏥' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', emoji: '💊' },
  { symbol: 'LLY', name: 'Eli Lilly', sector: 'Healthcare', emoji: '💉' },
  { symbol: 'PFE', name: 'Pfizer', sector: 'Healthcare', emoji: '🧬' },
  { symbol: 'ABBV', name: 'AbbVie', sector: 'Healthcare', emoji: '🔬' },
  { symbol: 'MRK', name: 'Merck', sector: 'Healthcare', emoji: '⚕️' },
  { symbol: 'TMO', name: 'Thermo Fisher', sector: 'Healthcare', emoji: '🧪' },

  // Financial Services
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financial Services', emoji: '🏦' },
  { symbol: 'V', name: 'Visa', sector: 'Financial Services', emoji: '💳' },
  { symbol: 'MA', name: 'Mastercard', sector: 'Financial Services', emoji: '💳' },
  { symbol: 'BAC', name: 'Bank of America', sector: 'Financial Services', emoji: '🏦' },
  { symbol: 'GS', name: 'Goldman Sachs', sector: 'Financial Services', emoji: '📊' },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financial Services', emoji: '📈' },
  { symbol: 'BLK', name: 'BlackRock', sector: 'Financial Services', emoji: '🗃️' },
  { symbol: 'PYPL', name: 'PayPal', sector: 'Financial Services', emoji: '💸' },

  // Consumer Discretionary
  { symbol: 'TSLA', name: 'Tesla', sector: 'Consumer Discretionary', emoji: '🚗' },
  { symbol: 'NKE', name: 'Nike', sector: 'Consumer Discretionary', emoji: '👟' },
  { symbol: 'SBUX', name: 'Starbucks', sector: 'Consumer Discretionary', emoji: '☕' },
  { symbol: 'MCD', name: "McDonald's", sector: 'Consumer Discretionary', emoji: '🍔' },
  { symbol: 'DIS', name: 'Walt Disney', sector: 'Consumer Discretionary', emoji: '🏰' },
  { symbol: 'HD', name: 'Home Depot', sector: 'Consumer Discretionary', emoji: '🔨' },
  { symbol: 'LOW', name: "Lowe's", sector: 'Consumer Discretionary', emoji: '🏠' },
  { symbol: 'TGT', name: 'Target', sector: 'Consumer Discretionary', emoji: '🎯' },
  { symbol: 'LULU', name: 'Lululemon', sector: 'Consumer Discretionary', emoji: '🧘' },

  // Consumer Staples
  { symbol: 'KO', name: 'Coca-Cola', sector: 'Consumer Staples', emoji: '🥤' },
  { symbol: 'PEP', name: 'PepsiCo', sector: 'Consumer Staples', emoji: '🥤' },
  { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Staples', emoji: '🧴' },
  { symbol: 'COST', name: 'Costco', sector: 'Consumer Staples', emoji: '🛒' },
  { symbol: 'WMT', name: 'Walmart', sector: 'Consumer Staples', emoji: '🏬' },
  { symbol: 'CL', name: 'Colgate-Palmolive', sector: 'Consumer Staples', emoji: '🪥' },

  // Energy
  { symbol: 'XOM', name: 'ExxonMobil', sector: 'Energy', emoji: '⛽' },
  { symbol: 'CVX', name: 'Chevron', sector: 'Energy', emoji: '🛢️' },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy', emoji: '🔥' },
  { symbol: 'NEE', name: 'NextEra Energy', sector: 'Energy', emoji: '⚡' },
  { symbol: 'ENPH', name: 'Enphase Energy', sector: 'Energy', emoji: '☀️' },

  // Industrials
  { symbol: 'CAT', name: 'Caterpillar', sector: 'Industrials', emoji: '🚜' },
  { symbol: 'BA', name: 'Boeing', sector: 'Industrials', emoji: '✈️' },
  { symbol: 'UPS', name: 'UPS', sector: 'Industrials', emoji: '📦' },
  { symbol: 'HON', name: 'Honeywell', sector: 'Industrials', emoji: '🏭' },
  { symbol: 'GE', name: 'GE Aerospace', sector: 'Industrials', emoji: '🛩️' },
  { symbol: 'DE', name: 'John Deere', sector: 'Industrials', emoji: '🚜' },
  { symbol: 'LMT', name: 'Lockheed Martin', sector: 'Industrials', emoji: '🚀' },

  // Communication Services
  { symbol: 'NFLX', name: 'Netflix', sector: 'Communication Services', emoji: '🎬' },
  { symbol: 'CMCSA', name: 'Comcast', sector: 'Communication Services', emoji: '📺' },
  { symbol: 'T', name: 'AT&T', sector: 'Communication Services', emoji: '📱' },
  { symbol: 'TMUS', name: 'T-Mobile', sector: 'Communication Services', emoji: '📶' },
  { symbol: 'SPOT', name: 'Spotify', sector: 'Communication Services', emoji: '🎵' },

  // Real Estate
  { symbol: 'AMT', name: 'American Tower', sector: 'Real Estate', emoji: '🗼' },
  { symbol: 'PLD', name: 'Prologis', sector: 'Real Estate', emoji: '🏢' },
  { symbol: 'O', name: 'Realty Income', sector: 'Real Estate', emoji: '🏘️' },

  // Materials
  { symbol: 'LIN', name: 'Linde', sector: 'Materials', emoji: '🧪' },
  { symbol: 'APD', name: 'Air Products', sector: 'Materials', emoji: '💨' },
  { symbol: 'FCX', name: 'Freeport-McMoRan', sector: 'Materials', emoji: '⛏️' },

  // Utilities
  { symbol: 'SO', name: 'Southern Company', sector: 'Utilities', emoji: '💡' },
  { symbol: 'DUK', name: 'Duke Energy', sector: 'Utilities', emoji: '⚡' },
  { symbol: 'AEP', name: 'American Electric', sector: 'Utilities', emoji: '🔌' },

  // Gaming / Entertainment
  { symbol: 'TTWO', name: 'Take-Two Interactive', sector: 'Technology', emoji: '🎮' },
  { symbol: 'EA', name: 'Electronic Arts', sector: 'Technology', emoji: '⚽' },
  { symbol: 'ROKU', name: 'Roku', sector: 'Technology', emoji: '📺' },
  { symbol: 'U', name: 'Unity Software', sector: 'Technology', emoji: '🎯' },
];

export const SECTORS = [...new Set(STOCK_UNIVERSE.map(s => s.sector))];

export function getStocksBySection(sector: string): UniverseStock[] {
  return STOCK_UNIVERSE.filter(s => s.sector === sector);
}

export function searchUniverse(query: string): UniverseStock[] {
  const q = query.toLowerCase();
  return STOCK_UNIVERSE.filter(
    s => s.name.toLowerCase().includes(q) ||
         s.symbol.toLowerCase().includes(q) ||
         s.sector.toLowerCase().includes(q)
  );
}
