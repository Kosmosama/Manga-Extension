import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
    private namespace = 'manga-ext';

    setNamespace(ns: string) {
        this.namespace = ns;
    }

    get<T>(key: string, fallback: T): T {
        try {
            const raw = localStorage.getItem(`${this.namespace}:${key}`);
            if (!raw) return fallback;
            return JSON.parse(raw) as T;
        } catch {
            return fallback;
        }
    }

    set<T>(key: string, value: T) {
        try {
            localStorage.setItem(`${this.namespace}:${key}`, JSON.stringify(value));
        } catch {
        }
    }

    remove(key: string) {
        localStorage.removeItem(`${this.namespace}:${key}`);
    }
}