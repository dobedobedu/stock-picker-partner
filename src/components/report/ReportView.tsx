'use client';

import { useState, useEffect } from 'react';
import type { StockData } from '@/lib/stock';
import { gradeStock, gradeToGPA, type Grade, type SubjectGrade } from '@/lib/stock';
import { GradeRow } from './GradeRow';
import { buildTeacherCommentPrompt } from '@/lib/prompts';
import { Sparkles } from 'lucide-react';

interface Props {
  stock: StockData;
}

export function ReportView({ stock }: Props) {
  const initialGrades = gradeStock(stock);
  const [grades, setGrades] = useState<SubjectGrade[]>(initialGrades);
  const [teacherComment, setTeacherComment] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);

  // Reset grades when stock changes
  useEffect(() => {
    const newGrades = gradeStock(stock);
    setGrades(newGrades);
    setTeacherComment(null);
  }, [stock.symbol]);

  const gpa =
    grades.reduce((sum, g) => sum + gradeToGPA(g.grade), 0) / grades.length;

  const handleOverride = (index: number, newGrade: Grade) => {
    setGrades((prev) =>
      prev.map((g, i) =>
        i === index ? { ...g, grade: newGrade, reason: 'Overridden by student' } : g,
      ),
    );
  };

  const fetchComment = async () => {
    setCommentLoading(true);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildTeacherCommentPrompt(
            stock.name,
            grades.map((g) => ({ subject: g.subject, grade: g.grade })),
          ),
        }),
      });
      const data = await res.json();
      setTeacherComment(data.text ?? '');
    } catch {
      setTeacherComment('Could not generate comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Report card header */}
      <div className="rounded-t-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Report Card</h3>
            <p className="text-sm text-text-secondary">
              {stock.name} ({stock.symbol}) — {stock.sector}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-tertiary">Overall GPA</p>
            <p className={`text-3xl font-bold font-mono ${
              gpa >= 3.5 ? 'text-green' : gpa >= 2.5 ? 'text-amber' : 'text-rose'
            }`}>
              {gpa.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Subject rows */}
      <div className="border-x border-border divide-y divide-border">
        {grades.map((g, i) => (
          <GradeRow
            key={g.subject}
            grade={g}
            onOverride={(newGrade) => handleOverride(i, newGrade)}
          />
        ))}
      </div>

      {/* Teacher comment */}
      <div className="rounded-b-xl border border-border bg-surface p-5">
        {teacherComment ? (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber" />
              <span className="text-xs font-medium text-amber">Teacher Comment</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed italic">
              &ldquo;{teacherComment}&rdquo;
            </p>
          </div>
        ) : (
          <button
            onClick={fetchComment}
            disabled={commentLoading}
            className="flex items-center gap-2 text-sm text-accent hover:text-accent-dim transition-colors
                       disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {commentLoading ? 'Generating comment...' : 'Get teacher comment'}
          </button>
        )}
      </div>
    </div>
  );
}
