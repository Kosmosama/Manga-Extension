import { Injectable, signal, computed, inject } from '@angular/core';
import { ShortcutSettings, ShortcutBinding, ShortcutAction } from './shortcut.types';
import { StorageService } from '../services/storage.service';

const STORAGE_KEY = 'shortcuts';

const DEFAULT_BINDINGS: ShortcutBinding[] = [
    { action: 'openSettings', keys: 'Ctrl+,' },
    { action: 'openImportExport', keys: 'Ctrl+Shift+I' },
    { action: 'toggleViewMode', keys: 'Ctrl+Shift+V' },
    { action: 'focusSearch', keys: '/' },
    { action: 'openShortcutHelp', keys: 'Ctrl+/' },
    { action: 'toggleFavorite', keys: 'F' },
    { action: 'incrementChapters', keys: 'Shift++' },
    { action: 'decrementChapters', keys: 'Shift+-' },
    { action: 'deleteManga', keys: 'Delete' },
    { action: 'nextChapter', keys: 'Alt+Right' },
    { action: 'prevChapter', keys: 'Alt+Left' },
    { action: 'toggleTheme', keys: 'Ctrl+Shift+T' },
];

@Injectable({ providedIn: 'root' })
export class ShortcutService {
    private storage = inject(StorageService);

    private stateSignal = signal<ShortcutSettings>({
        enabled: true,
        bindings: DEFAULT_BINDINGS,
    });

    state = computed(() => this.stateSignal());
    enabled = computed(() => this.stateSignal().enabled);
    bindings = computed(() => this.stateSignal().bindings);

    constructor() {
        const stored = this.storage.get<ShortcutSettings>(STORAGE_KEY, this.stateSignal());
        this.stateSignal.set(stored);
    }

    setEnabled(enabled: boolean) {
        const next = { ...this.stateSignal(), enabled };
        this.stateSignal.set(next);
        this.persist();
    }

    setBinding(action: ShortcutAction, keys: string) {
        const bindings = this.stateSignal().bindings.map(b => (b.action === action ? { ...b, keys } : b));
        this.stateSignal.set({ ...this.stateSignal(), bindings });
        this.persist();
    }

    setBindingEnabled(action: ShortcutAction, enabled: boolean) {
        const bindings = this.stateSignal().bindings.map(b => (b.action === action ? { ...b, enabled } : b));
        this.stateSignal.set({ ...this.stateSignal(), bindings });
        this.persist();
    }

    clearBinding(action: ShortcutAction) {
        const bindings = this.stateSignal().bindings.filter(b => b.action !== action);
        this.stateSignal.set({ ...this.stateSignal(), bindings });
        this.persist();
    }

    addBinding(binding: ShortcutBinding) {
        const bindings = this.stateSignal().bindings.filter(b => b.action !== binding.action).concat(binding);
        this.stateSignal.set({ ...this.stateSignal(), bindings });
        this.persist();
    }

    private persist() {
        this.storage.set(STORAGE_KEY, this.stateSignal());
    }
}