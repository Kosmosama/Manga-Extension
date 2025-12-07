import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/theme/theme.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-theme-settings',
    standalone: true,
    imports: [TranslocoPipe],
    templateUrl: './theme-settings.component.html',
    styleUrls: ['./theme-settings.component.css'],
})
export class ThemeSettingsComponent {
    private themeService = inject(ThemeService);
    mode = this.themeService.mode;

    onChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value as 'light' | 'dark' | 'system';
        this.themeService.setMode(value);
    }
}