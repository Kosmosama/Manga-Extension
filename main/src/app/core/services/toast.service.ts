import { Injectable, signal } from '@angular/core';
import { ToastType } from '../interfaces/toast-item.interface';

export interface ToastItem {
    id: number;
    type: ToastType;
    key: string;            // transloco key
    params?: Record<string, unknown>;
    durationMs: number;
    createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private _toasts = signal<ToastItem[]>([]);
    toasts = this._toasts;

    private nextId = 1;

    /**
     * Displays a toast message and schedules its removal.
     *
     * @param type The visual type of toast to display (e.g. success, error, info, warning)
     * @param key Transloco translation key for the toast message
     * @param params Optional parameters for the translation
     * @param durationMs Duration in milliseconds before the toast auto-dismisses
     */
    show(type: ToastType, key: string, params?: Record<string, unknown>, durationMs = 3000) {
        const item: ToastItem = {
            id: this.nextId++,
            type,
            key,
            params,
            durationMs,
            createdAt: Date.now()
        };
        this._toasts.update(list => [item, ...list]);
        setTimeout(() => this.dismiss(item.id), durationMs);
    }

    /**
     * Convenience helper to show a success toast.
     *
     * @param key Transloco translation key
     * @param params Optional translation parameters
     * @param durationMs Duration before auto-dismiss
     */
    success(key: string, params?: Record<string, unknown>, durationMs = 2500) {
        this.show('success', key, params, durationMs);
    }

    /**
     * Convenience helper to show an error toast.
     *
     * @param key Transloco translation key
     * @param params Optional translation parameters
     * @param durationMs Duration before auto-dismiss
     */
    error(key: string, params?: Record<string, unknown>, durationMs = 3500) {
        this.show('error', key, params, durationMs);
    }

    /**
     * Convenience helper to show an info toast.
     *
     * @param key Transloco translation key
     * @param params Optional translation parameters
     * @param durationMs Duration before auto-dismiss
     */
    info(key: string, params?: Record<string, unknown>, durationMs = 2500) {
        this.show('info', key, params, durationMs);
    }

    /**
     * Convenience helper to show a warning toast.
     *
     * @param key Transloco translation key
     * @param params Optional translation parameters
     * @param durationMs Duration before auto-dismiss
     */
    warning(key: string, params?: Record<string, unknown>, durationMs = 3000) {
        this.show('warning', key, params, durationMs);
    }

    /**
     * Removes a specific toast by ID.
     *
     * @param id ID of the toast to remove
     */
    dismiss(id: number) {
        this._toasts.update(list => list.filter(t => t.id !== id));
    }

    /**
     * Clears all existing toasts.
     */
    clear() {
        this._toasts.set([]);
    }
}
