/* ── ELI5 Financial Glossary ── */

export interface GlossaryTerm {
  id: string;
  term: string;
  emoji: string;
  category: 'basics' | 'metrics' | 'instruments' | 'macro';
  cards: {
    /** What is it? Ballpark value / range */
    ballpark: {
      headline: string;
      value: string;        // e.g. "$3 Trillion" or "2-5%"
      valueLabel: string;   // e.g. "Apple's market cap" or "typical range"
      explain: string;      // 1-2 sentence ELI5
    };
    /** Why it matters / how it's calculated */
    why: {
      headline: string;
      formula?: string;     // simple formula if applicable
      explain: string;
    };
    /** Make it click — analogy, hook, or fun fact */
    hook: {
      headline: string;
      explain: string;
      visual?: 'scale' | 'comparison' | 'timeline'; // hint for future visuals
    };
  };
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: 'market-cap',
    term: 'Market Cap',
    emoji: '🏔',
    category: 'basics',
    cards: {
      ballpark: {
        headline: 'How much is the whole company worth?',
        value: '$3.4T',
        valueLabel: "Apple's market cap",
        explain: "If you could buy every single share of Apple stock, you'd need $3.4 trillion. That's the market cap.",
      },
      why: {
        headline: 'How is it calculated?',
        formula: 'Share Price × Total Shares',
        explain: "If a stock costs $200 and there are 15 billion shares, the market cap is $3 trillion. It tells you the company's total size — like weighing a company on a scale.",
      },
      hook: {
        headline: 'Think of it like real estate',
        explain: "Market cap is like a house's price tag. A $3T company is a mansion. A $500M company is a starter home. Both can be good investments — it depends on the neighborhood (industry).",
        visual: 'scale',
      },
    },
  },
  {
    id: 'dividend',
    term: 'Dividend',
    emoji: '🎁',
    category: 'basics',
    cards: {
      ballpark: {
        headline: 'Free money for owning stock?',
        value: '1-5%',
        valueLabel: 'typical annual yield',
        explain: "Some companies pay you cash just for holding their stock. Coca-Cola pays about $1.94 per share every year — that's your dividend.",
      },
      why: {
        headline: 'Why do companies pay dividends?',
        formula: 'Annual Dividend ÷ Stock Price = Yield',
        explain: "A $100 stock paying $3/year has a 3% yield. Companies pay dividends to attract investors. Mature, profitable companies can afford it. Fast-growing companies usually reinvest instead.",
      },
      hook: {
        headline: 'It\'s like an allowance',
        explain: "Imagine you own a lemonade stand. Every month, instead of keeping all the profit, you give some to your investors. That's a dividend. Some people build a whole income just from dividends — no job needed!",
        visual: 'comparison',
      },
    },
  },
  {
    id: 'pe-ratio',
    term: 'P/E Ratio',
    emoji: '🏷️',
    category: 'metrics',
    cards: {
      ballpark: {
        headline: 'Is this stock expensive?',
        value: '15-25×',
        valueLabel: 'average S&P 500 P/E',
        explain: "P/E tells you how many dollars investors pay for every $1 the company earns. The S&P 500 average is about 20. Higher = investors expect big growth.",
      },
      why: {
        headline: 'Price ÷ Earnings',
        formula: 'Stock Price ÷ Earnings Per Share',
        explain: "A stock at $100 earning $5/share has P/E of 20. That means you're paying $20 for every $1 of profit. Lower P/E = cheaper. But a P/E of 5 might mean trouble — nobody wants to pay more.",
      },
      hook: {
        headline: 'Like buying a vending machine',
        explain: "If a vending machine earns $1,000/year and costs $20,000, its P/E is 20. You'd get your money back in 20 years. Would you pay $100,000 for that same machine? That's a P/E of 100 — you'd need a really good reason!",
        visual: 'comparison',
      },
    },
  },
  {
    id: 'etf',
    term: 'ETF',
    emoji: '🧺',
    category: 'instruments',
    cards: {
      ballpark: {
        headline: 'A basket of stocks in one buy',
        value: 'SPY ~$500',
        valueLabel: 'S&P 500 ETF price',
        explain: "An ETF (Exchange-Traded Fund) lets you buy hundreds of stocks at once. One share of SPY gives you a tiny piece of all 500 biggest US companies.",
      },
      why: {
        headline: 'Why not just buy stocks?',
        explain: "Buying Apple alone is risky — what if Apple has a bad year? An ETF spreads your money across many companies. If one drops, others might rise. It's instant diversification, and fees are tiny (often 0.03%).",
      },
      hook: {
        headline: 'Like a variety pack',
        explain: "Instead of buying one flavor of chips, an ETF is the variety pack. You get tech stocks, bank stocks, healthcare stocks — all in one bag. The most popular ETF (SPY) has been around since 1993 and returned ~10% per year.",
        visual: 'comparison',
      },
    },
  },
  {
    id: 'bond',
    term: 'Bond',
    emoji: '📜',
    category: 'instruments',
    cards: {
      ballpark: {
        headline: 'Lending money to a company or government',
        value: '4-5%',
        valueLabel: '10-year US Treasury yield',
        explain: "When you buy a bond, you're lending money. The borrower (a company or the US government) promises to pay you back with interest. US Treasury bonds are considered the safest investment in the world.",
      },
      why: {
        headline: 'How bonds work',
        formula: 'You lend $1,000 → Get interest every 6 months → Get $1,000 back at maturity',
        explain: "Bonds are predictable. You know exactly how much you'll earn. When stocks crash, people run to bonds for safety. That's why bond prices go UP when stocks go DOWN.",
      },
      hook: {
        headline: 'You become the bank',
        explain: "When you buy a bond, YOU are the bank. The government borrows from you and pays you interest. The US government has never missed a payment in over 200 years. That's why they call it 'risk-free.'",
        visual: 'timeline',
      },
    },
  },
  {
    id: 'interest-rate',
    term: 'Interest Rate',
    emoji: '📊',
    category: 'macro',
    cards: {
      ballpark: {
        headline: 'The price of borrowing money',
        value: '4.25-4.50%',
        valueLabel: 'current Fed funds rate',
        explain: "Interest rates control how expensive it is to borrow money. When rates are high, mortgages, car loans, and credit cards all cost more. Companies borrow less too, which slows the economy.",
      },
      why: {
        headline: 'Why do rates change?',
        explain: "The Federal Reserve raises rates to fight inflation (prices rising too fast) and lowers them to boost a slowing economy. Higher rates = stocks usually drop because borrowing costs more and bonds become more attractive.",
      },
      hook: {
        headline: 'The economy\'s thermostat',
        explain: "Interest rates are like a thermostat. Economy too hot (inflation)? Turn rates UP to cool it down. Economy too cold (recession)? Turn rates DOWN to heat things up. The Fed adjusts this thermostat about 8 times a year.",
        visual: 'scale',
      },
    },
  },
  {
    id: 'fed-funds-rate',
    term: 'Federal Funds Rate',
    emoji: '🏛️',
    category: 'macro',
    cards: {
      ballpark: {
        headline: 'The rate that controls all other rates',
        value: '4.25-4.50%',
        valueLabel: 'as of March 2026',
        explain: "This is the interest rate banks charge each other for overnight loans. It's set by the Federal Reserve and it ripples through the entire economy — your mortgage, your savings account, even stock prices.",
      },
      why: {
        headline: 'How it affects everything',
        explain: "When the Fed raises this rate, banks raise their rates too. Credit cards go from 15% to 22%. Mortgages go from 3% to 7%. Companies can't borrow cheaply to grow. Stock prices often drop because future profits are worth less.",
      },
      hook: {
        headline: 'The domino that tips everything',
        explain: "In 2022, the Fed raised rates from 0% to 5.25% in 16 months — the fastest increase in 40 years. The stock market fell 25%. Housing slowed. Crypto crashed 70%. All from one number changing.",
        visual: 'timeline',
      },
    },
  },
  {
    id: 'profit-margin',
    term: 'Profit Margin',
    emoji: '💰',
    category: 'metrics',
    cards: {
      ballpark: {
        headline: 'How much profit per dollar of sales?',
        value: '10-30%',
        valueLabel: 'typical range (varies by sector)',
        explain: "If Apple sells a $1,000 iPhone and keeps $270 as profit, that's a 27% profit margin. Tech companies average 20%+. Grocery stores? Only 1-2%. The industry matters a LOT.",
      },
      why: {
        headline: 'Net Income ÷ Revenue',
        formula: 'Profit ÷ Total Sales × 100',
        explain: "High margins mean the company is efficient — it keeps more of what it earns. Low margins mean most revenue goes to costs. A drop in margin can signal trouble even if revenue is growing.",
      },
      hook: {
        headline: 'The lemonade stand test',
        explain: "You sell lemonade for $1. Lemons cost 30¢, cups cost 10¢, sugar costs 10¢. You keep 50¢. Your margin is 50%! Now imagine you need to hire someone for 40¢ — suddenly your margin is only 10%. That's why companies obsess over margins.",
        visual: 'scale',
      },
    },
  },
  {
    id: 'debt-to-equity',
    term: 'Debt-to-Equity',
    emoji: '🛡️',
    category: 'metrics',
    cards: {
      ballpark: {
        headline: 'How much does the company owe?',
        value: '0.5-1.5',
        valueLabel: 'healthy range for most companies',
        explain: "D/E of 1.0 means the company owes exactly as much as it owns. Below 1.0 is usually healthy. Above 2.0 gets risky. Banks naturally run higher (3-5) because lending IS their business.",
      },
      why: {
        headline: 'Total Debt ÷ Shareholder Equity',
        formula: 'What you owe ÷ What you own',
        explain: "If a company has $50M in debt and $100M in equity, D/E is 0.5 — safe. In a crisis, high-debt companies can't pay bills. Low-debt companies survive and buy their struggling competitors.",
      },
      hook: {
        headline: 'Like your personal finances',
        explain: "Imagine you own a $300K house but owe $250K on the mortgage. Your D/E is about 5.0 — risky! If your house drops 20% in value, you're underwater. Companies with high D/E face the same risk in recessions.",
        visual: 'scale',
      },
    },
  },
  {
    id: 'revenue-growth',
    term: 'Revenue Growth',
    emoji: '📈',
    category: 'metrics',
    cards: {
      ballpark: {
        headline: 'Is the company selling more?',
        value: '5-25%',
        valueLabel: 'annual growth (varies by stage)',
        explain: "A young tech company might grow 50%+ per year. A mature company like Coca-Cola grows 3-5%. Both can be good — what matters is whether growth is accelerating or slowing down.",
      },
      why: {
        headline: '(This Year Revenue - Last Year) ÷ Last Year',
        formula: '(New - Old) ÷ Old × 100',
        explain: "Revenue growth is the engine. No growth = stalling business. Negative growth = shrinking. Investors pay premium prices (high P/E) for companies growing fast because those $1 of earnings today could be $5 in a few years.",
      },
      hook: {
        headline: 'Speed vs. size',
        explain: "Nvidia grew revenue 122% in 2023 — like going from $27B to $60B in one year. Walmart grew 6% — but that's $32 billion in new revenue. Sometimes slow percentage growth on a massive base is more impressive than a big percentage on a small number.",
        visual: 'comparison',
      },
    },
  },
  {
    id: 'sp500',
    term: 'S&P 500',
    emoji: '🏆',
    category: 'instruments',
    cards: {
      ballpark: {
        headline: 'The 500 biggest US companies',
        value: '~5,800',
        valueLabel: 'index level (2026)',
        explain: "The S&P 500 tracks the 500 largest publicly traded US companies. When people say 'the market is up,' they usually mean the S&P 500. It's THE benchmark for US stocks.",
      },
      why: {
        headline: 'Why everyone watches it',
        explain: "About 90% of professional fund managers fail to beat the S&P 500 over 15 years. That's why index investing is so popular — just buy the whole market and you'll beat most experts. Average annual return: ~10% since 1957.",
      },
      hook: {
        headline: '$100 invested in 1957 = $70,000+ today',
        explain: "If your grandparents put $100 in the S&P 500 when it started, it'd be worth over $70,000 now — without picking a single stock. Warren Buffett's advice for most people: just buy an S&P 500 index fund and hold it forever.",
        visual: 'timeline',
      },
    },
  },
  {
    id: 'inflation',
    term: 'Inflation',
    emoji: '🎈',
    category: 'macro',
    cards: {
      ballpark: {
        headline: 'Why things cost more every year',
        value: '2-3%',
        valueLabel: 'the Fed\'s target rate',
        explain: "Inflation means prices rise over time. A $5 coffee today might cost $5.15 next year. The Fed targets 2% inflation — enough to keep the economy growing but not enough to crush your wallet.",
      },
      why: {
        headline: 'Why it matters for stocks',
        explain: "High inflation (6%+) is bad for stocks because the Fed raises rates to fight it. Companies' future profits are worth less in today's dollars. Your $1,000 in savings loses buying power. That's why investing matters — to beat inflation.",
      },
      hook: {
        headline: 'The invisible tax',
        explain: "In 1970, a movie ticket cost $1.55. Today it's $11. That's inflation — 3.3% per year for 54 years. If your savings earn 1% but inflation is 3%, you're actually losing 2% per year. Stocks average 10% — that's how you stay ahead.",
        visual: 'timeline',
      },
    },
  },
];

export const GLOSSARY_CATEGORIES = [
  { id: 'basics', label: 'Basics', emoji: '🎯' },
  { id: 'metrics', label: 'Metrics', emoji: '📐' },
  { id: 'instruments', label: 'Instruments', emoji: '🧰' },
  { id: 'macro', label: 'Economy', emoji: '🌍' },
] as const;

export function getTermById(id: string): GlossaryTerm | undefined {
  return GLOSSARY.find(t => t.id === id);
}
