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

    /**
     * Indicates whether Chrome extension storage APIs are available.
     */
    private get chromeAvailable(): boolean {
        const anyWin = window as any;
        return typeof anyWin !== 'undefined' && !!anyWin.chrome?.storage?.local;
    }

    /**
     * Retrieves a value from storage or returns the fallback.
     *
     * @typeParam T The expected stored value type
     * @param key Storage key
     * @param fallback Value returned if the key is missing or inaccessible
     * @returns Observable emitting the retrieved value
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
     * Stores a value locally or in Chrome extension storage.
     *
     * @typeParam T The type of value to store
     * @param key Storage key
     * @param value Value to store
     */
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

    /**
     * Listens for changes in external storage (e.g., another browser tab)
     * and synchronizes relevant settings into the application.
     */
    private listenForExternalStorageChanges(): void {
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

    /**
     * Initializes stored or fallback language at startup.
     *
     * @returns Observable emitting when initialization is complete
     */
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

    /**
     * Initializes stored setting determining whether search input should auto-focus.
     *
     * @returns Observable emitting when initialization is complete
     */
    private initializeFocusSearchInput$(): Observable<void> {
        return defer(() => new Observable<void>(subscriber => {
            this.storageGet$<boolean>(this.FOCUS_SEARCH_INPUT_KEY, true).subscribe(value => {
                this.focusSearchInput.set(value);
                subscriber.next(); subscriber.complete();
            });
        }));
    }

    /**
     * Changes the application's active language if valid.
     *
     * @param value New language code
     */
    changeLanguage(value: string): void {
        if (this.languages().includes(value)) {
            this.setLanguage(value);
        } else {
            console.warn(`Language ${value} is not available.`);
        }
    }

    /**
     * Applies the new language by updating storage, the localization service,
     * and the reactive signal.
     *
     * @param lang Language code to activate
     */
    private setLanguage(lang: string): void {
        this.storageSet(this.STORAGE_KEY, lang);
        this.translocoService.setActiveLang(lang);
        this.activeLanguage.set(lang);
    }

    /**
     * Updates whether the search input should auto-focus and persists the value.
     *
     * @param value Whether to enable auto-focus
     */
    toggleFocusSearchInput(value: boolean): void {
        this.storageSet(this.FOCUS_SEARCH_INPUT_KEY, value);
        this.focusSearchInput.set(value);
    }
}
