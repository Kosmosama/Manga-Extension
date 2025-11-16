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

    success(key: string, params?: Record<string, unknown>, durationMs = 2500) {
        this.show('success', key, params, durationMs);
    }
    error(key: string, params?: Record<string, unknown>, durationMs = 3500) {
        this.show('error', key, params, durationMs);
    }
    info(key: string, params?: Record<string, unknown>, durationMs = 2500) {
        this.show('info', key, params, durationMs);
    }
    warning(key: string, params?: Record<string, unknown>, durationMs = 3000) {
        this.show('warning', key, params, durationMs);
    }

    dismiss(id: number) {
        this._toasts.update(list => list.filter(t => t.id !== id));
    }

    clear() {
        this._toasts.set([]);
    }
}