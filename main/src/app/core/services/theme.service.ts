import { Injectable, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { Theme } from '../../core/interfaces/theme.interface';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private themeSignal = signal<Theme>(Theme.System);

    get theme(): Theme {
        return this.themeSignal();
    }

    constructor() {
        console.log('ThemeService created');
        this.loadTheme();
    }

    private loadTheme() {
        this.getStoredTheme().subscribe((storedTheme) => {
            this.setTheme(storedTheme);
        });
    }

    private getStoredTheme(): Observable<Theme> {
        return new Observable<Theme>((observer) => {
            chrome.storage.local.get('theme', (result: { theme?: Theme }) => {
                observer.next(result.theme ?? this.getSystemTheme());
                observer.complete();
            });
        });
    }

    private getSystemTheme(): Theme {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.Dark : Theme.Light;
    }

    setTheme(theme: Theme) {
        this.themeSignal.set(theme);
        document.documentElement.classList.toggle('dark', theme === Theme.Dark || (theme === Theme.System && this.getSystemTheme() === Theme.Dark));
        chrome.storage.local.set({ theme });
    }
}
