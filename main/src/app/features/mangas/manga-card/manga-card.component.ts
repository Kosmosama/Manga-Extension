import { Component, computed, DestroyRef, inject, input, model, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, Subject } from 'rxjs';
import { Manga } from '../../../core/interfaces/manga.interface';
import { Theme } from '../../../core/interfaces/theme.interface';
import { MangaService } from '../../../core/services/manga.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
    selector: 'manga-card',
    imports: [],
    templateUrl: './manga-card.component.html',
    styleUrl: './manga-card.component.css'
})
export class MangaComponent {
    private mangaService = inject(MangaService);
    private destroyRef = inject(DestroyRef);
    private themeService = inject(ThemeService)

    // #TODO Handle edit modal - maybe move it to mangas-page and pass the function as a prop? 

    manga = model.required<Manga>();

    private chapterChangeSubject = new Subject<number>();
    private pendingChapterChange = 0;

    deleted = output<number>(); // Emit the ID of the deleted manga
    handleEdit = input.required<(manga: Manga) => void>();

    // #TODO Implement (error)="imageNotFound()" in the img tag in the template 
    isImageValid = signal<boolean>(true);

    fallbackImage = computed(() =>
        this.themeService.theme === Theme.Dark
            ? 'assets/fallback-images/dark-mode-fallback.svg'
            : 'assets/fallback-images/light-mode-fallback.svg'
    );

    constructor() {
        this.chapterChangeSubject
            .pipe(
                map(() => {
                    const finalChapters = this.manga().chapters + this.pendingChapterChange;
                    const updateObservable = this.mangaService.updateChapters(this.manga().id, finalChapters);

                    this.pendingChapterChange = 0;
                    return updateObservable;
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => { });
    }

    /**
     * Deletes the current manga by its ID and emits the deleted event.
     */
    deleteManga() {
        this.mangaService
            .deleteManga(this.manga().id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.deleted.emit(this.manga().id));
    }

    // #TODO Create and implement modal to edit manga, open it here
    editManga() {
        this.handleEdit()(this.manga());
    }

    /**
     * Toggles the favorite status of the current manga.
     */
    toggleFavorite() {
        this.mangaService
            .toggleFavorite(this.manga().id, this.manga().isFavorite)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.manga.update(currentManga => ({
                    ...currentManga,
                    isFavorite: !currentManga.isFavorite
                }));
            });
    }

    /**
     * Updates the chapters of the current manga.
     * 
     * @param change - The increment or decrement to chapter count.
     */
    updateChapters(change: number = 1) {
        const currentChapters = this.manga().chapters;
        if (currentChapters + change < 0) {
            return;
        }

        this.manga.update(m => ({ ...m, chapters: m.chapters + change }));

        // this.pendingChapterChange += change; 
        this.chapterChangeSubject.next(Date.now());
    }

    /**
     * Handles the event when an image is not found.
     * Sets the error state to true.
     */
    imageNotFound() {
        this.isImageValid.set(false);
    }
}