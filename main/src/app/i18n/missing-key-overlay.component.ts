import { Component, effect, inject, signal } from '@angular/core';
import { MissingKeysService } from './missing-keys-overlay.service';

@Component({
    selector: 'app-missing-keys-overlay',
    standalone: true,
    templateUrl: './missing-keys-overlay.component.html',
    styleUrl: './missing-keys-overlay.component.css',
})
export class MissingKeysOverlayComponent {
    private missing = inject(MissingKeysService);

    keys = this.missing.keys;
    collapsed = signal(false);
    count = signal(0);

    constructor() {
        effect(() => this.count.set(this.keys().length));
    }

    clear(): void {
        this.missing.clear();
    }

    toggleCollapse(): void {
        this.collapsed.set(!this.collapsed());
    }
}
