import { Component, computed, DestroyRef, inject, input, model, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { debounceTime, finalize, switchMap } from 'rxjs/operators';
import { Manga } from '../../../core/interfaces/manga.interface';
import { Theme } from '../../../core/interfaces/theme.interface';
import { MangaService } from '../../../core/services/manga.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';

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
    private confirmService = inject(ConfirmService);
    private toastService = inject(ToastService);

    manga = model.required<Manga>();

    private chapterChangeSubject = new Subject<void>();
    saving = signal(false);

    deleted = output<number>();
    handleEdit = input.required<(manga: Manga) => void>();

    isImageValid = signal<boolean>(true);
    imageLoading = signal<boolean>(true);

    fallbackImage = computed(() => {
        return this.themeService.theme === Theme.Dark
            ? 'assets/fallback-images/dark-mode-fallback.svg'
            : 'assets/fallback-images/light-mode-fallback.svg';
    });

    constructor() {
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
        const m = this.manga();
        this.confirmService
            .confirm$('modal.delete.title', 'modal.delete.message', { title: m.title }, 'common.delete', 'common.cancel')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
                if (!confirmed) return;
                this.mangaService
                    .deleteManga(m.id)
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

    editManga() {
        this.handleEdit()(this.manga());
    }

    toggleFavorite() {
        const current = this.manga();
        const prev = current.isFavorite;
        this.manga.update(c => ({ ...c, isFavorite: !c.isFavorite }));
        this.mangaService
            .toggleFavorite(current.id, prev)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    const nowFav = this.manga().isFavorite;
                    this.toastService.info(nowFav ? 'toasts.manga.favorited' : 'toasts.manga.unfavorited', { title: current.title });
                },
                error: () => {
                    this.manga.update(c => ({ ...c, isFavorite: prev }));
                    this.toastService.error('toasts.error.generic');
                }
            });
    }

    /**
     * Updates the chapters of the current manga.
     *
     * @param change The increment or decrement to chapter count.
     */
    updateChapters(change: number = 1) {
        const currentChapters = this.manga().chapters;
        if (currentChapters + change < 0) return;
        this.manga.update(m => ({ ...m, chapters: m.chapters + change }));
        this.chapterChangeSubject.next();
    }

    /**
     * Called when the main cover image fails to load.
     * Switches to themed fallback.
     */
    imageNotFound() {
        this.isImageValid.set(false);
        this.imageLoading.set(false);
    }

    /**
     * Called when the image finishes loading successfully.
     */
    imageLoaded() {
        this.imageLoading.set(false);
    }

    /**
     * Retries loading the original image (only if it previously failed).
     */
    retryImage() {
        if (!this.isImageValid()) return;
        this.imageLoading.set(true);
    }
}