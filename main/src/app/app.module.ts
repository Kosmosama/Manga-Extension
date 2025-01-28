import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DATABASE_CONNECTION } from '../shared/tokens/database.token';
import { initializeDatabase } from '../shared/config/database.config';
import { MANGA_REPOSITORY } from '../shared/tokens/manga.token';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
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
