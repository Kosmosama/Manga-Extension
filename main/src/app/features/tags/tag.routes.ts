import { Routes } from "@angular/router";

export const tagRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./tags-page/tags-page.component').then(m => m.TagsPageComponent),
    }
];