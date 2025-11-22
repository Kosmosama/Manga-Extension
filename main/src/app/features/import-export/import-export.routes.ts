import { Routes } from '@angular/router';

export const importExportRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./import-export-page/import-export-page.component').then(m => m.ImportExportPageComponent)
    }
];