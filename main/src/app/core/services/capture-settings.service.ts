import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { SettingsStorageService } from './settings-storage.service';
import { CaptureSettings } from '../interfaces/settings.model';
import { CaptureFeatureFlagsService } from './capture-feature-flags.service';
import { QuickCaptureMangaService } from './quick-capture-manga.service';
import { Observable, of } from 'rxjs';
import { QuickCaptureListenerService } from './quick-capture-listener.sevice';

@Injectable({ providedIn: 'root' })
export class CaptureSettingsService {
    private readonly storage = inject(SettingsStorageService);
    private readonly featureFlags = inject(CaptureFeatureFlagsService);
    private readonly quickListener = inject(QuickCaptureListenerService);
    private readonly quickManga = inject(QuickCaptureMangaService);

    private readonly capture = signal<CaptureSettings>(this.storage.capture());

    readonly settings = computed(() => this.capture());

    constructor() {
        effect(() => {
            const latest = this.storage.capture();
            if (latest !== this.capture()) {
                this.capture.set(latest);
                this.syncToFeatureFlags(latest);
            }
        });
    }

    private syncToFeatureFlags(settings: CaptureSettings) {
        this.featureFlags.setEnabled(settings.enabled);
        this.quickListener.setActive(settings.quickCaptureEnabled);
    }

    update(partial: Partial<CaptureSettings>) {
        const merged = { ...this.capture(), ...partial };
        this.capture.set(merged);
        this.storage.updateSection('capture', merged);
        this.syncToFeatureFlags(merged);
    }

    toObservable(): Observable<CaptureSettings> {
        return of(this.capture());
    }
}