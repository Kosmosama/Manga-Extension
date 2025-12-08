export type ShortcutAction =
    | 'openSettings'
    | 'openImportExport'
    | 'toggleViewMode'
    | 'focusSearch'
    | 'openShortcutHelp'
    | 'toggleFavorite'
    | 'incrementChapters'
    | 'decrementChapters'
    | 'deleteManga'
    | 'nextChapter'
    | 'prevChapter'
    | 'toggleTheme';

export interface ShortcutBinding {
    action: ShortcutAction;
    keys: string; // e.g. "Ctrl+Shift+S" or "Alt+Right"
    enabled?: boolean; // optional per-binding toggle
}

export interface ShortcutSettings {
    enabled: boolean; // master toggle for shortcuts
    bindings: ShortcutBinding[];
}