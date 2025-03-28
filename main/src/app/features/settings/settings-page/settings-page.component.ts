import { Component, inject, signal } from '@angular/core';
import { Theme } from '../../../core/interfaces/theme.interface';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
    selector: 'app-settings-page',
    imports: [],
    templateUrl: './settings-page.component.html',
    styleUrl: './settings-page.component.css'
})
export class SettingsPageComponent {
    private themeService = inject(ThemeService);

    theme = signal<Theme>(this.themeService.theme);

    themeChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        const theme = target.value === 'light' ? Theme.Light : Theme.Dark;
        this.themeService.setTheme(theme);
    }
}
