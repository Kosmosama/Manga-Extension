import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { provideTransloco, TRANSLOCO_MISSING_HANDLER } from '@jsverse/transloco';
import { routes } from './app.routes';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/language/language.service';
import { TranslocoHttpLoader } from './core/language/transloco-loader';
import { CollectMissingHandler } from './shared/i18n/collect-missing.handler';
import { translocoConfig } from './core/language/transloco.config';
import { ShortcutService } from './core/shortcut/shortcut.service';
import { CaptureService } from './core/capture/capture.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
        provideHttpClient(),

        provideTransloco({
            config: translocoConfig,
            loader: TranslocoHttpLoader,
        }),
        {
            provide: TRANSLOCO_MISSING_HANDLER,
            useClass: CollectMissingHandler,
        },

        provideAppInitializer(() => {
            inject(ThemeService);
            inject(LanguageService).init();
            inject(ShortcutService);
            inject(CaptureService);
        }),
    ],
};