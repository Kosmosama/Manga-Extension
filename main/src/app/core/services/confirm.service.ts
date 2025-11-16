import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmRequest {
    titleKey: string;
    messageKey: string;
    params?: Record<string, unknown>;
    confirmKey?: string;
    cancelKey?: string;
    subject: Subject<boolean>;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
    private _request = signal<ConfirmRequest | null>(null);
    request = this._request;

    confirm$(
        titleKey: string,
        messageKey: string,
        params?: Record<string, unknown>,
        confirmKey = 'common.delete',
        cancelKey = 'common.cancel'
    ): Observable<boolean> {
        const subject = new Subject<boolean>();
        this._request.set({ titleKey, messageKey, params, confirmKey, cancelKey, subject });
        return subject.asObservable();
    }

    resolve(result: boolean) {
        const req = this._request();
        if (req) {
            req.subject.next(result);
            req.subject.complete();
            this._request.set(null);
        }
    }

    cancel() {
        this.resolve(false);
    }
}