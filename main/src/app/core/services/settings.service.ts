import { inject, Injectable, signal } from '@angular/core';
import { TranslocoService, getBrowserLang } from '@jsverse/transloco';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private translocoService = inject(TranslocoService);

    private readonly STORAGE_KEY = 'preferredLanguage';
    private readonly FOCUS_SEARCH_INPUT_KEY = 'focusSearchInput';

    readonly focusSearchInput = signal(false);

    readonly languages = signal(this.translocoService.getAvailableLangs() as string[]);
    readonly activeLanguage = signal('');

    constructor() {
        // Initialize immediately when the service is created
        this.initializeLanguage();

        this.translocoService.langChanges$.subscribe(lang => {
            this.activeLanguage.set(lang);
        });

        this.initializeFocusSearchInput();
        this.listenForExternalStorageChanges();
    }

    private get chromeAvailable(): boolean {
        const anyWin = window as any;
        return typeof anyWin !== 'undefined' && !!anyWin.chrome?.storage?.local;
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

    private listenForExternalStorageChanges() {
        if (!this.chromeAvailable) return;

        (window as any).chrome.storage.onChanged?.addListener((changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
            if (areaName !== 'local') return;

            if (this.FOCUS_SEARCH_INPUT_KEY in changes) {
                const newVal = changes[this.FOCUS_SEARCH_INPUT_KEY].newValue;
                if (typeof newVal === 'boolean') {
                    this.focusSearchInput.set(newVal);
                }
            }
            if (this.STORAGE_KEY in changes) {
                const newLang = changes[this.STORAGE_KEY].newValue as string;
                if (newLang && this.languages().includes(newLang)) {
                    this.translocoService.setActiveLang(newLang);
                }
            }
        });
    }

    /**
     * Initialize the language based on the stored value, browser language or default language.
     */
    private async initializeLanguage() {
        const storedLang = await this.storageGet<string | null>(this.STORAGE_KEY, null);
        if (storedLang && this.languages().includes(storedLang)) {
            this.setLanguage(storedLang);
            return;
        }

        const browserLang = getBrowserLang() || '';
        if (this.languages().includes(browserLang)) {
            this.setLanguage(browserLang);
        } else {
            this.setLanguage(this.translocoService.getDefaultLang());
        }
    }

    /**
     * Change the language to the specified value.
     *
     * @param {string} value The language to change to.
     */
    changeLanguage(value: string) {
        if (this.languages().includes(value)) {
            this.setLanguage(value);
        }
        else {
            console.warn(`Language ${value} is not available.`);
        }
    }

    /**
     * Save the language to the storage and set it as active.
     * 
     * @param {string} lang The language to save.
     */
    private setLanguage(lang: string) {
        this.storageSet(this.STORAGE_KEY, lang);
        this.translocoService.setActiveLang(lang);
        this.activeLanguage.set(lang);
    }

    private async initializeFocusSearchInput(): Promise<void> {
        const storedValue = await this.storageGet<boolean>(this.FOCUS_SEARCH_INPUT_KEY, true);
        this.focusSearchInput.set(storedValue);
    }

    toggleFocusSearchInput(value: boolean) {
        this.storageSet(this.FOCUS_SEARCH_INPUT_KEY, value);
        this.focusSearchInput.set(value);
    }
}