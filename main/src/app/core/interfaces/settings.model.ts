export type ThemeMode = 'light' | 'dark' | 'system';

export interface ShortcutBinding {
    action: string;
    keys: string[];      // ['ctrl', 'shift', 'O']
    enabled: boolean;
    description?: string;
}

export interface ShortcutsSettings {
    disabled: boolean;
    bindings: Record<string, ShortcutBinding>;
}

export interface CaptureSettings {
    enabled: boolean;
    quickCaptureEnabled: boolean;
    autoTag: boolean;
    listenClipboard: boolean;
}

export interface AppSettings {
    version: number;
    language: string;
    themeMode: ThemeMode;
    shortcuts: ShortcutsSettings;
    capture: CaptureSettings;
}

export const SETTINGS_VERSION = 1;

export const DEFAULT_SETTINGS: AppSettings = {
    version: SETTINGS_VERSION,
    language: 'en',
    themeMode: 'system',
    shortcuts: {
        disabled: false,
        bindings: {
            openSettings: {
                action: 'openSettings',
                keys: ['ctrl', 'comma'],
                enabled: true,
                description: 'Open Settings Page'
            },
            quickCapture: {
                action: 'quickCapture',
                keys: ['ctrl', 'shift', 'Q'],
                enabled: true,
                description: 'Trigger Quick Capture'
            }
        }
    },
    capture: {
        enabled: true,
        quickCaptureEnabled: true,
        autoTag: false,
        listenClipboard: false
    }
};