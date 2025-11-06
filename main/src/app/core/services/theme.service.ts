import { Injectable, signal } from '@angular/core';
import { Theme } from '../../core/interfaces/theme.interface';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private themeSignal = signal<Theme>(Theme.System);
    private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    private mediaListener = (e: MediaQueryListEvent) => {
        if (this.themeSignal() === Theme.System) {
            this.applyThemeAttribute(e.matches ? Theme.Dark : Theme.Light);
        }
    };

    get theme(): Theme {
        return this.themeSignal();
    }

    constructor() {
        this.loadTheme();
        this.listenForExternalStorageChanges();
    }

    private get chromeAvailable(): boolean {
        const anyWin = window as any;
        return typeof anyWin !== 'undefined' && !!anyWin.chrome?.storage?.local;
    }

    private async loadTheme() {
        const stored = await this.storageGet<'light' | 'dark' | 'system'>('theme', 'system');
        const parsed = (stored as Theme) ?? Theme.System;
        this.setTheme(parsed, /*persist*/ false);
    }

    private storageGet<T = unknown>(key: string, fallback: T): Promise<T> {
        return new Promise<T>((resolve) => {
            if (this.chromeAvailable) {
                (window as any).chrome.storage.local.get(key, (result: Record<string, T>) => {
                    resolve(result?.[key] ?? fallback);
                });
            } else {
                try {
                    const raw = localStorage.getItem(key);
                    resolve(raw ? JSON.parse(raw) as T : fallback);
                } catch {
                    resolve(fallback);
                }
            }
        });
    }

    private storageSet<T = unknown>(key: string, value: T): void {
        if (this.chromeAvailable) {
            (window as any).chrome.storage.local.set({ [key]: value });
        }
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // ignore
        }
    }

    private getSystemTheme(): Theme {
        return this.mediaQuery.matches ? Theme.Dark : Theme.Light;
    }

    private applyThemeAttribute(theme: Theme) {
        const resolved = theme === Theme.System ? this.getSystemTheme() : theme;
        document.documentElement.setAttribute('data-theme', resolved === Theme.Dark ? 'dark' : 'light');
    }

    setTheme(theme: Theme, persist: boolean = true) {
        if (this.themeSignal() === Theme.System && theme !== Theme.System) {
            this.mediaQuery.removeEventListener?.('change', this.mediaListener);
        }

        this.themeSignal.set(theme);
        this.applyThemeAttribute(theme);

        if (theme === Theme.System) {
            this.mediaQuery.addEventListener?.('change', this.mediaListener);
        }

        if (persist) {
            this.storageSet('theme', theme);
        }
    }

    private listenForExternalStorageChanges() {
        if (!this.chromeAvailable) return;
        (window as any).chrome.storage.onChanged?.addListener((changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
            if (areaName !== 'local') return;
            if ('theme' in changes) {
                const next = changes['theme'].newValue as Theme;
                if (next && next !== this.themeSignal()) {
                    this.setTheme(next, /*persist*/ false);
                }
            }
        });
    }
}