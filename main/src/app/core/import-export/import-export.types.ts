import { LanguageSettings } from '../language/language.types';
import { ThemeSettings } from '../theme/theme.types';
import { ShortcutSettings } from '../shortcut/shortcut.types';
import { CaptureSettings } from '../capture/capture.type';

export interface SettingsExportDTO {
    version: string;
    language: LanguageSettings | { current: string };
    theme: ThemeSettings;
    shortcuts: ShortcutSettings;
    capture: CaptureSettings;
}