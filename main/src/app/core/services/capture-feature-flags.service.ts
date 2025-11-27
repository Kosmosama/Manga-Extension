import { Injectable, inject, signal } from '@angular/core';
import { SettingsStorageService } from './settings-storage.service';
import { Observable, defer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CaptureFeatureFlagsService {
    private settingsStorageService = inject(SettingsStorageService);
    private readonly KEY = 'captureFlags';

    private flagsSignal = signal<{
        enabled: boolean;
        quickCaptureEnabled: boolean;
        fabEnabled: boolean;
    }>({
        enabled: false,
        quickCaptureEnabled: true,
        fabEnabled: true
    });

    init$(): Observable<void> {
        return defer(() => new Observable<void>(subscriber => {
            this.settingsStorageService.getSync(this.KEY, this.flagsSignal()).subscribe(stored => {
                this.flagsSignal.set(stored);
                subscriber.next();
                subscriber.complete();
            });
        }));
    }

    private save() {
        this.settingsStorageService.setSync(this.KEY, this.flagsSignal());
    }

    flags() {
        return this.flagsSignal();
    }

    setEnabled(v: boolean) {
        this.flagsSignal.update(f => ({ ...f, enabled: v }));
        this.save();
    }

    setQuickCapture(v: boolean) {
        this.flagsSignal.update(f => ({ ...f, quickCaptureEnabled: v }));
        this.save();
    }

    setFabEnabled(v: boolean) {
        this.flagsSignal.update(f => ({ ...f, fabEnabled: v }));
        this.save();
    }
}