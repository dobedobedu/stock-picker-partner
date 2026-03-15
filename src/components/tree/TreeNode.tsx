'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Circle, Sparkles, Send } from 'lucide-react';
import type { DecisionNode, NodeResponse } from './TreeView';

interface Props {
  node: DecisionNode;
  revealed: boolean;
  active: boolean;
  onComplete: (response: NodeResponse) => void;
  company: string;
  response?: NodeResponse;
}

export function TreeNode({ node, revealed, active, onComplete, company, response }: Props) {
  const [reasoning, setReasoning] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState(false);

  const handleRevealData = () => {
    if (!active) return;
    setShowData(true);
  };

  const handleSubmit = async () => {
    if (!reasoning.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildFeedbackPrompt(company, node, reasoning.trim()),
        }),
      });
      const data = await res.json();
      const text = data.text ?? '';

      // Extract score from AI response (expects "Score: X/2" somewhere)
      const scoreMatch = text.match(/Score:\s*(\d)/i);
      const aiScore = scoreMatch ? Math.min(parseInt(scoreMatch[1]), node.maxScore) : 1;

      setFeedback(text.replace(/Score:\s*\d\/\d\s*/i, '').trim());
      setScore(aiScore);

      onComplete({ nodeId: node.id, score: aiScore, reasoning: reasoning.trim() });
    } catch {
      setFeedback('Could not get feedback right now.');
      setScore(1);
      onComplete({ nodeId: node.id, score: 1, reasoning: reasoning.trim() });
    } finally {
      setLoading(false);
    }
  };

  const isComplete = revealed && response;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        active
          ? 'border-accent bg-surface'
          : isComplete
          ? 'border-border bg-surface'
          : 'border-border bg-bg opacity-40'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className="mt-0.5">
          {isComplete ? (
            (response?.score ?? 0) >= 2 ? (
              <CheckCircle className="w-5 h-5 text-green" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber" />
            )
          ) : (
            <Circle className={`w-5 h-5 ${active ? 'text-accent' : 'text-text-tertiary'}`} />
          )}
        </div>

        <div className="flex-1">
          {/* Question */}
          <p className="text-sm font-medium">
            {node.id}. {node.question}
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">{node.hint}</p>

          {/* Active node: reveal data → write reasoning → get feedback */}
          <AnimatePresence>
            {active && !isComplete && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {!showData ? (
                  <button
                    onClick={handleRevealData}
                    className="mt-3 px-3 py-1.5 text-xs font-medium rounded-lg border border-accent text-accent
                               hover:bg-accent/10 transition-colors"
                  >
                    Show me the data
                  </button>
                ) : (
                  <div className="mt-3 space-y-3">
                    {/* Data card */}
                    <div className="p-3 rounded-lg bg-surface-hover border border-border">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium text-accent">{node.dataLabel}</span>
                        <span className="text-sm font-mono font-semibold">{node.dataValue}</span>
                      </div>
                      <p className="text-xs text-text-secondary">{node.context}</p>
                      <p className="text-[10px] text-text-tertiary mt-1">Benchmark: {node.benchmark}</p>
                    </div>

                    {/* Student reasoning input */}
                    {score === null && (
                      <div>
                        <label className="text-xs text-text-secondary block mb-1.5">
                          What do you think? Write your analysis in 1-2 sentences:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={reasoning}
                            onChange={(e) => setReasoning(e.target.value)}
                            placeholder="I think this means..."
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-bg
                                       placeholder:text-text-tertiary focus:border-accent transition-colors"
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            disabled={loading}
                          />
                          <button
                            onClick={handleSubmit}
                            disabled={!reasoning.trim() || loading}
                            className="px-3 py-2 rounded-lg bg-accent text-bg text-sm font-medium
                                       hover:bg-accent-dim transition-colors disabled:opacity-40"
                          >
                            {loading ? (
                              <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* AI feedback */}
                    {feedback && (
                      <div className="p-3 rounded-lg bg-surface border border-border">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber" />
                            <span className="text-xs font-medium text-amber">Feedback</span>
                          </div>
                          <span className={`text-xs font-mono font-bold ${
                            (score ?? 0) >= 2 ? 'text-green' : (score ?? 0) >= 1 ? 'text-amber' : 'text-rose'
                          }`}>
                            {score}/{node.maxScore}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">{feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completed node summary */}
          {isComplete && !active && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-surface-hover">
                  {node.dataLabel}: {node.dataValue}
                </span>
                <span className={`text-xs font-mono font-bold ${
                  (response?.score ?? 0) >= 2 ? 'text-green' : 'text-amber'
                }`}>
                  {response?.score}/{node.maxScore}
                </span>
              </div>
              <p className="text-xs text-text-tertiary italic">&ldquo;{response?.reasoning}&rdquo;</p>
            </div>
          )}

          {/* Not yet active */}
          {!active && !isComplete && (
            <p className="mt-1 text-xs text-text-tertiary">Complete the previous question first</p>
          )}
        </div>
      </div>
    </div>
  );
}

function buildFeedbackPrompt(company: string, node: DecisionNode, studentReasoning: string): string {
  return `You are a friendly financial literacy teacher grading a student's analysis of ${company}.

The question was: "${node.question}"
The data shown: ${node.dataLabel}: ${node.dataValue}
Context: ${node.context}
Benchmark: ${node.benchmark}

The student wrote: "${studentReasoning}"

Grade their reasoning on a scale of 0-${node.maxScore}:
- ${node.maxScore}: Shows clear understanding of the data and draws a reasonable conclusion
- ${Math.floor(node.maxScore / 2)}: Partially correct but missing key insight
- 0: Incorrect or shows misunderstanding

Start your response with "Score: X/${node.maxScore}" then give 1-2 sentences of encouraging feedback. If they're wrong, gently correct them. If they're right, reinforce what they got right. Keep it under 50 words total. Use language a middle-schooler would understand.`;
}
