import { inject, Injectable, signal } from '@angular/core';
import { Observable, defer } from 'rxjs';
import { Theme } from '../../core/interfaces/theme.interface';
import { SettingsStorageService } from './settings-storage.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private settingsStorageService = inject(SettingsStorageService);
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
     * Current theme preference.
     */
    get theme(): Theme {
        return this.themeSignal();
    }

    private getSystemTheme(): Theme {
        return this.mediaQuery.matches ? Theme.Dark : Theme.Light;
    }

    private applyThemeAttribute(theme: Theme) {
        const resolved = theme === Theme.System ? this.getSystemTheme() : theme;
        document.documentElement.setAttribute('data-theme', resolved === Theme.Dark ? 'dark' : 'light');
    }

    /**
     * Sets a new theme preference and persists to sync storage.
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

            this.settingsStorageService.setSync('theme', theme);
            subscriber.next();
            subscriber.complete();
        }));
    }

    /**
     * Loads stored theme preference from sync storage.
     */
    private loadTheme$(): Observable<void> {
        return defer(() => new Observable<void>(subscriber => {
            this.settingsStorageService.getSync$<'light' | 'dark' | 'system'>('theme', 'system').subscribe(stored => {
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
     * Re-applies theme on external sync storage change.
     */
    private listenForExternalStorageChanges() {
        const chromeObj = (window as any).chrome;
        if (!chromeObj?.storage?.onChanged) return;

        chromeObj.storage.onChanged.addListener(
            (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
                if (areaName !== 'sync') return;
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