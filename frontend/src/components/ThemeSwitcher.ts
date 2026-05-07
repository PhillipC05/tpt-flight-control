import { ThemeManager, THEMES } from '../services/ThemeManager.js';
import type { Theme } from '../services/ThemeManager.js';

export class ThemeSwitcher {
    private container: HTMLElement;
    private dropdown: HTMLElement | null = null;
    private isOpen = false;

    constructor(container: HTMLElement) {
        this.container = container;
        this.render();
        this.setupEventListeners();
    }

    private render(): void {
        const currentTheme = ThemeManager.getInstance().getTheme();
        const currentThemeLabel = THEMES.find(t => t.id === currentTheme)?.label || 'Mission Control';

        this.container.innerHTML = `
            <div class="relative theme-switcher">
                <button id="theme-toggle" class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-mc-textMuted hover:text-white transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span class="hidden md:inline">${currentThemeLabel}</span>
                    <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <div id="theme-dropdown" class="hidden absolute right-0 top-full mt-2 w-56 glass-card z-50 overflow-hidden">
                    <div class="py-1">
                        ${THEMES.map(theme => `
                            <button 
                                class="theme-option w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors ${theme.id === currentTheme ? 'bg-white/10' : ''}"
                                data-theme="${theme.id}"
                            >
                                <span class="w-2.5 h-2.5 rounded-full ${theme.dotClass}"></span>
                                <span class="text-sm">${theme.label}</span>
                                ${theme.id === currentTheme ? `
                                    <svg class="w-4 h-4 ml-auto text-mc-accent" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                    </svg>
                                ` : ''}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.dropdown = document.getElementById('theme-dropdown');
    }

    private setupEventListeners(): void {
        const toggleBtn = document.getElementById('theme-toggle');
        
        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const themeId = (e.currentTarget as HTMLElement).dataset.theme as Theme;
                if (themeId) {
                    ThemeManager.getInstance().setTheme(themeId);
                    this.closeDropdown();
                    this.render();
                    this.setupEventListeners();
                }
            });
        });

        document.addEventListener('click', () => {
            this.closeDropdown();
        });

        window.addEventListener('fc:themeChange', () => {
            this.render();
            this.setupEventListeners();
        });
    }

    private toggleDropdown(): void {
        this.isOpen = !this.isOpen;
        this.dropdown?.classList.toggle('hidden', !this.isOpen);
    }

    private closeDropdown(): void {
        this.isOpen = false;
        this.dropdown?.classList.add('hidden');
    }

    public destroy(): void {
        this.container.innerHTML = '';
    }
}