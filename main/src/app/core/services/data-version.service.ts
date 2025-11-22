import { Injectable, inject, signal } from '@angular/core';
import { Observable, defer } from 'rxjs';
import { SettingsStorageService } from './settings-storage.service';

@Injectable({ providedIn: 'root' })
export class DataVersionService {
    private settingsStorageService = inject(SettingsStorageService);
    private readonly VERSION_KEY = 'dataVersion';
    private readonly latestVersion = 1;
    private currentVersionSignal = signal<number>(0);

    /**
     * Observable initialization ensuring migrations run if needed.
     */
    init$(): Observable<void> {
        return defer(() => new Observable<void>(subscriber => {
            this.settingsStorageService.getLocal$(this.VERSION_KEY, 0).subscribe(storedVersion => {
                this.currentVersionSignal.set(storedVersion);
                if (storedVersion < this.latestVersion) {
                    this.runMigrations(storedVersion, this.latestVersion).subscribe({
                        next: () => {
                            this.settingsStorageService.setLocal(this.VERSION_KEY, this.latestVersion);
                            this.currentVersionSignal.set(this.latestVersion);
                        },
                        complete: () => {
                            subscriber.next();
                            subscriber.complete();
                        }
                    });
                } else {
                    subscriber.next();
                    subscriber.complete();
                }
            });
        }));
    }

    /**
     * Executes migrations sequentially from oldVersion+1 .. targetVersion.
     */
    private runMigrations(oldVersion: number, targetVersion: number): Observable<void> {
        return defer(() => new Observable<void>(subscriber => {
            // Placeholder: Add switch blocks for future versions.
            // v1: Initial stable schema – no transformation needed.
            // Example future:
            // if (oldVersion < 2) { /* transform data */ }
            subscriber.next();
            subscriber.complete();
        }));
    }

    /**
     * Current schema version.
     */
    get version(): number {
        return this.currentVersionSignal();
    }
}