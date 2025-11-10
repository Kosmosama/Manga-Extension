import { ApplicationConfig, inject, provideAppInitializer, provideExperimentalZonelessChangeDetection, isDevMode } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { ThemeService } from './core/services/theme.service';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco, TRANSLOCO_MISSING_HANDLER } from '@jsverse/transloco';
import { SettingsService } from './core/services/settings.service';
import { CollectMissingHandler } from './shared/i18n/collect-missing.handler';

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
        provideHttpClient(),

        provideTransloco({
            config: {
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
            },
            loader: TranslocoHttpLoader
        }),
        {
            provide: TRANSLOCO_MISSING_HANDLER,
            useClass: CollectMissingHandler
        },
        provideAppInitializer(() => {
            inject(ThemeService);
            inject(SettingsService);
        })
    ]
};