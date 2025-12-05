export type ShortcutAction =
    | 'openSettings'
    | 'nextChapter'
    | 'prevChapter'
    | 'toggleTheme'
    | 'toggleShortcuts';

export interface ShortcutBinding {
    action: ShortcutAction;
    keys: string; // e.g. "Ctrl+Shift+S"
}

export interface ShortcutSettings {
    enabled: boolean;
    bindings: ShortcutBinding[];
}