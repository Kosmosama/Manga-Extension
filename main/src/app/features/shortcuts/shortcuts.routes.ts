import { Routes } from '@angular/router';

export const shortcutRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./shortcuts-page/shortcuts-page.component').then(c => c.ShortcutsComponent)
    }
];