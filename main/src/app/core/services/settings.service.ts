import { inject, Injectable, signal } from '@angular/core';
import { TranslocoService, getBrowserLang } from '@jsverse/transloco';
import { Observable, defer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
    private translocoService = inject(TranslocoService);

    private readonly STORAGE_KEY = 'preferredLanguage';
    private readonly FOCUS_SEARCH_INPUT_KEY = 'focusSearchInput';

    readonly focusSearchInput = signal(false);
    readonly languages = signal(this.translocoService.getAvailableLangs() as string[]);
    readonly activeLanguage = signal<string>('');

    constructor() {
        this.translocoService.langChanges$.subscribe(lang => {
            this.activeLanguage.set(lang);
        });

        this.initializeLanguage$().subscribe();
        this.initializeFocusSearchInput$().subscribe();
        this.listenForExternalStorageChanges();
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
        } else {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch {
            }
        }
    }

    private listenForExternalStorageChanges() {
        if (!this.chromeAvailable) return;
        (window as any).chrome.storage.onChanged.addListener((changes: any, areaName: string) => {
            if (areaName !== 'local') return;
            if (changes[this.STORAGE_KEY]?.newValue && changes[this.STORAGE_KEY].newValue !== this.activeLanguage()) {
                const newLang = changes[this.STORAGE_KEY].newValue;
                if (this.languages().includes(newLang)) {
                    this.translocoService.setActiveLang(newLang);
                }
            }
            if (changes[this.FOCUS_SEARCH_INPUT_KEY]?.newValue !== undefined &&
                changes[this.FOCUS_SEARCH_INPUT_KEY].newValue !== this.focusSearchInput()) {
                this.focusSearchInput.set(changes[this.FOCUS_SEARCH_INPUT_KEY].newValue);
            }
        });
    }

    private initializeLanguage$(): Observable<void> {
        return defer(() => new Observable<void>(subscriber => {
            this.storageGet$<string | null>(this.STORAGE_KEY, null).subscribe(storedLang => {
                if (storedLang && this.languages().includes(storedLang)) {
                    this.setLanguage(storedLang);
                    subscriber.next(); subscriber.complete(); return;
                }

                const browserLang = getBrowserLang() || '';
                if (this.languages().includes(browserLang)) {
                    this.setLanguage(browserLang);
                } else {
                    this.setLanguage(this.translocoService.getDefaultLang());
                }
                subscriber.next(); subscriber.complete();
            });
        }));
    }

    private initializeFocusSearchInput$(): Observable<void> {
        return defer(() => new Observable<void>(subscriber => {
            this.storageGet$<boolean>(this.FOCUS_SEARCH_INPUT_KEY, true).subscribe(value => {
                this.focusSearchInput.set(value);
                subscriber.next(); subscriber.complete();
            });
        }));
    }

    changeLanguage(value: string) {
        if (this.languages().includes(value)) {
            this.setLanguage(value);
        } else {
            console.warn(`Language ${value} is not available.`);
        }
    }

    private setLanguage(lang: string) {
        this.storageSet(this.STORAGE_KEY, lang);
        this.translocoService.setActiveLang(lang);
        this.activeLanguage.set(lang);
    }

    toggleFocusSearchInput(value: boolean) {
        this.storageSet(this.FOCUS_SEARCH_INPUT_KEY, value);
        this.focusSearchInput.set(value);
    }
}