import { Routes } from "@angular/router";

export const themeRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./theme-handle.component').then(m => m.ThemeHandleComponent),
    }
];