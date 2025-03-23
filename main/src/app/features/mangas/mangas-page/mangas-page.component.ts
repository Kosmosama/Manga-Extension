import { Component, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MangaFormComponent } from "../manga-form/manga-form.component";
import { MangaComponent } from '../manga-card/manga-card.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { MangaService } from '../../../core/services/manga.service';
import { Manga } from '../../../core/interfaces/manga.interface';
import { themeChange } from 'theme-change'

@Component({
    selector: 'mangas-page',
    imports: [ReactiveFormsModule, ModalComponent, MangaComponent, MangaFormComponent],
    templateUrl: './mangas-page.component.html',
    styleUrl: './mangas-page.component.css'
})
export class MangasPageComponent implements OnInit {
    private mangaService = inject(MangaService);

    modal = viewChild.required<ModalComponent>('modal');

    mangaList = signal<Manga[]>([]);
    selectedManga = signal<Manga | null>(null);

    ngOnInit() {
        effect(() => {
            this.mangaService.getAllMangas().subscribe(mangas => this.mangaList.set(mangas));
            console.log("Mangas were fetched");
        });
    }
    
    themeChange() {
        themeChange();
    }

    /**
     * Deletes a manga by ID from the list.
     * 
     * @param id The ID of the manga to delete.
     */
    handleMangaDeletion(id: number) {
        this.mangaList.update((mangas) => mangas.filter(manga => manga.id !== id));
    }

    /**
     * Opens the modal to create or edit a manga.
     */
    openForm(manga?: Manga) {
        this.selectedManga.set(manga || null);
        this.modal().open();
    }

    /**
     * Handles the form submission.
     * 
     * @param manga The manga to add or update.
     */
    handleFormSumbission(manga: Manga) {
        this.mangaList.update((mangas) => {
            const index = mangas.findIndex(m => m.id === manga.id);
            if (index === -1) {
                return [...mangas, manga];
            } else {
                mangas[index] = manga;
                return mangas;
            }
        });
    }
}
