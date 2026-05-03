import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { SettingsStorageService } from './settings-storage.service';
import { ThemeMode } from '../interfaces/settings.model';

const THEME_CLASS_LIGHT = 'theme-light';
const THEME_CLASS_DARK = 'theme-dark';

/**
 * Single theme API for the app: reads/writes `themeMode` via {@link SettingsStorageService},
 * resolves `system` against `prefers-color-scheme`, and keeps DOM (`data-theme` + legacy classes) in sync.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly storage = inject(SettingsStorageService);

    private readonly systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    private readonly storedMode = signal<ThemeMode>(this.storage.themeMode());

    /** Stored user preference: `light` | `dark` | `system`. */
    readonly mode = computed(() => this.storedMode());

    /** Resolved `light` | `dark` for UI, covers, and CSS. */
    readonly effectiveMode = computed(() => {
        const m = this.storedMode();
        if (m === 'system') {
            return this.systemDarkQuery.matches ? 'dark' : 'light';
        }
        return m;
    });

    constructor() {
        effect(() => {
            const storedMode = this.storage.themeMode();
            if (storedMode !== this.storedMode()) {
                this.storedMode.set(storedMode);
            }
        });

        this.systemDarkQuery.addEventListener('change', () => {
            if (this.storedMode() === 'system') {
                this.applyDom(this.effectiveMode());
            }
        });

        effect(() => {
            this.applyDom(this.effectiveMode());
        });
    }

    setMode(mode: ThemeMode): void {
        this.storedMode.set(mode);
        this.storage.updateSection('themeMode', mode);
    }

    /**
     * Re-sync from persisted settings and re-apply DOM (e.g. another extension view updated storage,
     * or shell wants to run after navigation).
     */
    applyTheme(): void {
        const fromStorage = this.storage.themeMode();
        if (fromStorage !== this.storedMode()) {
            this.storedMode.set(fromStorage);
        }
        this.applyDom(this.effectiveMode());
    }

    private applyDom(effective: 'light' | 'dark'): void {
        const root = document.documentElement;
        root.classList.remove(THEME_CLASS_LIGHT, THEME_CLASS_DARK);
        root.classList.add(effective === 'dark' ? THEME_CLASS_DARK : THEME_CLASS_LIGHT);
        root.setAttribute('data-theme', effective);
    }
}
