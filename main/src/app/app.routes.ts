import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: "", redirectTo: "/theme", pathMatch: "full"},
    
    { path: "mangas", loadChildren: () => import("./features/mangas/manga.routes").then(c => c.mangaRoutes) },
    { path: "settings", loadChildren: () => import("./features/settings/settings.routes").then(c => c.settingsRoutes) },
    { path: "tags", loadChildren: () => import("./features/tags/tag.routes").then(c => c.tagRoutes) },
    { path: "theme", loadChildren: () => import("./features/theme-handle/theme-handle.routes").then(c => c.themeRoutes) },

    { path: '**', redirectTo: '/mangas' },
];