import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DATABASE_CONNECTION } from './shared/tokens/database.token';
import { initializeDatabase } from './shared/config/database.config';
import { BrowserModule } from '@angular/platform-browser';
import { MANGA_REPOSITORY } from './shared/tokens/manga.token';
import { MangaRepository } from './repositories/manga.repository';
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
        {
            provide: MANGA_REPOSITORY,
            useClass: MangaRepository
        },
    ]
})
export class AppModule { }
