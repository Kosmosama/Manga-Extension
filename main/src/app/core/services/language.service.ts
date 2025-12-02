import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { SettingsStorageService } from './settings-storage.service';

const LANGUAGE_KEY = 'app.language';
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'ja', 'zh', 'de', 'pt', 'ru', 'it'];

@Injectable({ providedIn: 'root' })
export class LanguageService {
    private readonly storage = inject(SettingsStorageService);

    private readonly current = signal(this.initializeLanguage());

    readonly language = computed(() => this.current());

    constructor() {
        effect(() => {
            const lang = this.current();
            localStorage.setItem(LANGUAGE_KEY, lang);
            // #TODO: TranslocoService injection here
            // ex: (once TranslocoService available):
            // this.translocoService.setActiveLang(lang);
        });
    }

    /**
     * Initializes the language setting by checking `localStorage` and system preferences.
     * 
     * @returns The language code to be used (e.g., 'en', 'es', etc.)
     */
    private initializeLanguage(): string {
        const stored = localStorage.getItem(LANGUAGE_KEY);
        if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
            this.storage.update({ language: stored });
            return stored;
        }
        const sys = this.getSystemLanguage();
        if (sys) {
            this.storage.update({ language: sys });
            return sys;
        }
        this.storage.update({ language: 'en' });
        return 'en';
    }

    /**
     * Retrieves the system's language preference.
     * 
     * @returns The system language code if supported, `null` otherwise
     */
    private getSystemLanguage(): string | null {
        const navLang = navigator.language?.split('-')[0];
        if (navLang && SUPPORTED_LANGUAGES.includes(navLang)) {
            return navLang;
        }
        return null;
    }

    /**
     * Sets the current language and updates the settings.
     * 
     * @param lang - The language code to set (e.g., 'en', 'es', etc.)
     */
    setLanguage(lang: string) {
        if (!SUPPORTED_LANGUAGES.includes(lang)) return;
        this.current.set(lang);
        this.storage.updateSection('language', lang);
    }

    /**
     * Retrieves the list of supported languages.
     * 
     * @returns An array of supported language codes
     */
    getSupported(): string[] {
        return SUPPORTED_LANGUAGES.slice();
    }
}
