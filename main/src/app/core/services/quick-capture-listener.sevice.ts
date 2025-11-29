import { Injectable, inject } from '@angular/core';
import { CaptureMessagingService } from './capture-messaging.service';
import { QuickCaptureMangaService } from './quick-capture-manga.service';
import { ToastService } from './toast.service';
import { SettingsStorageService } from './settings-storage.service';
import { Observable, defer } from 'rxjs';

/**
 * Listens to forwarded quick capture messages and persists if capture enabled.
 */
@Injectable({ providedIn: 'root' })
export class QuickCaptureListenerService {
    private captureMessagingService = inject(CaptureMessagingService);
    private quickCaptureMangaService = inject(QuickCaptureMangaService);
    private toastService = inject(ToastService);
    private settingsStorageService = inject(SettingsStorageService);

    private get captureEnabled$(): Observable<boolean> {
        return this.settingsStorageService.getSync<boolean>('captureFlags.enabled', false);
    }

    init$(): Observable<void> {
        return defer(() => new Observable<void>(subscriber => {
            this.captureMessagingService.listen$().subscribe(message => {
                if (message?.type === 'quickCaptureForward') {
                    this.captureEnabled$.subscribe(enabled => {
                        if (!enabled) return;
                        const payload = message.payload;
                        if (!payload?.title) return;
                        this.quickCaptureMangaService.quickAdd$({
                            title: payload.title,
                            link: payload.link
                        }).subscribe({
                            next: () => this.toastService.success('toasts.manga.quickCaptured', { title: payload.title })
                        });
                    });
                }
            });
            subscriber.next();
            subscriber.complete();
        }));
    }
}