import { Component, inject, signal, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { MangaFormComponent } from '../manga-form/manga-form.component';
import { MangaComponent } from '../manga-card/manga-card.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { MangaService } from '../../../core/services/manga.service';
import { Manga } from '../../../core/interfaces/manga.interface';
import { ThemeService } from '../../../core/services/theme.service';
import { Theme } from '../../../core/interfaces/theme.interface';

@Component({
    selector: 'mangas-page',
    standalone: true,
    imports: [TranslocoPipe, ModalComponent, MangaComponent, MangaFormComponent],
    templateUrl: './mangas-page.component.html',
    styleUrl: './mangas-page.component.css',
})
export class MangasPageComponent {
    private mangaService = inject(MangaService);
    private themeService = inject(ThemeService);

    modal = viewChild.required<ModalComponent>('modal');
    editModal = viewChild.required<ModalComponent>('editModal');

    selectedManga = signal<Manga | null>(null);
    mangaList = signal<Manga[]>([]);
    theme = signal<Theme>(this.themeService.theme);
    searchQuery = signal<string>('');
    sortOrder = signal<'asc' | 'desc'>('asc');

    /**
     * Lifecycle hook called on component initialization.
     * Loads initial manga list.
     */
    ngOnInit() {
        this.reload();
    }

    /**
     * Reloads the manga list from the service based on the search query and sort order.
     */
    private reload(): void {
        this.mangaService
            .listForMainPage(this.searchQuery(), this.sortOrder())
            .subscribe((mangas) => this.mangaList.set(mangas));
    }

    /**
     * Handles input changes in the search field and reloads the manga list.
     * @param value The new search term.
     */
    onSearchInput(value: string) {
        this.searchQuery.set(value);
        this.reload();
    }

    /**
     * Clears the search input and reloads the manga list if a query was present.
     */
    clearSearch() {
        if (!this.searchQuery()) return;
        this.searchQuery.set('');
        this.reload();
    }

    /**
     * Toggles the sorting order (ascending/descending) for manga titles and reloads the list.
     */
    toggleSort() {
        this.sortOrder.update((o) => (o === 'asc' ? 'desc' : 'asc'));
        this.reload();
    }

    /**
     * Removes a manga from the displayed list after deletion.
     * @param id ID of the deleted manga.
     */
    handleMangaDeletion(id: number) {
        this.mangaList.update((mangas) => mangas.filter((m) => m.id !== id));
    }

    /**
     * Opens the manga creation or edit form modal.
     * @param manga Optional manga to prefill the form for editing.
     */
    openForm(manga?: Manga) {
        this.selectedManga.set(manga || null);
        this.modal().open();
    }

    /**
     * Opens the edit modal for the provided manga.
     * @param manga Manga to edit.
     */
    handleEdit = (manga: Manga) => {
        this.selectedManga.set(manga);
        this.editModal().open();
    };

    /**
     * Updates the manga list after a form submission.
     * If the manga exists, it is updated; otherwise, it is added.
     * @param manga Submitted manga data.
     */
    handleFormSumbission(manga: Manga) {
        this.mangaList.update((mangas) => {
            const index = mangas.findIndex((m) => m.id === manga.id);
            if (index === -1) {
                return [...mangas, manga];
            } else {
                const next = [...mangas];
                next[index] = manga;
                return next;
            }
        });
    }
}
