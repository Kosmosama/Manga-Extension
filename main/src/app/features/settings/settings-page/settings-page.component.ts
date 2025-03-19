import { Component, inject } from '@angular/core';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
    selector: 'app-settings-page',
    imports: [],
    templateUrl: './settings-page.component.html',
    styleUrl: './settings-page.component.css'
})
export class SettingsPageComponent {
    private settingsService = inject(SettingsService);

    languages = this.settingsService.languages;
    activeLanguage = this.settingsService.activeLanguage;

    onLanguageChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value;

        if (!value || value === this.activeLanguage()) {
            return;
        }

        this.settingsService.changeLanguage(value);
    }
}
