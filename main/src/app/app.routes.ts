import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: "", redirectTo: "/mangas", pathMatch: "full"},
    
    { path: "mangas", loadChildren: () => import("./manga/manga.routes").then(c => c.mangaRoutes) },
    { path: "settings", loadChildren: () => import("./settings/settings.routes").then(c => c.settingsRoutes) },

    { path: '**', redirectTo: '/mangas' },
];