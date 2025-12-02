import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { SettingsStorageService } from './settings-storage.service';
import { ShortcutBinding } from '../interfaces/settings.model';
import { fromEvent, Observable, of } from 'rxjs';
import { RegisteredAction } from '../interfaces/shortcuts.interface';

@Injectable({ providedIn: 'root' })
export class ShortcutEngineService {
    private readonly storage = inject(SettingsStorageService);

    private readonly registeredActions = signal<Record<string, RegisteredAction>>({});
    private readonly shortcutsDisabled = computed(() => this.storage.shortcuts().disabled);
    private readonly bindings = computed(() => this.storage.shortcuts().bindings);

    constructor() {
        // Listen to keydown globally
        fromEvent<KeyboardEvent>(document, 'keydown').subscribe(ev => {
            if (this.shortcutsDisabled()) return;
            this.processKey(ev);
        });

        // #TODO
        // Example registrations
        this.registerAction('openSettings', () => {
            // navigation handled externally; expose event or callback
            const event = new CustomEvent('shortcut:openSettings');
            window.dispatchEvent(event);
        });
        this.registerAction('quickCapture', () => {
            const event = new CustomEvent('shortcut:quickCapture');
            window.dispatchEvent(event);
        });
    }

    /**
     * Registers a new action to be triggered by a keyboard shortcut.
     * 
     * @param id - The unique identifier for the action
     * @param handler - The function to call when the action is triggered
     * @param description - An optional description for the action
     */
    registerAction(id: string, handler: () => void, description?: string) {
        this.registeredActions.update(curr => ({
            ...curr,
            [id]: { id, handler, description }
        }));
    }

    /**
     * Lists all the registered actions.
     * 
     * @returns An array of registered actions
     */
    listRegistered(): RegisteredAction[] {
        return Object.values(this.registeredActions());
    }

    /**
     * Retrieves the current shortcut bindings.
     * 
     * @returns A record of action names to their corresponding shortcut bindings
     */
    getBindings(): Record<string, ShortcutBinding> {
        return this.bindings();
    }

    /**
     * Toggles whether shortcuts are enabled or disabled.
     * 
     * @param disabled - The new state of the shortcuts (true to disable, false to enable)
     */
    toggleDisabled(disabled: boolean) {
        const current = this.storage.shortcuts();
        this.storage.updateSection('shortcuts', {
            ...current,
            disabled
        });
    }

    /**
     * Updates the binding for a specific action.
     * 
     * @param action - The action ID to update
     * @param binding - The new shortcut binding for the action
     */
    updateBinding(action: string, binding: ShortcutBinding) {
        const current = this.storage.shortcuts();
        this.storage.updateSection('shortcuts', {
            ...current,
            bindings: {
                ...current.bindings,
                [action]: binding
            }
        });
    }

    /**
     * Processes a keydown event and triggers the corresponding action if a match is found.
     * 
     * @param ev - The keyboard event to process
     */
    private processKey(ev: KeyboardEvent) {
        const pressed = this.normalize(ev);
        const bindings = this.bindings();
        for (const binding of Object.values(bindings)) {
            if (!binding.enabled) continue;
            const sequence = binding.keys.map(k => k.toLowerCase());
            if (this.matches(pressed, sequence)) {
                const action = this.registeredActions()[binding.action];
                if (action) {
                    ev.preventDefault();
                    action.handler();
                }
            }
        }
    }

    /**
     * Normalizes the keyboard event to extract modifier keys and the main key.
     * 
     * @param ev - The keyboard event to normalize
     * @returns An array of pressed keys (e.g., ['ctrl', 'shift', 'a'])
     */
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

    /**
     * Checks if the pressed keys match a given key sequence.
     * 
     * @param pressed - The array of pressed keys
     * @param sequence - The sequence of keys to match
     * @returns True if the pressed keys match the sequence, otherwise false
     */
    private matches(pressed: string[], sequence: string[]): boolean {
        if (pressed.length !== sequence.length) return false;
        return sequence.every((s, i) => pressed[i] === s);
    }

    /**
     * Returns the current shortcut bindings as an observable.
     * 
     * @returns An observable emitting the current shortcut bindings
     */
    toObservable(): Observable<Record<string, ShortcutBinding>> {
        return of(this.bindings());
    }
}
