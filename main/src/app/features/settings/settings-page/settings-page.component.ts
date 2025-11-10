import { Component, inject, signal } from '@angular/core';
import { Theme } from '../../../core/interfaces/theme.interface';
import { ThemeService } from '../../../core/services/theme.service';
import { SettingsService } from '../../../core/services/settings.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-settings-page',
    standalone: true,
    imports: [TranslocoPipe],
    templateUrl: './settings-page.component.html',
    styleUrl: './settings-page.component.css'
})
export class SettingsPageComponent {
    private themeService = inject(ThemeService);
    settings = inject(SettingsService);

    theme = signal<Theme>(this.themeService.theme);

    themeChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        const value = target.value as 'light' | 'dark' | 'system';
        const theme = value === 'light'
            ? Theme.Light
            : value === 'dark'
                ? Theme.Dark
                : Theme.System;

        this.themeService.setTheme(theme);
        this.theme.set(theme);
    }

    languageChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        this.settings.changeLanguage(target.value);
    }

    onToggleFocus(event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        this.settings.toggleFocusSearchInput(checked);
    }
}