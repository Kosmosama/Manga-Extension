import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: "", redirectTo: "/mangas", pathMatch: "full"},
    
    { path: "mangas", loadChildren: () => import("./features/mangas/manga.routes").then(c => c.mangaRoutes) },
    { path: "settings", loadChildren: () => import("./features/settings/settings.routes").then(c => c.settingsRoutes) },

    { path: '**', redirectTo: '/mangas' },
];