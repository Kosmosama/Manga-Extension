import { Injectable, inject, signal, effect } from '@angular/core';
import { Observable, Subject, defer } from 'rxjs';
import { SettingsStorageService } from './settings-storage.service';
import { ShortcutAction, ShortcutBinding, ShortcutProfile, TriggeredShortcut } from '../interfaces/shortcut.interface';

@Injectable({ providedIn: 'root' })
export class ShortcutEngineService {
    private settingsStorageService = inject(SettingsStorageService);

    private readonly STORAGE_KEY = 'shortcutsProfile';
    private readonly PROFILE_VERSION = 1;

    private profileSignal = signal<ShortcutProfile>({
        version: this.PROFILE_VERSION,
        bindings: this.defaultBindings()
    });

    private triggerSubject = new Subject<TriggeredShortcut>();

    readonly triggered$: Observable<TriggeredShortcut> = this.triggerSubject.asObservable();
    readonly bindings = () => this.profileSignal().bindings;

    // For UI conflict display
    private conflictSignal = signal<Record<string, string[]>>({}); // combo -> actions[]

    constructor() {
        this.loadProfile$().subscribe();
        effect(() => {
            // Recompute conflicts whenever bindings change
            const map: Record<string, string[]> = {};
            for (const b of this.bindings()) {
                map[b.combo] = map[b.combo] ? [...map[b.combo], b.action] : [b.action];
            }
            const conflicts: Record<string, string[]> = {};
            Object.entries(map).forEach(([combo, acts]) => {
                if (acts.length > 1) conflicts[combo] = acts;
            });
            this.conflictSignal.set(conflicts);
        });

        // Global key listener
        window.addEventListener('keydown', ev => {
            if (ev.defaultPrevented) return;
            const combo = this.normalizeEvent(ev);
            if (!combo) return;
            const binding = this.bindings().find(b => b.combo === combo);
            if (!binding) return;
            if (!(ev.target instanceof HTMLInputElement) &&
                !(ev.target instanceof HTMLTextAreaElement) &&
                !(ev.target as HTMLElement)?.isContentEditable) {
                ev.preventDefault();
            }
            this.triggerSubject.next({ action: binding.action, combo, originalEvent: ev });
        });
    }

    /**
     * Returns conflict map: combo -> array of actions bound.
     */
    get conflicts(): Record<string, string[]> {
        return this.conflictSignal();
    }

    /**
     * Emits observable completing after profile loaded (or default).
     */
    private loadProfile$(): Observable<void> {
        return defer(() => new Observable<void>(subscriber => {
            this.settingsStorageService.getSync<ShortcutProfile>(this.STORAGE_KEY, {
                version: this.PROFILE_VERSION,
                bindings: this.defaultBindings()
            }).subscribe(profile => {
                // If version mismatch, migrate
                if (profile.version !== this.PROFILE_VERSION) {
                    profile = this.migrateProfile(profile);
                }
                this.profileSignal.set(profile);
                subscriber.next();
                subscriber.complete();
            });
        }));
    }

    /**
     * Persists current profile.
     */
    private saveProfile() {
        this.settingsStorageService.setSync(this.STORAGE_KEY, this.profileSignal());
    }

    /**
     * Updates a binding for an action.
     */
    updateBinding(action: ShortcutAction, combo: string): void {
        const normalized = this.normalizeComboString(combo);
        if (!normalized) return;
        const existing = this.bindings();
        const next = existing.map(b => b.action === action ? { ...b, combo: normalized } : b);
        this.profileSignal.set({ ...this.profileSignal(), bindings: next });
        this.saveProfile();
    }

    /**
     * Resets a single action to default binding.
     */
    resetBinding(action: ShortcutAction) {
        const def = this.defaultBindings();
        const fallback = def.find(d => d.action === action);
        if (!fallback) return;
        this.updateBinding(action, fallback.combo);
    }

    /**
     * Restores all defaults.
     */
    restoreDefaults() {
        this.profileSignal.set({
            version: this.PROFILE_VERSION,
            bindings: this.defaultBindings()
        });
        this.saveProfile();
    }

    /**
     * Returns a binding for an action.
     */
    getBinding(action: ShortcutAction): ShortcutBinding | undefined {
        return this.bindings().find(b => b.action === action);
    }

    /**
     * Normalizes a combo from a keyboard event.
     */
    private normalizeEvent(ev: KeyboardEvent): string | null {
        // Ignore modifier-only
        if (['Shift', 'Control', 'Alt', 'Meta'].includes(ev.key)) return null;

        const parts: string[] = [];
        if (ev.ctrlKey) parts.push('Ctrl');
        if (ev.metaKey) parts.push('Meta');
        if (ev.altKey) parts.push('Alt');
        if (ev.shiftKey) parts.push('Shift');

        // Key normalization letters -> uppercase; space, slash
        let key = ev.key;
        if (key.length === 1) key = key.toUpperCase();
        if (key === ' ') key = 'Space';
        if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
            key = key.replace('Arrow', '');
        }

        // Avoid duplicates for modifiers embedded in key label
        if (!['Ctrl', 'Meta', 'Alt', 'Shift'].includes(key)) {
            parts.push(key);
        }
        return parts.join('+');
    }

    /**
     * Ensures canonical ordering: Ctrl, Meta, Alt, Shift, Key.
     */
    private normalizeComboString(raw: string): string | null {
        if (!raw) return null;
        const rawParts = raw
            .split('+')
            .map(p => p.trim())
            .filter(p => !!p);

        const mods: string[] = [];
        let keyPart: string | null = null;

        for (const p of rawParts) {
            const upper = p[0].toUpperCase() + p.slice(1);
            switch (upper) {
                case 'Ctrl':
                case 'Meta':
                case 'Alt':
                case 'Shift':
                    if (!mods.includes(upper)) mods.push(upper);
                    break;
                default:
                    if (!keyPart) {
                        keyPart = upper.length === 1 ? upper.toUpperCase() : upper;
                    }
                    break;
            }
        }
        if (!keyPart) return null;
        return [...mods, keyPart].join('+');
    }

    /**
     * Provides default bindings.
     */
    private defaultBindings(): ShortcutBinding[] {
        return [
            { action: ShortcutAction.AddManga, combo: 'Ctrl+Shift+A' },
            { action: ShortcutAction.OpenSettings, combo: 'Ctrl+,' },
            { action: ShortcutAction.ToggleFavorite, combo: 'F' },
            { action: ShortcutAction.IncrementChapters, combo: '+' },
            { action: ShortcutAction.DecrementChapters, combo: '-' },
            { action: ShortcutAction.DeleteManga, combo: 'Delete' },
            { action: ShortcutAction.FocusSearch, combo: '/' },
            { action: ShortcutAction.OpenImportExport, combo: 'Ctrl+Shift+I' },
            { action: ShortcutAction.ToggleViewMode, combo: 'V' },
            { action: ShortcutAction.OpenShortcutHelp, combo: 'Shift+/' },
            { action: ShortcutAction.QuickCapture, combo: 'Shift+Q' }
        ];
    }

    /**
     * Migrate old profile versions to current.
     */
    private migrateProfile(old: ShortcutProfile): ShortcutProfile {
        const defaults = this.defaultBindings();
        const existingMap = new Map(old.bindings.map(b => [b.action, b.combo]));
        const merged: ShortcutBinding[] = defaults.map(d => ({
            action: d.action,
            combo: existingMap.get(d.action) ?? d.combo
        }));
        return { version: this.PROFILE_VERSION, bindings: merged };
    }
}