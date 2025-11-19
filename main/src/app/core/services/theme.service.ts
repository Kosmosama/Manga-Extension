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

    /**
     * Gets the currently selected theme.
     *
     * @returns The current theme value
     */
    get theme(): Theme {
        return this.themeSignal();
    }

    /**
     * Indicates whether `chrome.storage.local` is available (e.g. in browser extension environment).
     *
     * @returns `true` if Chrome storage API is available, otherwise false
     */
    private get chromeAvailable(): boolean {
        const anyWin = window as any;
        return typeof anyWin !== 'undefined' && !!anyWin.chrome?.storage?.local;
    }

    /**
     * Retrieves a value from persistent storage, falling back to `localStorage` if not running in Chrome extension context.
     *
     * @typeParam T - Type of the stored value
     * @param key The storage key to retrieve
     * @param fallback The default value to emit if the key does not exist or read fails
     * @returns Observable emitting the stored or fallback value
     */
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

    /**
     * Stores a value persistently, using Chrome Extension storage if available, otherwise falling back to `localStorage`.
     *
     * @typeParam T - Type of the value to store
     * @param key The storage key
     * @param value The value to persist
     */
    private storageSet<T = unknown>(key: string, value: T): void {
        if (this.chromeAvailable) {
            (window as any).chrome.storage.local.set({ [key]: value });
        }
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Ignore write failures
        }
    }

    /**
     * Determines the current OS/system theme by reading the `prefers-color-scheme` media query.
     *
     * @returns `Theme.Dark` if system is dark, otherwise `Theme.Light`
     */
    private getSystemTheme(): Theme {
        return this.mediaQuery.matches ? Theme.Dark : Theme.Light;
    }

    /**
     * Applies the effective visual theme to the DOM `<html>` element as `data-theme="light|dark"`.
     *
     * @param theme The selected theme. If set to `System`, it resolves to the actual OS theme before applying.
     */
    private applyThemeAttribute(theme: Theme) {
        const resolved = theme === Theme.System ? this.getSystemTheme() : theme;
        document.documentElement.setAttribute('data-theme', resolved === Theme.Dark ? 'dark' : 'light');
    }

    /**
     * Sets a new theme and persists it. If switching between `System` and fixed themes,
     * this method also attaches or detaches the media-query listener.
     *
     * @param theme The theme to apply
     * @returns Observable completing when theme is applied and stored
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

    /**
     * Loads the theme from persistent storage and applies it.
     * Also ensures the media-query listener is active only when `Theme.System` is used.
     *
     * @returns Observable completing when theme is loaded and applied
     */
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

    /**
     * Listens for external changes to persistent storage (e.g. changes from another browser tab or extension context),
     * and re-applies the theme if necessary.
     */
    private listenForExternalStorageChanges() {
        if (!this.chromeAvailable) return;

        (window as any).chrome.storage.onChanged?.addListener(
            (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
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
            }
        );
    }
}
