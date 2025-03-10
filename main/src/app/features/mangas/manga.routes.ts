import { Routes } from "@angular/router";

export const mangaRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./mangas-page/mangas-page.component').then(m => m.MangasPageComponent),
    }
];