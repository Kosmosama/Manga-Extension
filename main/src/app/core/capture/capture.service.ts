import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { CaptureSettings } from './capture.type';

const STORAGE_KEY = 'capture';

@Injectable({ providedIn: 'root' })
export class CaptureService {
    private storage = inject(StorageService);

    private stateSignal = signal<CaptureSettings>({
        autoCapture: false,
        captureQuality: 'medium',
        includeMetadata: true,
    });

    state = computed(() => this.stateSignal());

    constructor() {
        const stored = this.storage.get<CaptureSettings>(STORAGE_KEY, this.stateSignal());
        this.stateSignal.set(stored);
    }

    setAutoCapture(value: boolean) {
        this.stateSignal.set({ ...this.stateSignal(), autoCapture: value });
        this.persist();
    }

    setCaptureQuality(value: 'low' | 'medium' | 'high') {
        this.stateSignal.set({ ...this.stateSignal(), captureQuality: value });
        this.persist();
    }

    setIncludeMetadata(value: boolean) {
        this.stateSignal.set({ ...this.stateSignal(), includeMetadata: value });
        this.persist();
    }

    private persist() {
        this.storage.set(STORAGE_KEY, this.stateSignal());
    }
}