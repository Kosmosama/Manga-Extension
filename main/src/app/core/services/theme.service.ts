import { inject, Injectable, signal } from '@angular/core';
import { Observable, defer } from 'rxjs';
import { Theme } from '../../core/interfaces/theme.interface';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private themeSignal = signal<Theme>(Theme.System);

    private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    private mediaListener = (e: MediaQueryListEvent) => {
        if (this.themeSignal() === Theme.System) {
            this.applyThemeAttribute(e.matches ? Theme.Dark : Theme.Light);
        }
    };

    constructor() {
        this.loadTheme$().subscribe();
        this.listenForExternalStorageChanges();
    }

    get theme(): Theme {
        return this.themeSignal();
    }

    private get chromeAvailable(): boolean {
        const anyWin = window as any;
        return typeof anyWin !== 'undefined' && !!anyWin.chrome?.storage?.local;
    }

    private storageGet$<T = unknown>(key: string, fallback: T): Observable<T> {
        return defer(() => new Observable<T>(subscriber => {
            if (this.chromeAvailable) {
                (window as any).chrome.storage.local.get(key, (result: Record<string, T>) => {
                    try {
                        subscriber.next(result?.[key] ?? fallback);
                    } finally {
                        subscriber.complete();
                    }
                });
            } else {
                try {
                    const raw = localStorage.getItem(key);
                    subscriber.next(raw ? JSON.parse(raw) as T : fallback);
                } catch {
                    subscriber.next(fallback);
                } finally {
                    subscriber.complete();
                }
            }
        }));
    }

    private storageSet<T = unknown>(key: string, value: T): void {
        if (this.chromeAvailable) {
            (window as any).chrome.storage.local.set({ [key]: value });
        }
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
        }
    }

    private getSystemTheme(): Theme {
        return this.mediaQuery.matches ? Theme.Dark : Theme.Light;
    }

    private applyThemeAttribute(theme: Theme) {
        const resolved = theme === Theme.System ? this.getSystemTheme() : theme;
        document.documentElement.setAttribute('data-theme', resolved === Theme.Dark ? 'dark' : 'light');
    }

    /**
     * Public API: set theme and persist (Observable side-effect).
     */
    setTheme(theme: Theme): Observable<void> {
        return defer(() => new Observable<void>(subscriber => {
            if (this.themeSignal() === Theme.System && theme !== Theme.System) {
                this.mediaQuery.removeEventListener?.('change', this.mediaListener);
            }

            this.themeSignal.set(theme);
            this.applyThemeAttribute(theme);

            if (theme === Theme.System) {
                this.mediaQuery.addEventListener?.('change', this.mediaListener);
            }

            this.storageSet('theme', theme);
            subscriber.next();
            subscriber.complete();
        }));
    }

    private loadTheme$(): Observable<void> {
        return defer(() => new Observable<void>(subscriber => {
            this.storageGet$<'light' | 'dark' | 'system'>('theme', 'system').subscribe(stored => {
                const parsed = (stored as Theme) ?? Theme.System;
                if (this.themeSignal() === Theme.System && parsed !== Theme.System) {
                    this.mediaQuery.removeEventListener?.('change', this.mediaListener);
                }
                this.themeSignal.set(parsed);
                this.applyThemeAttribute(parsed);
                if (parsed === Theme.System) {
                    this.mediaQuery.addEventListener?.('change', this.mediaListener);
                }
                subscriber.next();
                subscriber.complete();
            });
        }));
    }

    private listenForExternalStorageChanges() {
        if (!this.chromeAvailable) return;
        (window as any).chrome.storage.onChanged?.addListener((changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
            if (areaName !== 'local') return;
            if ('theme' in changes) {
                const next = changes['theme'].newValue as Theme;
                if (next && next !== this.themeSignal()) {
                    if (this.themeSignal() === Theme.System && next !== Theme.System) {
                        this.mediaQuery.removeEventListener?.('change', this.mediaListener);
                    }
                    this.themeSignal.set(next);
                    this.applyThemeAttribute(next);
                    if (next === Theme.System) {
                        this.mediaQuery.addEventListener?.('change', this.mediaListener);
                    }
                }
            }
        });
    }
}