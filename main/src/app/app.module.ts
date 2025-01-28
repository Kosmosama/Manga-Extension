import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DATABASE_CONNECTION } from './shared/tokens/database.token';
import { initializeDatabase } from './shared/config/database.config';
import { BrowserModule } from '@angular/platform-browser';
@NgModule({
    declarations: [],
    imports: [BrowserModule],
    providers: [
        {
            provide: DATABASE_CONNECTION,
            useFactory: async () => {
                return await initializeDatabase();
            }
        },
        /*{
            provide: MANGA_REPOSITORY,
            useClass: MangaRepository <-- #TODO
        },
        MangaService <--- #TODO
        */
    ]
})
export class AppModule { }
