import { inject, Injectable, OnInit, signal } from '@angular/core';
import { TranslocoService, getBrowserLang } from '@jsverse/transloco';

@Injectable({
    providedIn: 'root'
})
export class SettingsService implements OnInit {
    private translocoService = inject(TranslocoService);
    private readonly STORAGE_KEY = 'preferredLanguage';
    private readonly FOCUS_SEARCH_INPUT_KEY = 'focusSearchInput';
    readonly focusSearchInput = signal(false);

    readonly languages = signal(this.translocoService.getAvailableLangs() as string[]);
    readonly activeLanguage = signal('');
    

    constructor() {
        console.log('SettingsService created');
    }

    ngOnInit() {
        this.initializeLanguage();

        this.translocoService.langChanges$.subscribe(lang => {
            this.activeLanguage.set(lang);
        });
        this.initializeFocusSearchInput();
        console.log(this.languages());
        console.log(this.activeLanguage());
    }

    /**
     * Initialize the language based on the stored value, browser language or default language.
     */
    private initializeLanguage() {
        chrome.storage.local.get(this.STORAGE_KEY, (result) => {
            const storedLang = result[this.STORAGE_KEY];
            if (storedLang && this.languages().includes(storedLang)) {
                this.setLanguage(storedLang);
            }
            else {
                const browserLang = getBrowserLang() || '';
                if (this.languages().includes(browserLang)) {
                    this.setLanguage(browserLang);
                }
                else {
                    this.setLanguage(this.translocoService.getDefaultLang());
                }
            }
        });
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
        chrome.storage.local.set({ [this.STORAGE_KEY]: lang }, () => {
            console.log(`Language saved: ${lang}`);
        });

        this.translocoService.setActiveLang(lang);
        this.activeLanguage.set(lang);
    }

    private initializeFocusSearchInput(): void {
        chrome.storage.local.get(this.FOCUS_SEARCH_INPUT_KEY, (result) => {
          const storedValue = result[this.FOCUS_SEARCH_INPUT_KEY] ?? true;
          
          this.focusSearchInput.set(storedValue);
          console.log(`Focus loaded: ${storedValue}`);
        });
    }

    toggleFocusSearchInput(value: boolean) {
        chrome.storage.local.set({ [this.FOCUS_SEARCH_INPUT_KEY]: value }, () => {
            console.log(`Focus saved: ${value}`);
        });

        this.focusSearchInput.set(value);
    }
}
