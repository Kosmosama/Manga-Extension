import { TranslocoConfig, translocoConfig as baseConfig } from '@jsverse/transloco';
import { isDevMode } from '@angular/core';

export const translocoConfig: TranslocoConfig = baseConfig({
    availableLangs: ['en', 'es', 'de', 'fr', 'dev'],
    fallbackLang: 'en',
    defaultLang: 'en',
    reRenderOnLangChange: true,
    prodMode: !isDevMode(),
    missingHandler: {
        logMissingKey: isDevMode(),
        useFallbackTranslation: true,
        allowEmpty: false
    },
    scopes: {
        keepCasing: true
    }
});