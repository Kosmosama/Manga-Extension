import { Component, computed, DestroyRef, inject, input, model, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { debounceTime, finalize, switchMap } from 'rxjs/operators';
import { Manga } from '../../../core/interfaces/manga.interface';
import { Theme } from '../../../core/interfaces/theme.interface';
import { MangaService } from '../../../core/services/manga.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
    selector: 'manga-card',
    imports: [TranslocoPipe],
    templateUrl: './manga-card.component.html',
    styleUrl: './manga-card.component.css'
})
export class MangaComponent {
    private mangaService = inject(MangaService);
    private destroyRef = inject(DestroyRef);
    private themeService = inject(ThemeService);

    manga = model.required<Manga>();

    private chapterChangeSubject = new Subject<void>();
    saving = signal(false);

    deleted = output<number>(); // Emit the ID of the deleted manga
    handleEdit = input.required<(manga: Manga) => void>();

    isImageValid = signal<boolean>(true);

    fallbackImage = computed(() => {
        return this.themeService.theme === Theme.Dark
            ? 'assets/fallback-images/dark-mode-fallback.svg'
            : 'assets/fallback-images/light-mode-fallback.svg';
    });

    constructor() {
        // Batch chapter updates and persist after a short debounce
        this.chapterChangeSubject
            .pipe(
                debounceTime(250),
                switchMap(() => {
                    this.saving.set(true);
                    const finalChapters = this.manga().chapters;
                    return this.mangaService.updateChapters(this.manga().id, finalChapters).pipe(
                        finalize(() => this.saving.set(false))
                    );
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => { });
    }

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
        this.chapterChangeSubject.next();
    }

    /**
     * On image error, first fall back to themed image.
     */
    imageNotFound() {
        this.isImageValid.set(false);
    }
}