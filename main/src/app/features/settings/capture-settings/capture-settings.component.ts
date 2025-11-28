import { Component, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { CaptureFeatureFlagsService } from '../../../core/services/capture-feature-flags.service';

@Component({
    selector: 'capture-settings',
    standalone: true,
    imports: [TranslocoPipe],
    templateUrl: './capture-settings.component.html',
    styleUrl: './capture-settings.component.css'
})
export class CaptureSettingsComponent {
    private captureFeatureFlagsService = inject(CaptureFeatureFlagsService);

    flags = signal(this.captureFeatureFlagsService.flags());

    constructor() {
        this.captureFeatureFlagsService.init$().subscribe({
            next: () => this.flags.set(this.captureFeatureFlagsService.flags())
        });
    }

    toggleEnabled(ev: Event) {
        const checked = (ev.target as HTMLInputElement).checked;
        this.captureFeatureFlagsService.setEnabled(checked);
        this.flags.set(this.captureFeatureFlagsService.flags());
    }

    toggleQuickCapture(ev: Event) {
        const checked = (ev.target as HTMLInputElement).checked;
        this.captureFeatureFlagsService.setQuickCapture(checked);
        this.flags.set(this.captureFeatureFlagsService.flags());
    }

    toggleFab(ev: Event) {
        const checked = (ev.target as HTMLInputElement).checked;
        this.captureFeatureFlagsService.setFabEnabled(checked);
        this.flags.set(this.captureFeatureFlagsService.flags());
    }
}