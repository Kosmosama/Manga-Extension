import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DATABASE_CONNECTION } from './shared/tokens/database.token';
import { initializeDatabase } from './shared/config/database.config';
import { TAG_REPOSITORY } from './shared/tokens/tags.token';
import { TagRepository } from './repositories/tag.repository';
import { MANGA_REPOSITORY } from './shared/tokens/manga.token';
import { MangaRepository } from './repositories/manga.repository';
import { MangaService } from './manga/services/manga.service';
import { TagService } from './tag/services/tag.service';

@NgModule({
    imports: [BrowserModule],
    providers: [
        {
            provide: DATABASE_CONNECTION,
            useFactory: async () => {
                return await initializeDatabase();
            }
        },
        {
            provide: TAG_REPOSITORY,
            useClass: TagRepository
        },
        TagService,
        {
            provide: MANGA_REPOSITORY,
            useClass: MangaRepository
        },
        MangaService
    ]
})
export class AppModule { }
