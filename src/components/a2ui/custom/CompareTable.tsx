'use client';

interface CompareTableProps {
  title?: string;
  headers: string[];
  rows: { label: string; values: string[] }[];
}

export function CompareTable({ title, headers, rows }: CompareTableProps) {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-border">
          <span className="text-sm font-medium">{title}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-2.5 text-text-secondary font-medium text-left ${
                    i === 0 ? '' : 'text-center'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i < rows.length - 1 ? 'border-b border-border/50' : ''}>
                <td className="px-4 py-2.5 font-medium text-text">{row.label}</td>
                {row.values.map((v, j) => (
                  <td key={j} className="px-4 py-2.5 text-center text-text-secondary font-mono text-xs">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
