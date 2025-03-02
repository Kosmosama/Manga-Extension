import { Routes } from "@angular/router";

export const settingsRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./settings-page/settings-page.component').then(m => m.SettingsPageComponent),
    }
];