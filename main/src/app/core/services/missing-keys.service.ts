import { Injectable, signal } from '@angular/core';

export interface MissingKeyRecord {
    key: string;
    lang: string;
    timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class MissingKeysService {
    private _missing = signal<MissingKeyRecord[]>([]);

    missingKeys = this._missing;

    /**
     * Tracks a missing translation key for a specific language if not already recorded.
     *
     * @param key The translation key that was not found
     * @param lang The language in which the key was missing
     */
    track(key: string, lang: string): void {
        const exists = this._missing().some(r => r.key === key && r.lang === lang);
        if (!exists) {
            this._missing.update(list => [...list, { key, lang, timestamp: Date.now() }]);
        }
    }

    /**
     * Clears all stored missing translation records.
     */
    clear(): void {
        this._missing.set([]);
    }
}
