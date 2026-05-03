import { Injectable, Injector, inject, isDevMode } from '@angular/core';
import { TranslocoMissingHandler, TranslocoMissingHandlerData, TranslocoService, HashMap } from '@jsverse/transloco';
import { MissingKeysService } from './missing-keys.service';

/** Avoid injecting TranslocoService here — it would cycle with Transloco init (NG0200). */
@Injectable({ providedIn: 'root' })
export class CollectMissingHandler implements TranslocoMissingHandler {
    private readonly injector = inject(Injector);
    private readonly missingKeysService = inject(MissingKeysService);
    private readonly dev = isDevMode();

    handle(key: string, data: TranslocoMissingHandlerData, params?: HashMap): any {
        if (this.dev) {
            const activeLang = this.injector.get(TranslocoService).getActiveLang();
            this.missingKeysService.track(key, activeLang);
        }
        return key;
    }
}