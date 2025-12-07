import { Component, inject } from '@angular/core';
import { CaptureService } from '../../../core/capture/capture.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-capture-settings',
    standalone: true,
    imports: [TranslocoPipe],
    templateUrl: './capture-settings.component.html',
    styleUrls: ['./capture-settings.component.css'],
})
export class CaptureSettingsComponent {
    private captureService = inject(CaptureService);
    state = this.captureService.state;

    onAutoCapture(event: Event) {
        this.captureService.setAutoCapture((event.target as HTMLInputElement).checked);
    }

    onQuality(event: Event) {
        this.captureService.setCaptureQuality((event.target as HTMLSelectElement).value as any);
    }

    onIncludeMetadata(event: Event) {
        this.captureService.setIncludeMetadata((event.target as HTMLInputElement).checked);
    }
}