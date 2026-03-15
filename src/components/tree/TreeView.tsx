'use client';

import { useState } from 'react';
import type { StockData } from '@/lib/stock';
import { TreeNode } from './TreeNode';

interface Props {
  stock: StockData;
}

export interface DecisionNode {
  id: number;
  question: string;
  hint: string;
  dataLabel: string;
  dataValue: string;
  context: string;
  benchmark: string;
  maxScore: number;
}

function buildNodes(s: StockData): DecisionNode[] {
  return [
    {
      id: 1,
      question: 'Do you understand what this company does?',
      hint: 'Can you explain their product to a friend in one sentence?',
      dataLabel: 'Sector',
      dataValue: s.sector,
      context: s.description.slice(0, 200) + '...',
      benchmark: 'A good investor can explain the business simply.',
      maxScore: 2,
    },
    {
      id: 2,
      question: 'Is this company making money?',
      hint: `Look at the revenue and profit margin. What do these numbers tell you?`,
      dataLabel: 'Revenue',
      dataValue: `$${(s.revenue / 1e9).toFixed(1)}B (profit margin: ${(s.profitMargin * 100).toFixed(1)}%)`,
      context: s.profitMargin > 0
        ? `For every $1 in sales, they keep $${(s.profitMargin * 100).toFixed(0)} cents as profit.`
        : `This company is currently spending more than it earns.`,
      benchmark: 'Avg S&P 500 profit margin is ~11%. Above that is strong.',
      maxScore: 2,
    },
    {
      id: 3,
      question: 'Is it growing or shrinking?',
      hint: 'Revenue growth tells you if more or fewer people are buying their stuff.',
      dataLabel: 'Revenue Growth',
      dataValue: `${(s.revenueGrowth * 100).toFixed(1)}% year-over-year`,
      context: s.revenueGrowth > 0.1
        ? 'Growing fast — demand for their products is increasing.'
        : s.revenueGrowth > 0
        ? 'Growing slowly — steady but not exciting.'
        : 'Shrinking — fewer people are buying than last year.',
      benchmark: '5-15% growth is healthy. Over 20% is exceptional. Negative means trouble.',
      maxScore: 2,
    },
    {
      id: 4,
      question: 'Is the stock price reasonable for what you get?',
      hint: `P/E ratio = price / earnings. It tells you how many years of profits you're paying for.`,
      dataLabel: 'P/E Ratio',
      dataValue: s.pe > 0 ? `${s.pe.toFixed(1)}` : 'N/A (not profitable)',
      context: s.pe > 0
        ? `You're paying $${s.pe.toFixed(0)} for every $1 of annual profit. ${s.pe > 30 ? 'That\'s a premium — investors expect big future growth.' : 'That\'s reasonable compared to many stocks.'}`
        : 'No P/E because the company isn\'t profitable yet.',
      benchmark: 'S&P 500 average P/E is ~20-25. Under 15 = cheap. Over 40 = expensive.',
      maxScore: 2,
    },
    {
      id: 5,
      question: 'How risky is this company financially?',
      hint: 'Debt-to-equity shows how much the company borrowed vs. what it owns.',
      dataLabel: 'Debt-to-Equity',
      dataValue: s.debtToEquity.toFixed(2),
      context: s.debtToEquity < 0.5
        ? 'Very low debt — the company could survive tough times.'
        : s.debtToEquity < 1.5
        ? 'Moderate debt — normal for most companies.'
        : 'High debt — if business slows down, paying this back could be a problem.',
      benchmark: 'Under 1.0 is healthy. Over 2.0 is risky. Tech companies often have low debt.',
      maxScore: 2,
    },
  ];
}

export interface NodeResponse {
  nodeId: number;
  score: number;
  reasoning: string;
}

export function TreeView({ stock }: Props) {
  const nodes = buildNodes(stock);
  const [currentNode, setCurrentNode] = useState(0);
  const [responses, setResponses] = useState<NodeResponse[]>([]);

  const allRevealed = currentNode >= nodes.length;
  const totalScore = responses.reduce((sum, r) => sum + r.score, 0);
  const maxScore = nodes.reduce((sum, n) => sum + n.maxScore, 0);

  const handleNodeComplete = (response: NodeResponse) => {
    setResponses((prev) => [...prev.filter((r) => r.nodeId !== response.nodeId), response]);
    setCurrentNode((prev) => Math.max(prev, nodes.findIndex((n) => n.id === response.nodeId) + 1));
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">
          Should you invest in {stock.name}?
        </h3>
        <p className="text-sm text-text-secondary">
          Investigate 5 questions using real data. Read the numbers, write what you think, and get feedback.
        </p>
      </div>

      {/* Decision nodes */}
      <div className="space-y-1">
        {nodes.map((node, i) => (
          <div key={node.id}>
            <TreeNode
              node={node}
              revealed={i < currentNode}
              active={i === currentNode}
              onComplete={handleNodeComplete}
              company={stock.name}
              response={responses.find((r) => r.nodeId === node.id)}
            />
            {i < nodes.length - 1 && (
              <div className="ml-8 h-4 w-px bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Final score */}
      {allRevealed && (
        <div className="mt-8 p-6 rounded-xl border border-border bg-surface text-center">
          <p className="text-sm text-text-secondary mb-2">Your Analysis Score</p>
          <p className={`text-5xl font-bold font-mono ${
            totalScore >= 8 ? 'text-green' : totalScore >= 5 ? 'text-amber' : 'text-rose'
          }`}>
            {totalScore}/{maxScore}
          </p>
          <p className="text-sm text-text-secondary mt-3 max-w-md mx-auto">
            {totalScore >= 8
              ? `Great analysis! ${stock.name} looks solid based on the data you evaluated.`
              : totalScore >= 5
              ? `Decent analysis! ${stock.name} has some strengths and some concerns worth watching.`
              : `Careful! Your analysis found several concerns about ${stock.name}. More research might be needed.`}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {responses.map((r) => {
              const node = nodes.find((n) => n.id === r.nodeId);
              return (
                <div key={r.nodeId} className="px-3 py-1.5 rounded-lg bg-surface-hover text-xs">
                  <span className="text-text-tertiary">Q{r.nodeId}:</span>{' '}
                  <span className={`font-medium ${r.score >= 2 ? 'text-green' : r.score >= 1 ? 'text-amber' : 'text-rose'}`}>
                    {r.score}/{node?.maxScore ?? 2}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
