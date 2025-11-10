import { Injectable, inject, isDevMode } from '@angular/core';
import { TranslocoMissingHandler, TranslocoMissingHandlerData, TranslocoService, HashMap } from '@jsverse/transloco';
import { MissingKeysService } from './missing-keys.service';

@Injectable({ providedIn: 'root' })
export class CollectMissingHandler implements TranslocoMissingHandler {
    private missingKeysService = inject(MissingKeysService);
    private translocoService = inject(TranslocoService);
    private dev = isDevMode();

    handle(key: string, data: TranslocoMissingHandlerData, params?: HashMap): any {
        if (this.dev) {
            const activeLang = this.translocoService.getActiveLang();
            this.missingKeysService.track(key, activeLang);
        }
        return key;
    }
}