import { Injectable, signal } from '@angular/core';
import { Observable, defer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsStorageService {
    private syncAvailable = typeof (window as any).chrome?.storage?.sync !== 'undefined';
    private localAvailable = typeof (window as any).chrome?.storage?.local !== 'undefined';

    /**
     * Reads a key from sync storage (or localStorage fallback) as Observable.
     */
    getSync<T>(key: string, fallback: T): Observable<T> {
        return defer(() => new Observable<T>(subscriber => {
            if (this.syncAvailable) {
                (window as any).chrome.storage.sync.get(key, (result: Record<string, T>) => {
                    subscriber.next(result?.[key] ?? fallback);
                    subscriber.complete();
                });
            } else {
                try {
                    const raw = localStorage.getItem(`sync:${key}`);
                    subscriber.next(raw ? JSON.parse(raw) as T : fallback);
                } catch {
                    subscriber.next(fallback);
                } finally {
                    subscriber.complete();
                }
            }
        }));
    }

    /**
     * Writes a value to sync storage (or localStorage fallback).
     */
    setSync<T>(key: string, value: T): void {
        if (this.syncAvailable) {
            (window as any).chrome.storage.sync.set({ [key]: value });
        }
        try {
            localStorage.setItem(`sync:${key}`, JSON.stringify(value));
        } catch {
            // ignore
        }
    }

    /**
     * Reads a key from local storage (extension local or localStorage) as Observable.
     */
    getLocal$<T>(key: string, fallback: T): Observable<T> {
        return defer(() => new Observable<T>(subscriber => {
            if (this.localAvailable) {
                (window as any).chrome.storage.local.get(key, (result: Record<string, T>) => {
                    subscriber.next(result?.[key] ?? fallback);
                    subscriber.complete();
                });
            } else {
                try {
                    const raw = localStorage.getItem(`local:${key}`);
                    subscriber.next(raw ? JSON.parse(raw) as T : fallback);
                } catch {
                    subscriber.next(fallback);
                } finally {
                    subscriber.complete();
                }
            }
        }));
    }

    /**
     * Writes a value to local storage (extension local or localStorage).
     */
    setLocal<T>(key: string, value: T): void {
        if (this.localAvailable) {
            (window as any).chrome.storage.local.set({ [key]: value });
        }
        try {
            localStorage.setItem(`local:${key}`, JSON.stringify(value));
        } catch {
        }
    }
}