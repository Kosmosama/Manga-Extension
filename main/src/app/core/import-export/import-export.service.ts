import { inject, Injectable } from '@angular/core';
import { SettingsExportDTO } from './import-export.types';
import { LanguageService } from '../language/language.service';
import { ThemeService } from '../theme/theme.service';
import { ShortcutService } from '../shortcut/shortcut.service';
import { CaptureService } from '../capture/capture.service';

@Injectable({ providedIn: 'root' })
export class ImportExportService {
    private languageService = inject(LanguageService);
    private themeService = inject(ThemeService);
    private shortcutService = inject(ShortcutService);
    private captureService = inject(CaptureService);

    exportSettings(): SettingsExportDTO {
        return {
            version: '1.0.0',
            language: { current: this.languageService.current() } as any,
            theme: { mode: this.themeService.mode() },
            shortcuts: this.shortcutService.state(),
            capture: this.captureService.state(),
        };
    }

    importSettings(_dto: SettingsExportDTO) {
        // #TODO
    }
}