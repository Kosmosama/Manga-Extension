import { Component, inject } from '@angular/core';
import { ShortcutService } from '../../../core/shortcut/shortcut.service';
import { ShortcutBinding } from '../../../core/shortcut/shortcut.types';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-shortcut-settings',
    standalone: true,
    imports: [TranslocoPipe],
    templateUrl: './shortcut-settings.component.html',
    styleUrls: ['./shortcut-settings.component.css'],
})
export class ShortcutSettingsComponent {
    private shortcutService = inject(ShortcutService);
    enabled = this.shortcutService.enabled;
    bindings = this.shortcutService.bindings;

    toggleEnabled(event: Event) {
        const enabled = (event.target as HTMLInputElement).checked;
        this.shortcutService.setEnabled(enabled);
    }

    updateBinding(action: ShortcutBinding['action'], event: Event) {
        const keys = (event.target as HTMLInputElement).value;
        this.shortcutService.setBinding(action, keys);
    }

    clearBinding(action: ShortcutBinding['action']) {
        this.shortcutService.clearBinding(action);
    }
}