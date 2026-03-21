/* ── Learn tab scenario definitions ── */

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  year: string;
  keyLesson: string;
  metricsFocused: string[];
  /** Brief context the AI uses to generate the backtest + live application */
  context: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'rate-hikes-2022',
    title: 'When Rates Rise',
    subtitle: 'Fed raised rates 11 times in 2022',
    emoji: '📈',
    year: '2022',
    keyLesson: 'P/E means different things in different rate environments',
    metricsFocused: ['P/E Ratio', 'Free Cash Flow Yield', 'Debt-to-Equity'],
    context: `In 2022, the Federal Reserve raised interest rates 11 times to fight inflation. This crushed growth stocks (high P/E) while banks actually benefited. A P/E of 40 went from "normal for tech" to "dangerously expensive" overnight. Meanwhile, bank stocks with P/E of 12 became bargains because higher rates = more profit for banks. Key comparison: Tech ETF (QQQ) fell ~33%, while bank ETF (KBE) was roughly flat. The lesson: the same P/E ratio means completely different things depending on interest rates.`,
  },
  {
    id: 'covid-crash-2020',
    title: 'The COVID Crash',
    subtitle: 'Markets fell 34% in 23 days',
    emoji: '🦠',
    year: '2020',
    keyLesson: 'Debt-to-equity suddenly matters in a crisis',
    metricsFocused: ['Debt-to-Equity', 'Cash Position', 'Profit Margin'],
    context: `In March 2020, the S&P 500 fell 34% in just 23 days — the fastest crash ever. Companies with high debt (airlines, cruise lines, retailers) got crushed because they couldn't pay bills without revenue. Companies with low debt and lots of cash (Apple, Google) survived and recovered fast. Carnival Cruise (CCL) had debt-to-equity of 4.5 and fell 80%. Apple had net cash and fell only 30%, recovering in weeks. The lesson: in a crisis, debt goes from "boring metric" to "survival indicator."`,
  },
  {
    id: 'ai-boom-2023',
    title: 'The AI Boom',
    subtitle: 'Nvidia rose 239% in one year',
    emoji: '🤖',
    year: '2023',
    keyLesson: 'Sometimes high P/E is justified by explosive growth',
    metricsFocused: ['P/E Ratio', 'Revenue Growth', 'Profit Margin'],
    context: `In 2023, Nvidia's stock rose 239% as AI demand exploded. Its P/E hit 60+ — normally a "sell" signal. But revenue was growing 122% year-over-year with 55% profit margins. The high P/E was justified because earnings were about to catch up. Traditional value investors who avoided Nvidia because of high P/E missed the biggest stock gain of the decade. Meanwhile, companies claiming to be "AI plays" without real revenue (like C3.ai) rose and crashed. The lesson: P/E must be read alongside growth rate. High P/E + high growth = potentially justified. High P/E + low growth = danger.`,
  },
  {
    id: 'svb-crisis-2023',
    title: 'The Bank Crisis',
    subtitle: 'SVB collapsed in 48 hours',
    emoji: '🏦',
    year: '2023',
    keyLesson: 'Sometimes you need metrics that normally don\'t matter',
    metricsFocused: ['Interest Rate Sensitivity', 'Deposit Concentration', 'Bond Portfolio Duration'],
    context: `In March 2023, Silicon Valley Bank collapsed in 48 hours — the 2nd largest bank failure in US history. Normal bank metrics (P/E, profit margin) looked fine. The hidden danger was in metrics most people never check: 97% of deposits were uninsured (vs ~40% typical), and they held long-duration bonds that lost value as rates rose. JPMorgan, with diversified deposits and better risk management, was barely affected and actually bought the remains. The lesson: sometimes the most important metric is one you've never heard of. Context determines which metrics matter.`,
  },
  {
    id: 'oil-crash-2020',
    title: 'Oil Goes Negative',
    subtitle: 'Oil prices hit -$37 per barrel',
    emoji: '🛢️',
    year: '2020',
    keyLesson: 'Sector-specific grading needs sector-specific metrics',
    metricsFocused: ['Break-Even Price', 'Production Cost', 'Reserve Life'],
    context: `In April 2020, oil prices went negative for the first time in history — producers were PAYING people to take their oil. Companies with high production costs (shale producers, break-even at $50/barrel) went bankrupt. Companies with low production costs (Saudi Aramco, break-even at $10/barrel) survived. You couldn't evaluate oil companies using regular metrics like P/E — you needed oil-specific metrics like break-even price and reserve life. ExxonMobil survived because of diversification; many smaller producers didn't. The lesson: different industries need different grading criteria.`,
  },
  {
    id: 'meme-stocks-2021',
    title: 'Meme Stock Mania',
    subtitle: 'GameStop rose 1,700% in two weeks',
    emoji: '🚀',
    year: '2021',
    keyLesson: 'Popularity can override fundamentals — temporarily',
    metricsFocused: ['Short Interest', 'Social Sentiment', 'P/E Ratio', 'Revenue Trend'],
    context: `In January 2021, GameStop rose from $17 to $483 in two weeks — a 1,700% gain. Its fundamentals were terrible: declining revenue, closing stores, no profit. But Reddit's WallStreetBets community bought the stock to squeeze short sellers. The stock eventually fell back to ~$40. Meanwhile, Microsoft (similar gaming sector) just kept steadily growing based on fundamentals. The lesson: popularity (social media buzz, short squeezes) can move prices dramatically, but fundamentals win long-term. A stock's "grade" based on fundamentals didn't change — the price just temporarily ignored it.`,
  },
  {
    id: 'nvidia-inflection-2023',
    title: 'Catching an Upgrade',
    subtitle: 'Nvidia\'s grades improved before the stock moved',
    emoji: '⬆️',
    year: '2023',
    keyLesson: 'Grade changes can signal opportunity before price moves',
    metricsFocused: ['Revenue Growth', 'Profit Margin', 'Forward P/E'],
    context: `In early 2023, Nvidia's fundamentals were already improving before the stock really took off. Revenue growth accelerated from 0% to 122% in two quarters. Profit margins expanded from 26% to 55%. If you were grading Nvidia quarterly, you'd have seen: Growth grade went from C → A, Making Money grade went from B → A, all while the stock was still at $150 (before hitting $500+). The signal was in the grade CHANGES, not the absolute price. The lesson: watching how grades change over time can spot opportunities early. A stock upgrading from C to A is more interesting than one that's always been a B.`,
  },
  {
    id: 'nike-earnings-miss-2024',
    title: 'One Bad Quarter',
    subtitle: 'Nike fell 20% on one earnings report',
    emoji: '👟',
    year: '2024',
    keyLesson: 'Short-term noise vs. long-term grade stability',
    metricsFocused: ['Revenue Growth', 'Profit Margin', 'Brand Value', 'Historical Grade Stability'],
    context: `In late 2023, Nike's stock dropped 20% after missing revenue expectations. Revenue growth slowed, China sales disappointed, and inventory piled up. But Nike's other grades were still solid: strong profit margins (12%), low debt, massive brand value. Was this a grade-change event or noise? Historically, Nike had recovered from similar drops within 12-18 months. Compare to Peloton, which had similar drops but fundamental grade deterioration (revenue decline, cash burn). The lesson: one bad quarter doesn't necessarily change a company's grade. Look at whether the UNDERLYING grades changed, or just the stock price.`,
  },
];

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find(s => s.id === id);
}

export function getScenariosForMetric(metric: string): Scenario[] {
  return SCENARIOS.filter(s =>
    s.metricsFocused.some(m => m.toLowerCase().includes(metric.toLowerCase()))
  );
}
