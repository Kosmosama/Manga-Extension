import { Injectable } from '@angular/core';
import { Observable, defer } from 'rxjs';

/**
 * Wraps chrome.runtime messaging for content-script <-> extension page communication.
 * Provides Observables for sending and listening.
 */
@Injectable({ providedIn: 'root' })
export class CaptureMessagingService {
    private get runtimeAvailable(): boolean {
        const anyWin = window as any;
        return !!anyWin.chrome?.runtime?.sendMessage;
    }

    sendMessage$(payload: any): Observable<void> {
        return defer(() => new Observable<void>(subscriber => {
            if (!this.runtimeAvailable) {
                subscriber.next();
                subscriber.complete();
                return;
            }
            (window as any).chrome.runtime.sendMessage(payload, () => {
                subscriber.next();
                subscriber.complete();
            });
        }));
    }

    /**
     * Subscribes to incoming messages (from content script).
     */
    listen$(): Observable<any> {
        return defer(() => new Observable<any>(subscriber => {
            if (!this.runtimeAvailable) {
                subscriber.complete();
                return;
            }
            const handler = (message: any) => subscriber.next(message);
            (window as any).chrome.runtime.onMessage.addListener(handler);
            return () => {
                (window as any).chrome.runtime.onMessage.removeListener(handler);
            };
        }));
    }
}