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

    /**
     * Opens a confirmation request and returns an observable that
     * resolves with `true` if confirmed or `false` if canceled.
     *
     * @param titleKey Translation key for the dialog title
     * @param messageKey Translation key for the dialog message
     * @param params Optional translation interpolation params
     * @param confirmKey Optional confirm action label key
     * @param cancelKey Optional cancel action label key
     * @returns Observable boolean indicating user's final choice
     */
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

    /**
     * Resolves the current confirmation flow and emits the result.
     * Once delivered, the request is cleared.
     *
     * @param result User's confirmation result (`true` or `false`)
     */
    resolve(result: boolean): void {
        const req = this._request();
        if (req) {
            req.subject.next(result);
            req.subject.complete();
            this._request.set(null);
        }
    }

    /**
     * Convenience method to cancel the pending confirmation.
     * Emits `false` as the user decision.
     */
    cancel(): void {
        this.resolve(false);
    }
}
