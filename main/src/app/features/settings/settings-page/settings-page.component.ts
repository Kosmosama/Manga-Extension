import { Component, inject, signal, computed } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ShortcutsSettingsComponent } from '../shortcuts-settings/shortcuts-settings.component';
import { CaptureSettingsComponent } from '../capture-settings/capture-settings.component';

@Component({
    selector: 'settings-page',
    standalone: true,
    imports: [ TranslocoPipe, ThemeSettingsComponent, LanguageSettingsComponent, ShortcutsSettingsComponent, CaptureSettingsComponent, BehaviorSettingsComponent ],
    templateUrl: './settings-page.component.html',
    styleUrl: './settings-page.component.css'
})
export class SettingsPageComponent {
    private sectionsOrder = ['theme', 'language', 'shortcuts', 'capture', 'behavior'] as const;
    readonly sections = signal<string[]>([...this.sectionsOrder]);
    readonly active = signal<string>('theme');

    /**
     * Returns a translated label key for a section.
     */
    sectionLabel(section: string): string {
        return 'settings.section.' + section;
    }

    setActive(id: string) {
        if (this.sections().includes(id)) {
            this.active.set(id);
        }
    }

    readonly ariaLabelActive = computed(
        () => 'settings.section.' + this.active()
    );
}