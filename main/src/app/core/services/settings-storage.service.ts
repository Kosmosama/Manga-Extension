import { computed, effect, Injectable, signal } from '@angular/core';
import { AppSettings, DEFAULT_SETTINGS, SETTINGS_VERSION } from '../interfaces/settings.model';

const LOCAL_STORAGE_KEY = 'app.settings';

@Injectable({
    providedIn: 'root'
})
export class SettingsStorageService {
    private readonly raw = signal<AppSettings>(this.loadInitial());

    readonly settings = computed(() => this.raw());
    readonly language = computed(() => this.raw().language);
    readonly themeMode = computed(() => this.raw().themeMode);
    readonly shortcuts = computed(() => this.raw().shortcuts);
    readonly capture = computed(() => this.raw().capture);

    constructor() {
        effect(() => {
            const value = this.raw();
            this.persist(value);
        });
    }

    /**
     * Loads the initial settings from `localStorage`.
     * 
     * @returns The initial settings object, or default settings if none exist or are invalid
     */
    private loadInitial(): AppSettings {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!stored) return DEFAULT_SETTINGS;
            const parsed = JSON.parse(stored) as AppSettings;
            if (parsed.version !== SETTINGS_VERSION) {
                return this.migrate(parsed);
            }
            return { ...DEFAULT_SETTINGS, ...parsed };
        } catch {
            return DEFAULT_SETTINGS;
        }
    }

    /**
     * Migrates old settings to the current version format.
     * 
     * @param old - The old settings to be migrated
     * @returns The migrated settings object
     */
    private migrate(old: AppSettings): AppSettings {
        // Placeholder for migration logic between versions.
        return {
            ...DEFAULT_SETTINGS,
            ...old,
            version: SETTINGS_VERSION
        };
    }

    /**
     * Persists the current settings to `localStorage`.
     * 
     * @param value - The settings object to persist
     */
    private persist(value: AppSettings) {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
        } catch {
            // Silent fail
        }
    }

    /**
     * Updates the settings with a partial set of new values.
     * 
     * @param partial - The partial settings to update
     */
    update(partial: Partial<AppSettings>) {
        this.raw.set({
            ...this.raw(),
            ...partial
        });
    }

    /**
     * Updates a specific section of the settings.
     * 
     * @param section - The section of the settings to update
     * @param value - The new value for the section
     */
    updateSection<K extends keyof AppSettings>(section: K, value: AppSettings[K]) {
        this.raw.set({
            ...this.raw(),
            [section]: value
        });
    }
}
