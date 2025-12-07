import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/language/language.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'language-settings',
    standalone: true,
    imports: [TranslocoPipe],
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