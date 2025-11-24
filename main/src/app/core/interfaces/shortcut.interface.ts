export enum ShortcutAction {
    AddManga = 'addManga',
    OpenSettings = 'openSettings',
    ToggleFavorite = 'toggleFavorite',
    IncrementChapters = 'incrementChapters',
    DecrementChapters = 'decrementChapters',
    DeleteManga = 'deleteManga',
    FocusSearch = 'focusSearch',
    OpenImportExport = 'openImportExport',
    ToggleViewMode = 'toggleViewMode',
    OpenShortcutHelp = 'openShortcutHelp',
    QuickCapture = 'quickCapture'
}

export interface ShortcutBinding {
    action: ShortcutAction;
    combo: string; // e.g. "Ctrl+Shift+M"
}

export interface ShortcutProfile {
    version: number;
    bindings: ShortcutBinding[];
}

export interface TriggeredShortcut {
    action: ShortcutAction;
    combo: string;
    originalEvent: KeyboardEvent;
}