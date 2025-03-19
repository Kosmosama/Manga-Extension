import { ApplicationConfig, inject, provideAppInitializer, provideExperimentalZonelessChangeDetection, isDevMode } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { ThemeService } from './core/services/theme.service';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import { SettingsService } from './core/services/settings.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
        provideHttpClient(), 
        provideTransloco({
            config: {
                availableLangs: ['en', 'es'],
                fallbackLang: 'en',
                defaultLang: 'en',
                reRenderOnLangChange: true,
                prodMode: !isDevMode(),
                missingHandler: {
                    allowEmpty: false,
                    useFallbackTranslation: true,
                    logMissingKey: true, //#TODO Change to false in production
                },
                scopes: {
                    keepCasing: true,
                }
            },
            loader: TranslocoHttpLoader
        }),
        provideAppInitializer(() => {
            inject(ThemeService);
            inject(SettingsService);
        })
    ]
};
