import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MissingKeysService {
    private readonly keysSet = new Set<string>();
    readonly keys = signal<string[]>([]);

    report(key: string) {
        if (!this.keysSet.has(key)) {
            this.keysSet.add(key);
            this.keys.set([...this.keysSet.values()].sort());
        }
    }

    clear() {
        this.keysSet.clear();
        this.keys.set([]);
    }
}