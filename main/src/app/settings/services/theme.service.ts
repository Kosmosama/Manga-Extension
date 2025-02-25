import { Injectable } from '@angular/core';
import { Manga } from '../../shared/interfaces/manga.interface';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {

    constructor() {
        this.applyInitialTheme();
    }

    /**
     * Loads the theme preference from Chrome storage or defaults to "system".
     * @returns {Promise<string>} - The selected theme ("light", "dark", or "system").
     */
    private loadTheme(): Promise<string> {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get("theme", (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result["theme"] || "system"); // Fix applied here
                }
            });
        });
    }

    /**
     * Applies the selected theme by toggling the "dark" class.
     * @param {string} theme - The selected theme ("light", "dark", or "system").
     */
    private applyTheme(theme: string): void {
        const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.classList.toggle("dark", isDarkMode);
    }

    /**
     * Loads and applies the theme preference before the application initializes.
     */
    private applyInitialTheme(): void {
        this.loadTheme()
            .then((theme) => this.applyTheme(theme))
            .catch(console.error);
    }

    private getTheme(): string {
        return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }

    setFallbackImage(manga: Manga): void {
        manga.image = this.getTheme() === 'dark' ? 'public/fallback-images/dark-mode-fallback.png' : 'public/fallback-images/light-mode-fallback.png';
    }

}
