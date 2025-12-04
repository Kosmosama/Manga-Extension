import { Routes } from '@angular/router';
import { MangasPageComponent } from './features/mangas/mangas-page/mangas-page.component';
import { SettingsPageComponent } from './features/settings/settings-page/settings-page.component';

export const routes: Routes = [
    { path: '', component: MangasPageComponent },
    { path: 'settings', component: SettingsPageComponent },
];
