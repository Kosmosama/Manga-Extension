import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { CaptureSettingsComponent } from '../capture-settings/capture-settings.component';
import { ImportExportSettingsComponent } from '../import-export-settings/import-export-settings.component';
import { LanguageSettingsComponent } from '../language-settings/language-settings.component';
import { ShortcutSettingsComponent } from '../shortcut-settings/shortcut-settings.component';
import { ThemeSettingsComponent } from '../theme-settings/theme-settings.component';

@Component({
    selector: 'app-settings-page',
    standalone: true,
    imports: [
        RouterLink,
        TranslocoPipe,
        LanguageSettingsComponent,
        ThemeSettingsComponent,
        ShortcutSettingsComponent,
        CaptureSettingsComponent,
        ImportExportSettingsComponent,
    ],
    templateUrl: './settings-page.component.html',
    styleUrl: './settings-page.component.css',
})
export class SettingsPageComponent {}
