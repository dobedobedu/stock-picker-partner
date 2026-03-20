/* ── User preferences: simple/detailed toggle, localStorage ── */

export type DetailLevel = 'simple' | 'detailed';

const STORAGE_KEY = 'stock-literacy-preferences';

export interface Preferences {
  detailLevel: DetailLevel;
}

const DEFAULTS: Preferences = {
  detailLevel: 'simple',
};

export function loadPreferences(): Preferences {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function savePreferences(prefs: Preferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
