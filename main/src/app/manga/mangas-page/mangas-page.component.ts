import { MangaFilters } from './../../shared/interfaces/filters.interface';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Manga } from '../../shared/interfaces/manga.interface';
import { Tag } from '../../shared/interfaces/tag.interface';
import { MangaService } from '../services/manga.service';
import { TagService } from '../services/tag.service';
import { MangaComponent } from '../manga/manga.component';

@Component({
    selector: 'mangas-page',
    imports: [ReactiveFormsModule, MangaComponent],
    templateUrl: './mangas-page.component.html',
    styleUrl: './mangas-page.component.css'
})
export class MangasPageComponent implements OnInit {
    private mangaService = inject(MangaService);

    mangaList = signal<Manga[]>([]);

    ngOnInit() {
        effect(() => {
            this.mangaService.getAllMangas().subscribe(mangas => this.mangaList.set(mangas));
            console.log("Mangas were fetched");
        });
    }

    /**
     * Deletes a manga by ID from the list.
     * 
     * @param id The ID of the manga to delete.
     */
    handleMangaDeletion(id: number) {
        this.mangaList.update((mangas) => mangas.filter(manga => manga.id !== id));
    }
}
