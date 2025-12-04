import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

const STORAGE_KEY = 'theme';
const CLASS_LIGHT = 'theme-light';
const CLASS_DARK = 'theme-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private storage = inject(StorageService);

    private modeSignal = signal<'light' | 'dark' | 'system'>('system');
    mode = computed(() => this.modeSignal());

    constructor() {
        const stored = this.storage.get<'light' | 'dark' | 'system'>(STORAGE_KEY, 'system');
        this.modeSignal.set(stored);

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        media.addEventListener('change', () => this.applyTheme());
    }

    setMode(mode: 'light' | 'dark' | 'system') {
        this.modeSignal.set(mode);
        this.storage.set(STORAGE_KEY, mode);
        this.applyTheme();
    }

    applyTheme() {
        const root = document.documentElement;
        const mode = this.modeSignal();
        const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        root.classList.remove(CLASS_LIGHT, CLASS_DARK);
        root.classList.add(isDark ? CLASS_DARK : CLASS_LIGHT);
    }
}