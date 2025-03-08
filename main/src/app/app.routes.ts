import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: "", redirectTo: "/ejemplo", pathMatch: "full"},
    { path: "ejemplo", loadChildren: () => import("./ejemplo/ejemplo.routes").then(c => c.ejemploRoutes) },
    { path: "mangas", loadChildren: () => import("./manga/manga.routes").then(c => c.mangaRoutes) },
    { path: "settings", loadChildren: () => import("./settings/settings.routes").then(c => c.settingsRoutes) },

    { path: '**', redirectTo: '/ejemplo' },
];