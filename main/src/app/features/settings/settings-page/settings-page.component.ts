import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageSettingsComponent } from '../language-settings/language-settings.component';

@Component({
    selector: 'app-settings-page',
    standalone: true,
    imports: [RouterLink, LanguageSettingsComponent, ThemeSettingsComponent, ShortcutSettingsComponent, CaptureSettingsComponent, ImportExportSettingsComponent],
    templateUrl: './settings-page.component.html',
    styleUrl: './settings-page.component.css'
})
export class SettingsPageComponent { }