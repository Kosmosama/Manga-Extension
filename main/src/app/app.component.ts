import { Component, computed, inject, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MissingKeysOverlayComponent } from './shared/i18n/missing-keys-overlay/missing-keys-overlay.component';
import { MissingKeysService } from './shared/i18n/missing-keys.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, MissingKeysOverlayComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    private missingKeysService = inject(MissingKeysService);
    private devMode = isDevMode();

    missingCount = computed(() => this.missingKeysService.missingKeys().length);
    showOverlay = computed(() => this.devMode && this.missingCount() > 0);
}