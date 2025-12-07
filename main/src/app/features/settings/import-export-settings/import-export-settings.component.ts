import { Component, inject } from '@angular/core';
import { ImportExportService } from '../../../core/import-export/import-export.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-import-export-settings',
    standalone: true,
    imports: [TranslocoPipe],
    templateUrl: './import-export-settings.component.html',
    styleUrls: ['./import-export-settings.component.css'],
})
export class ImportExportSettingsComponent {
    private importExportService = inject(ImportExportService);
    lastExport: string | null = null;

    onExport() {
        const dto = this.importExportService.exportSettings();
        this.lastExport = JSON.stringify(dto, null, 2);
    }

    onImport(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const dto = JSON.parse(reader.result as string);
                this.importExportService.importSettings(dto);
                alert('importExport.importPlaceholder' as any);
            } catch {
                alert('importExport.invalidJson' as any);
            }
        };
        reader.readAsText(file);
    }
}