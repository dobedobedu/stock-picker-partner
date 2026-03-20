/* ── Color utilities for heatmap and grade display ── */

import type { Grade } from './grading';

/** Map daily change percent (-5%..+5%) to a color string */
export function changeToColor(changePercent: number): string {
  const clamped = Math.max(-5, Math.min(5, changePercent));
  const t = (clamped + 5) / 10; // 0..1 where 0=red, 0.5=neutral, 1=green

  if (t < 0.5) {
    // red zone: interpolate from strong red to dim
    const intensity = 1 - t * 2; // 1..0
    return `rgba(248, 113, 113, ${0.15 + intensity * 0.65})`; // rose
  } else {
    // green zone: interpolate from dim to strong green
    const intensity = (t - 0.5) * 2; // 0..1
    return `rgba(52, 211, 153, ${0.15 + intensity * 0.65})`; // green
  }
}

/** Map GPA (0..4) to a color string */
export function gpaToColor(gpa: number): string {
  if (gpa >= 3.5) return 'rgba(52, 211, 153, 0.7)';   // green — A range
  if (gpa >= 2.5) return 'rgba(79, 140, 247, 0.6)';   // accent/blue — B range
  if (gpa >= 1.5) return 'rgba(251, 191, 36, 0.5)';   // amber — C range
  return 'rgba(248, 113, 113, 0.5)';                    // rose — D/F range
}

/** Map letter grade to a color string */
export function gradeToColor(grade: Grade): string {
  switch (grade) {
    case 'A': return '#34d399'; // green
    case 'B': return '#4f8cf7'; // accent
    case 'C': return '#fbbf24'; // amber
    case 'D': return '#f87171'; // rose
    case 'F': return '#dc2626'; // deep rose
  }
}

/** Map letter grade to a background color (muted for cards) */
export function gradeToBg(grade: Grade): string {
  switch (grade) {
    case 'A': return 'rgba(52, 211, 153, 0.12)';
    case 'B': return 'rgba(79, 140, 247, 0.12)';
    case 'C': return 'rgba(251, 191, 36, 0.12)';
    case 'D': return 'rgba(248, 113, 113, 0.12)';
    case 'F': return 'rgba(220, 38, 38, 0.12)';
  }
}

/** Change percent opacity based on magnitude */
export function changeToOpacity(changePercent: number): number {
  const abs = Math.abs(changePercent);
  return Math.min(1, 0.3 + abs * 0.14);
}
