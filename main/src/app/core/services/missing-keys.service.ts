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

    track(key: string, lang: string) {
        const exists = this._missing().some(r => r.key === key && r.lang === lang);
        if (!exists) {
            this._missing.update(list => [...list, { key, lang, timestamp: Date.now() }]);
        }
    }

    clear() {
        this._missing.set([]);
    }
}