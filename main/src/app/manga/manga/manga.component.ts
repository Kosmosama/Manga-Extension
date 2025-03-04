import { ChangeDetectorRef, Component, computed, DestroyRef, inject, model, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Manga } from '../../shared/interfaces/manga.interface';
import { MangaService } from '../services/manga.service';
import { map, Subject } from 'rxjs';
import { ThemeService } from '../../settings/services/theme.service';
import { Theme } from '../../shared/interfaces/theme.interface';

@Component({
    selector: 'manga-card',
    imports: [],
    templateUrl: './manga.component.html',
    styleUrl: './manga.component.css'
})
export class MangaComponent {
    private mangaService = inject(MangaService);
    private destroyRef = inject(DestroyRef);
    private cdr = inject(ChangeDetectorRef);
    private themeService = inject(ThemeService)
    
    manga = model.required<Manga>();

    private chapterChangeSubject = new Subject<number>();
    private pendingChapterChange = 0;

    deleted = output<number>(); // Emit the ID of the deleted manga

    // #TODO Implement (error)="imageNotFound()" in the img tag in the template 
    isImageValid = signal<boolean>(true);

    fallbackImage = computed(() =>
        this.themeService.theme === Theme.Dark
            ? 'public/fallback-images/dark-mode-fallback.png'
            : 'public/fallback-images/light-mode-fallback.png'
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
            .subscribe(() => {});
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
        console.log(`Editing manga: ${this.manga().title}`);

        const newTestManga: Manga = {
            ...this.manga(),
        };

        this.manga.set(newTestManga);
    }

    /**
     * Toggles the favorite status of the current manga.
     */
    toggleFavorite() {
        this.mangaService
            .toggleFavorite(this.manga().id, this.manga().isFavorite)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.manga().isFavorite = !this.manga().isFavorite;
                // this.cdr.detectChanges(); In case favorite icon is not updated
            });
    }

    /**
     * Updates the chapters of the current manga.
     * 
     * @param change - The increment or decrement to chapter count.
     */
    updateChapters(change: number = 1) {
        if (this.manga().chapters + change < 0) {
            // #MAYBE Shake -chapter button
            return;
        }

        this.manga().chapters += change;
        // this.cdr.detectChanges(); In case chapter count is not updated

        this.pendingChapterChange += change;
        this.chapterChangeSubject.next(this.pendingChapterChange);
    }        

    /**
     * Handles the event when an image is not found.
     * Sets the error state to true.
     */
    imageNotFound() {
        this.isImageValid.set(false);
    }
}
