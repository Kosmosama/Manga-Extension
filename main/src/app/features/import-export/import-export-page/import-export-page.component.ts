import { Component, inject, signal, effect } from '@angular/core';
import { ImportExportService } from '../../../core/services/import-export.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { ThemeService } from '../../../core/services/theme.service';
import { ImportResult } from '../../../core/interfaces/import-export.interface';

@Component({
    selector: 'import-export-page',
    standalone: true,
    imports: [TranslocoPipe],
    templateUrl: './import-export-page.component.html',
    styleUrl: './import-export-page.component.css'
})
export class ImportExportPageComponent {
    private importExportService = inject(ImportExportService);
    private themeService = inject(ThemeService);

    importing = signal(false);
    exporting = signal(false);
    bookmarksImporting = signal(false);

    lastResult = signal<ImportResult | null>(null);
    collisionMode = signal<'prompt' | 'mergeAll' | 'skipAll'>('prompt');

    fileName = signal<string | null>(null);

    readonly hasCollisions = signal<boolean>(false);
    readonly themeName = signal<string>('system');

    constructor() {
        effect(() => {
            const res = this.lastResult();
            this.hasCollisions.set((res?.collisions.length ?? 0) > 0);
        });
        effect(() => {
            const t = this.themeService.theme;
            const n = Number(t);
            const s = String(t).toLowerCase();
            let name = 'unknown';
            if (!Number.isNaN(n)) {
                name = n === 0 ? 'system' : n === 1 ? 'light' : n === 2 ? 'dark' : 'unknown';
            } else {
                name = s === 'system' || s === '0' ? 'system' : s === 'light' || s === '1' ? 'light' : s === 'dark' || s === '2' ? 'dark' : 'unknown';
            }
            this.themeName.set(name);
        });
    }

    /**
     * Initiates import using selected file input (handled by template).
     */
    onFileSelected(file: File | null) {
        if (!file) return;
        this.fileName.set(file.name);
        this.importing.set(true);
        this.importExportService.importFile$(file, this.collisionMode()).subscribe({
            next: res => this.lastResult.set(res),
            error: () => this.lastResult.set({
                imported: 0,
                skipped: 0,
                collisions: [],
                errors: ['import.error.generic']
            }),
            complete: () => this.importing.set(false)
        });
    }

    /**
     * Applies decisions for collisions (user can mark merge / skip).
     */
    applyDecisions() {
        const current = this.lastResult();
        if (!current) return;
        this.importExportService.applyCollisionDecisions$(current).subscribe({
            next: updated => this.lastResult.set(updated)
        });
    }

    /**
     * Sets decision for a single collision entry.
     */
    setCollisionDecision(index: number, decision: 'merge' | 'skip') {
        const res = this.lastResult();
        if (!res) return;
        const collisions = [...res.collisions];
        collisions[index] = { ...collisions[index], decision };
        this.lastResult.set({ ...res, collisions });
    }

    /**
     * Trigger export: creates blob and forces download.
     */
    exportLibrary() {
        this.exporting.set(true);
        this.importExportService.export$().subscribe({
            next: blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `manga-library-v${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
            },
            complete: () => this.exporting.set(false)
        });
    }

    /**
     * Begins bookmarks import.
     */
    importBookmarks() {
        this.bookmarksImporting.set(true);
        this.importExportService.importBookmarks$().subscribe({
            next: res => this.lastResult.set(res),
            complete: () => this.bookmarksImporting.set(false)
        });
    }
}