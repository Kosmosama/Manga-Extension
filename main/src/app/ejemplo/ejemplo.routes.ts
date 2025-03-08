import { Routes } from "@angular/router";

export const ejemploRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./ejemplo.component').then(m => m.EjemploComponent),
    }
];