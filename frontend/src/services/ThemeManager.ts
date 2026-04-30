export type Theme = 'mission-control' | 'monochrome-pro' | 'aurora';

export const THEMES: Array<{ id: Theme; label: string; dotClass: string }> = [
  { id: 'mission-control', label: 'Mission Control', dotClass: 'fc-dot-mc'     },
  { id: 'monochrome-pro',  label: 'Monochrome Pro',  dotClass: 'fc-dot-mp'     },
  { id: 'aurora',          label: 'Aurora',           dotClass: 'fc-dot-aurora' },
];

export class ThemeManager {
  private static instance: ThemeManager;
  private current: Theme;

  private constructor() {
    this.current = (localStorage.getItem('fc_theme') as Theme) ?? 'mission-control';
    this.apply(this.current);
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) ThemeManager.instance = new ThemeManager();
    return ThemeManager.instance;
  }

  getTheme(): Theme { return this.current; }

  setTheme(theme: Theme): void {
    this.current = theme;
    localStorage.setItem('fc_theme', theme);
    this.apply(theme);
    window.dispatchEvent(new CustomEvent('fc:themeChange', { detail: { theme } }));
  }

  private apply(theme: Theme): void {
    document.documentElement.dataset.theme = theme;
  }
}
