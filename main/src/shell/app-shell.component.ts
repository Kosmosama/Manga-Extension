import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { effect, inject } from '@angular/core';
import { ThemeService } from '../app/core/services/theme.service';

@Component({
    selector: 'app-shell',
    standalone: true,
    imports: [RouterOutlet],
    template: `
        <link rel="stylesheet" href="/styles/theme.css" />
        <router-outlet></router-outlet>
    `,
})
export class AppShellComponent {
    private themeService = inject(ThemeService);

    constructor() {
        effect(() => {
            this.themeService.applyTheme();
        });
    }
}