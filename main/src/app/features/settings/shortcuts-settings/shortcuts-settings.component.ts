import { Component, inject, signal, computed } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ShortcutEngineService } from '../../../core/services/shortcut-engine.service';
import { ShortcutAction } from '../../../core/interfaces/shortcut.interface';

@Component({
    selector: 'shortcuts-settings',
    standalone: true,
    imports: [TranslocoPipe, ReactiveFormsModule],
    templateUrl: './shortcuts-settings.component.html',
    styleUrl: './shortcuts-settings.component.css'
})
export class ShortcutsSettingsComponent {
    private shortcutEngineService = inject(ShortcutEngineService);

    readonly actions = signal<ShortcutAction[]>([
        ShortcutAction.AddManga,
        ShortcutAction.OpenSettings,
        ShortcutAction.ToggleFavorite,
        ShortcutAction.IncrementChapters,
        ShortcutAction.DecrementChapters,
        ShortcutAction.DeleteManga,
        ShortcutAction.FocusSearch,
        ShortcutAction.OpenImportExport,
        ShortcutAction.ToggleViewMode,
        ShortcutAction.OpenShortcutHelp,
        ShortcutAction.QuickCapture
    ]);

    formControls = new Map<ShortcutAction, FormControl<string>>();

    conflicts = computed(() => this.shortcutEngineService.conflicts);

    readonly labelMap: Record<ShortcutAction, string> = {
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

    constructor() {
        for (const action of this.actions()) {
            const binding = this.shortcutEngineService.getBinding(action);
            const control = new FormControl<string>(binding?.combo ?? '', { nonNullable: true });
            control.valueChanges.subscribe(value => {
                this.shortcutEngineService.updateBinding(action, value);
            });
            this.formControls.set(action, control);
        }
    }

    reset(action: ShortcutAction) {
        this.shortcutEngineService.resetBinding(action);
        const b = this.shortcutEngineService.getBinding(action);
        this.formControls.get(action)?.setValue(b?.combo ?? '', { emitEvent: false });
    }

    restoreDefaults() {
        this.shortcutEngineService.restoreDefaults();
        for (const action of this.actions()) {
            const b = this.shortcutEngineService.getBinding(action);
            this.formControls.get(action)?.setValue(b?.combo ?? '', { emitEvent: false });
        }
    }

    isConflict(action: ShortcutAction): boolean {
        const binding = this.shortcutEngineService.getBinding(action);
        if (!binding) return false;
        const list = this.conflicts()[binding.combo];
        return !!list && list.length > 1;
    }
}