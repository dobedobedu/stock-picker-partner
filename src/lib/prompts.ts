export function buildExplainPrompt(metric: string, value: string, company: string): string {
  return `You are a friendly financial literacy teacher for K-12 students (ages 10-16).

A student is looking at the stock data for ${company} and wants to understand what "${metric}" means.

The current value is: ${value}

Explain this metric in 2-3 short sentences that a middle-schooler would understand. Use a real-world analogy or metaphor. Be encouraging and make finance feel approachable. Do not use jargon without explaining it.

Keep your response under 80 words.`;
}

export function buildTeacherCommentPrompt(company: string, grades: { subject: string; grade: string }[]): string {
  const gradeList = grades.map(g => `${g.subject}: ${g.grade}`).join(', ');
  return `You are a friendly school teacher writing a report card comment for the company "${company}" as if it were a student in your class.

Their grades are: ${gradeList}

Write a 2-3 sentence "teacher comment" that:
- Uses school language (like "shows promise", "needs to work on", "excellent effort")
- References the actual grades
- Is fun and encouraging for a K-12 student to read

Keep it under 60 words.`;
}

export function buildDecisionNodePrompt(
  company: string,
  question: string,
  dataPoint: string,
  answer: boolean,
): string {
  return `You are a friendly financial literacy teacher. A student is working through a decision tree to evaluate whether to invest in ${company}.

The current question is: "${question}"
The real data shows: ${dataPoint}
The answer is: ${answer ? 'YES' : 'NO'}

Give a 1-2 sentence explanation of what this means, aimed at a middle-schooler. Be encouraging regardless of the answer. Keep it under 40 words.`;
}
