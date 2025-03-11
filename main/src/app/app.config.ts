import { ApplicationConfig, inject, provideAppInitializer, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { ThemeService } from './core/services/theme.service'; 

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
        provideAppInitializer(() => {
            inject(ThemeService);
        })
    ]
};
