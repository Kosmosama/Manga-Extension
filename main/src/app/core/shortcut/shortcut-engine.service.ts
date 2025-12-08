import { Injectable, inject, signal } from '@angular/core';
import { fromEvent } from 'rxjs';
import { ShortcutService } from './shortcut.service';
import { ShortcutAction, ShortcutBinding } from './shortcut.types';

@Injectable({ providedIn: 'root' })
export class ShortcutEngineService {
    private shortcutService = inject(ShortcutService);

    private registeredActions = signal<Record<ShortcutAction, { id: ShortcutAction; handler: () => void; description?: string }>>(
        {} as Record<ShortcutAction, { id: ShortcutAction; handler: () => void; description?: string }>
    );

    private shortcutsEnabled = this.shortcutService.enabled;
    private bindings = this.shortcutService.bindings;

    constructor() {
        fromEvent<KeyboardEvent>(document, 'keydown').subscribe(ev => {
            if (!this.shortcutsEnabled()) return;
            this.processKey(ev);
        });
    }

    registerAction(id: ShortcutAction, handler: () => void, description?: string) {
        this.registeredActions.update(curr => ({
            ...curr,
            [id]: { id, handler, description },
        }));
    }

    unregisterAction(id: ShortcutAction) {
        this.registeredActions.update(curr => {
            const next = { ...curr };
            delete next[id];
            return next;
        });
    }

    listRegistered() {
        return Object.values(this.registeredActions());
    }

    getBindings(): ShortcutBinding[] {
        return this.bindings();
    }

    updateBinding(action: ShortcutAction, binding: ShortcutBinding) {
        this.shortcutService.addBinding(binding);
    }

    toggleDisabled(disabled: boolean) {
        this.shortcutService.setEnabled(!disabled);
    }

    private processKey(ev: KeyboardEvent) {
        const pressed = this.normalize(ev);
        const bindings = this.bindings();
        for (const binding of bindings) {
            const enabled = binding.enabled ?? true;
            if (!enabled) continue;
            const sequence = this.parseKeys(binding.keys);
            if (this.matches(pressed, sequence)) {
                const action = this.registeredActions()[binding.action];
                if (action) {
                    ev.preventDefault();
                    try {
                        action.handler();
                    } catch {
                    }
                }
                break;
            }
        }
    }

    private parseKeys(keys: string): string[] {
        return keys
            .split('+')
            .map(k => k.trim().toLowerCase())
            .filter(Boolean);
    }

    private normalize(ev: KeyboardEvent): string[] {
        const parts: string[] = [];
        if (ev.ctrlKey) parts.push('ctrl');
        if (ev.metaKey) parts.push('meta');
        if (ev.altKey) parts.push('alt');
        if (ev.shiftKey) parts.push('shift');
        const key = ev.key.toLowerCase();
        if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
            parts.push(key);
        }
        return parts;
    }

    private matches(pressed: string[], sequence: string[]): boolean {
        if (pressed.length !== sequence.length) return false;
        return sequence.every((s, i) => pressed[i] === s);
    }
}