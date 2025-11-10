import { Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { MissingKeysService } from '../missing-keys.service';

@Component({
    selector: 'app-missing-keys-overlay',
    standalone: true,
    imports: [TranslocoPipe],
    templateUrl: './missing-keys-overlay.component.html',
    styleUrl: './missing-keys-overlay.component.css'
})
export class MissingKeysOverlayComponent {
    private missingKeysService = inject(MissingKeysService);

    missing = computed(() => this.missingKeysService.missingKeys());
    count = computed(() => this.missing().length);

    copied = computed(() => this._copied);
    private _copied = false;

    onClear() {
        this.missingKeysService.clear();
        this._copied = false;
    }

    onCopy() {
        const text = this.missing().map(m => `${m.lang}:${m.key}`).join('\n');
        try {
            navigator.clipboard.writeText(text);
            this._copied = true;
            setTimeout(() => { this._copied = false; }, 2000);
        } catch {
            // ignore
        }
    }
}