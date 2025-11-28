import { Component, computed, DestroyRef, effect, inject, input, model, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs/operators';
import { LazyImageDirective } from '../../../core/directives/lazy-image.directive';
import { Manga } from '../../../core/interfaces/manga.interface';
import { Theme } from '../../../core/interfaces/theme.interface';
import { ConfirmService } from '../../../core/services/confirm.service';
import { MangaService } from '../../../core/services/manga.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'manga-card',
    imports: [TranslocoPipe, LazyImageDirective],
    templateUrl: './manga-card.component.html',
    styleUrl: './manga-card.component.css'
})
export class MangaComponent {
    private mangaService = inject(MangaService);
    private themeService = inject(ThemeService);
    private confirmService = inject(ConfirmService);
    private toastService = inject(ToastService);
    private destroyRef = inject(DestroyRef);

    manga = model.required<Manga>();
    tabIndexValue = input<number>(-1);
    focused = input<boolean>(false);
    handleEdit = input.required<(manga: Manga) => void>();
    deleted = output<number>();

    isImageValid = signal(true);
    imageLoading = signal(true);
    saving = signal(false);

    private chapterDirty = signal<number | null>(null);
    private chapterUpdateTimer: any = null;

    fallbackImage = computed(() =>
        this.themeService.theme === Theme.Dark
            ? 'assets/fallback-images/dark-mode-fallback.svg'
            : 'assets/fallback-images/light-mode-fallback.svg'
    );

    constructor() {
        // Automatic debounced chapter sync effect
        effect(() => {
            const dirty = this.chapterDirty();

            if (dirty === null) return;

            clearTimeout(this.chapterUpdateTimer);

            this.chapterUpdateTimer = setTimeout(() => {
                this.saveChapters();
            }, 250);
        });
    }

    /**
     * Saves the chapter count for the current manga.
     * Triggered automatically by a debounced signal when the chapter count changes.
     */
    private saveChapters() {
        const manga = this.manga();
        const chapters = manga.chapters;

        this.saving.set(true);

        this.mangaService.updateChapters(manga.id, chapters)
            .pipe(finalize(() => this.saving.set(false)))
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => this.chapterDirty.set(null),
                error: () => {
                    this.toastService.error('toasts.error.generic');
                    this.chapterDirty.set(null);
                }
            });
    }

    /**
     * Opens a confirmation modal and deletes the manga if the user confirms.
     * Emits the deleted manga ID when successful.
     */
    deleteManga() {
        const m = this.manga();

        this.confirmService
            .confirm$(
                'modal.delete.title',
                'modal.delete.message',
                { title: m.title },
                'common.delete',
                'common.cancel'
            )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(confirmed => {
                if (!confirmed) return;

                this.mangaService.deleteManga(m.id)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                        next: () => {
                            this.toastService.success('toasts.manga.deleted', { title: m.title });
                            this.deleted.emit(m.id);
                        },
                        error: () => this.toastService.error('toasts.error.generic')
                    });
            });
    }

    /**
     * Triggers the edit handler provided by the parent component.
     */
    editManga() {
        this.handleEdit()(this.manga());
    }

    /**
     * Toggles the favorite status of the manga.
     * Displays appropriate success or error messages based on the result.
     */
    toggleFavorite() {
        const m = this.manga();
        const previous = m.isFavorite;

        this.manga.update(c => ({ ...c, isFavorite: !c.isFavorite }));

        this.mangaService.toggleFavorite(m.id, previous)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    const nowFav = this.manga().isFavorite;
                    this.toastService.info(
                        nowFav ? 'toasts.manga.favorited' : 'toasts.manga.unfavorited',
                        { title: m.title }
                    );
                },
                error: () => {
                    this.manga.update(c => ({ ...c, isFavorite: previous }));
                    this.toastService.error('toasts.error.generic');
                }
            });
    }

    /**
     * Updates the chapter count by a given value.
     * Marks the chapter count as dirty for debounced syncing.
     * @param change Amount to change the chapter count by (defaults to +1).
     */
    updateChapters(change = 1) {
        const m = this.manga();
        const updated = m.chapters + change;
        if (updated < 0) return;

        this.manga.update(c => ({ ...c, chapters: updated }));
        this.chapterDirty.set(updated);
    }

    /**
     * Marks the manga thumbnail image as invalid and stops the loading state.
     * Called when the image fails to load.
     */
    imageNotFound() {
        this.isImageValid.set(false);
        this.imageLoading.set(false);
    }

    /**
     * Marks the thumbnail image as fully loaded.
     */
    imageLoaded() {
        this.imageLoading.set(false);
    }

    /**
     * Handles keyboard or UI-triggered card actions.
     * @param ev The card action event containing the action type.
     */
    onCardAction(ev: CustomEvent<'enter' | 'favorite' | 'increment' | 'decrement' | 'delete'>) {
        switch (ev.detail) {
            case 'enter':
                this.editManga();
                break;
            case 'favorite':
                this.toggleFavorite();
                break;
            case 'increment':
                this.updateChapters(1);
                break;
            case 'decrement':
                this.updateChapters(-1);
                break;
            case 'delete':
                this.deleteManga();
                break;
        }
    }
}