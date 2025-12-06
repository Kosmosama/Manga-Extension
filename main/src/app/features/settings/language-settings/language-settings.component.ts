import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/language/language.service';

@Component({
    selector: 'app-language-settings',
    standalone: true,
    templateUrl: './language-settings.component.html',
    styleUrls: ['./language-settings.component.css'],
})
export class LanguageSettingsComponent {
    private languageService = inject(LanguageService);

    current = this.languageService.current;
    available = () => this.languageService.getAvailable();

    onChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value as any;
        this.languageService.setLanguage(value);
    }
}