import { Component, inject, signal } from '@angular/core';
import { ShortcutEngineService } from '../../../core/services/shortcut-engine.service';
import { ShortcutAction, ShortcutBinding } from '../../../core/interfaces/shortcut.interface';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'shortcut-help',
    standalone: true,
    imports: [TranslocoPipe],
    templateUrl: './shortcuts-page.component.html',
    styleUrl: './shortcuts-page.component.css'
})
export class ShortcutsComponent {
    private shortcutEngineService = inject(ShortcutEngineService);

    bindings = signal<ShortcutBinding[]>(this.shortcutEngineService.bindings());

    readonly actionLabels: Record<ShortcutAction, string> = {
        [ShortcutAction.AddManga]: 'shortcut.action.addManga',
        [ShortcutAction.OpenSettings]: 'shortcut.action.openSettings',
        [ShortcutAction.ToggleFavorite]: 'shortcut.action.toggleFavorite',
        [ShortcutAction.IncrementChapters]: 'shortcut.action.incrementChapters',
        [ShortcutAction.DecrementChapters]: 'shortcut.action.decrementChapters',
        [ShortcutAction.DeleteManga]: 'shortcut.action.deleteManga',
        [ShortcutAction.FocusSearch]: 'shortcut.action.focusSearch',
        [ShortcutAction.OpenImportExport]: 'shortcut.action.openImportExport',
        [ShortcutAction.ToggleViewMode]: 'shortcut.action.toggleViewMode',
        [ShortcutAction.OpenShortcutHelp]: 'shortcut.action.openShortcutHelp',
        [ShortcutAction.QuickCapture]: 'shortcut.action.quickCapture'
    };
}