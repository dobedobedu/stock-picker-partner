/* ── Sector-specific colors and CSS patterns for cards ── */

export interface SectorStyle {
  color: string;       // primary accent color
  bg: string;          // card background
  pattern: string;     // CSS background for top pattern area
}

const SECTOR_STYLES: Record<string, SectorStyle> = {
  'Technology': {
    color: '#4f8cf7',
    bg: 'rgba(79, 140, 247, 0.08)',
    pattern: `repeating-linear-gradient(
      0deg, transparent, transparent 8px, rgba(79,140,247,0.15) 8px, rgba(79,140,247,0.15) 9px
    ), repeating-linear-gradient(
      90deg, transparent, transparent 8px, rgba(79,140,247,0.15) 8px, rgba(79,140,247,0.15) 9px
    )`,
  },
  'Healthcare': {
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.08)',
    pattern: `repeating-linear-gradient(
      45deg, transparent, transparent 6px, rgba(52,211,153,0.12) 6px, rgba(52,211,153,0.12) 7px
    ), repeating-linear-gradient(
      -45deg, transparent, transparent 6px, rgba(52,211,153,0.12) 6px, rgba(52,211,153,0.12) 7px
    )`,
  },
  'Financial Services': {
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.08)',
    pattern: `radial-gradient(circle, rgba(251,191,36,0.18) 1px, transparent 1px)`,
  },
  'Consumer Discretionary': {
    color: '#f87171',
    bg: 'rgba(248, 113, 113, 0.08)',
    pattern: `repeating-linear-gradient(
      0deg, transparent, transparent 10px, rgba(248,113,113,0.1) 10px, rgba(248,113,113,0.1) 11px
    )`,
  },
  'Consumer Staples': {
    color: '#fb923c',
    bg: 'rgba(251, 146, 60, 0.08)',
    pattern: `repeating-linear-gradient(
      90deg, transparent, transparent 12px, rgba(251,146,60,0.12) 12px, rgba(251,146,60,0.12) 13px
    )`,
  },
  'Energy': {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.08)',
    pattern: `repeating-linear-gradient(
      45deg, transparent, transparent 5px, rgba(245,158,11,0.15) 5px, rgba(245,158,11,0.15) 6px
    )`,
  },
  'Industrials': {
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.08)',
    pattern: `repeating-linear-gradient(
      0deg, transparent, transparent 6px, rgba(148,163,184,0.12) 6px, rgba(148,163,184,0.12) 7px
    ), repeating-linear-gradient(
      60deg, transparent, transparent 6px, rgba(148,163,184,0.08) 6px, rgba(148,163,184,0.08) 7px
    )`,
  },
  'Communication Services': {
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.08)',
    pattern: `repeating-conic-gradient(
      rgba(167,139,250,0.1) 0% 25%, transparent 0% 50%
    ) 0 0 / 12px 12px`,
  },
  'Real Estate': {
    color: '#67e8f9',
    bg: 'rgba(103, 232, 249, 0.08)',
    pattern: `repeating-linear-gradient(
      90deg, transparent, transparent 14px, rgba(103,232,249,0.1) 14px, rgba(103,232,249,0.1) 15px
    )`,
  },
  'Materials': {
    color: '#a3e635',
    bg: 'rgba(163, 230, 53, 0.08)',
    pattern: `repeating-linear-gradient(
      135deg, transparent, transparent 8px, rgba(163,230,53,0.1) 8px, rgba(163,230,53,0.1) 9px
    )`,
  },
  'Utilities': {
    color: '#facc15',
    bg: 'rgba(250, 204, 21, 0.08)',
    pattern: `repeating-linear-gradient(
      0deg, transparent, transparent 4px, rgba(250,204,21,0.08) 4px, rgba(250,204,21,0.08) 5px
    )`,
  },
};

const DEFAULT_STYLE: SectorStyle = {
  color: '#888888',
  bg: 'rgba(136, 136, 136, 0.08)',
  pattern: `repeating-linear-gradient(
    45deg, transparent, transparent 8px, rgba(136,136,136,0.1) 8px, rgba(136,136,136,0.1) 9px
  )`,
};

export function getSectorStyle(sector: string): SectorStyle {
  return SECTOR_STYLES[sector] ?? DEFAULT_STYLE;
}

// Background-size for Financial Services dot pattern
export function getPatternSize(sector: string): string | undefined {
  if (sector === 'Financial Services') return '10px 10px';
  return undefined;
}
