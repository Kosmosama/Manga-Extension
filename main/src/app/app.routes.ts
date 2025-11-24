import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/mangas', pathMatch: 'full' },

    { path: 'mangas', loadChildren: () => import('./features/mangas/manga.routes').then(c => c.mangaRoutes) },
    { path: 'settings', loadChildren: () => import('./features/settings/settings.routes').then(c => c.settingsRoutes) },
    { path: 'tags', loadChildren: () => import('./features/tags/tag.routes').then(c => c.tagRoutes) },
    { path: 'import-export', loadChildren: () => import('./features/import-export/import-export.routes').then(m => m.importExportRoutes) },
    { path: 'shortcuts-help', loadChildren: () => import('./features/shortcuts/shortcuts.routes').then(m => m.shortcutRoutes) },

    { path: '**', redirectTo: '/mangas' },
];