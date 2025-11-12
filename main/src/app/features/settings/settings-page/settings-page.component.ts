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
    styleUrl: './settings-page.component.css',
})
export class SettingsPageComponent {
    private themeService = inject(ThemeService);

    settings = inject(SettingsService);
    theme = signal<Theme>(this.themeService.theme);

    /**
     * Handles theme selection changes from the dropdown menu.
     * Updates the theme both locally and in the ThemeService.
     * @param event The change event from the select element.
     */
    themeChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        const value = target.value as 'light' | 'dark' | 'system';
        const theme =
            value === 'light' ? Theme.Light : value === 'dark' ? Theme.Dark : Theme.System;

        const result: any = (this.themeService as any).setTheme(theme);
        if (result && typeof result.subscribe === 'function') {
            result.subscribe(() => this.theme.set(theme));
        } else {
            this.theme.set(theme);
        }
    }

    /**
     * Handles language selection changes.
     * Passes the selected language to the SettingsService.
     * @param event The change event from the select element.
     */
    languageChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        this.settings.changeLanguage(target.value);
    }

    /**
     * Toggles whether the search input should automatically gain focus.
     * @param event The toggle event from the checkbox input.
     */
    onToggleFocus(event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        this.settings.toggleFocusSearchInput(checked);
    }
}
