import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: "", redirectTo: "/mangas", pathMatch: "full"},
    
    { path: "settings", loadChildren: () => import("./features/mangas/manga.routes").then(c => c.mangaRoutes) },
    { path: "mangas", loadChildren: () => import("./features/settings/settings.routes").then(c => c.settingsRoutes) },
    { path: "tags", loadChildren: () => import("./features/tags/tag.routes").then(c => c.tagRoutes) },

    { path: '**', redirectTo: '/mangas' },
];