import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { SettingsStorageService } from './settings-storage.service';
import { ThemeMode } from '../interfaces/settings.model';

const THEME_CLASS_LIGHT = 'theme-light';
const THEME_CLASS_DARK = 'theme-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly storage = inject(SettingsStorageService);

    private readonly systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    private readonly mode = signal<ThemeMode>(this.storage.themeMode());
    readonly effectiveMode = computed(() => {
        const m = this.mode();
        if (m === 'system') {
            return this.systemDarkQuery.matches ? 'dark' : 'light';
        }
        return m;
    });

    constructor() {
        effect(() => {
            const storedMode = this.storage.themeMode();
            if (storedMode !== this.mode()) {
                this.mode.set(storedMode);
            }
        });

        this.systemDarkQuery.addEventListener('change', () => {
            if (this.mode() === 'system') {
                this.applyThemeClass(this.effectiveMode());
            }
        });

        effect(() => {
            const eff = this.effectiveMode();
            this.applyThemeClass(eff);
        });
    }

    /**
     * Sets the theme mode to a specific value and updates the settings.
     * 
     * @param mode - The theme mode to set (e.g., 'light', 'dark', 'system')
     */
    setMode(mode: ThemeMode) {
        this.mode.set(mode);
        this.storage.updateSection('themeMode', mode);
    }

    /**
     * Applies the appropriate theme class (`theme-light` or `theme-dark`) to the document root.
     * 
     * @param effective - The effective theme mode to apply ('light' or 'dark')
     */
    private applyThemeClass(effective: 'light' | 'dark') {
        const root = document.documentElement;
        root.classList.remove(THEME_CLASS_LIGHT, THEME_CLASS_DARK);
        root.classList.add(effective === 'dark' ? THEME_CLASS_DARK : THEME_CLASS_LIGHT);
    }
}
