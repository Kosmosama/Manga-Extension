import { Component, inject, signal, viewChild, effect, DestroyRef } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { MangaFormComponent } from '../manga-form/manga-form.component';
import { MangaComponent } from '../manga-card/manga-card.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { MangaService } from '../../../core/services/manga.service';
import { Manga } from '../../../core/interfaces/manga.interface';
import { ThemeService } from '../../../core/services/theme.service';
import { Theme } from '../../../core/interfaces/theme.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TagFilterBarComponent } from '../../tags/tag-filter-bar/tag-filter-bar.component';
import { TagFilterService } from '../../../core/services/tag-filter.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'mangas-page',
    standalone: true,
    imports: [TranslocoPipe, ModalComponent, MangaComponent, MangaFormComponent, TagFilterBarComponent],
    templateUrl: './mangas-page.component.html',
    styleUrl: './mangas-page.component.css',
})
export class MangasPageComponent {
    private mangaService = inject(MangaService);
    private themeService = inject(ThemeService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private tagFilterService = inject(TagFilterService);
    private destroyRef = inject(DestroyRef);

    modal = viewChild.required<ModalComponent>('modal');
    editModal = viewChild.required<ModalComponent>('editModal');

    selectedManga = signal<Manga | null>(null);
    mangaList = signal<Manga[]>([]);
    theme = signal<Theme>(this.themeService.theme);
    searchQuery = signal<string>('');
    sortOrder = signal<'asc' | 'desc'>('asc');

    private searchInput$ = new Subject<string>();

    constructor() {
        const qp = this.route.snapshot.queryParamMap;
        const initialQ = qp.get('q') || '';
        const initialSort = (qp.get('sort') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';
        this.searchQuery.set(initialQ);
        this.sortOrder.set(initialSort);

        // Debounced search input
        this.searchInput$
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(value => {
                this.searchQuery.set(value);
                this.reload();
                this.syncQueryParams();
            });

        // React to sort changes
        effect(() => {
            this.sortOrder();
            this.reload();
            this.syncQueryParams();
        });

        // React to tag filter changes (selected tags or mode)
        effect(() => {
            this.tagFilterService.selectedTagIds();
            this.tagFilterService.includeMode();
            this.reload();
        });

        this.reload();
    }

    /**
     * Re-fetches mangas based on current search, sort, and tag filters.
     */
    private reload(): void {
        this.mangaService
            .getAllMangas({
                search: this.searchQuery(),
                sortBy: 'title',
                order: this.sortOrder(),
                includeTags: this.tagFilterService.selectedTagIds(),
                includeTagsMode: this.tagFilterService.includeMode()
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(mangas => this.mangaList.set(mangas));
    }

    /**
     * Handles input events from search box (debounced pipeline).
     *
     * @param value New raw search string
     */
    onSearchInput(value: string) {
        this.searchInput$.next(value);
    }

    /**
     * Clears current search query.
     */
    clearSearch() {
        if (!this.searchQuery()) return;
        this.searchInput$.next('');
    }

    /**
     * Toggles sort order between ascending and descending.
     */
    toggleSort() {
        this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    }

    /**
     * Removes a deleted manga from local list state.
     *
     * @param id Manga ID
     */
    handleMangaDeletion(id: number) {
        this.mangaList.update(mangas => mangas.filter(m => m.id !== id));
    }

    /**
     * Opens creation form (modal).
     *
     * @param manga Optional existing manga to prefill (ignored here for creation)
     */
    openForm(manga?: Manga) {
        this.selectedManga.set(manga || null);
        this.modal().open();
    }

    /**
     * Triggers the edit modal for the given manga.
     */
    handleEdit = (manga: Manga) => {
        this.selectedManga.set(manga);
        this.editModal().open();
    };

    /**
     * Updates local list after form submission (add or edit).
     *
     * @param manga The upserted manga entity
     */
    handleFormSumbission(manga: Manga) {
        this.mangaList.update(mangas => {
            const index = mangas.findIndex(m => m.id === manga.id);
            if (index === -1) {
                return [...mangas, manga];
            } else {
                const next = [...mangas];
                next[index] = manga;
                return next;
            }
        });
    }

    /**
     * Syncs query params (search & sort) to the current route.
     */
    private syncQueryParams() {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                q: this.searchQuery() || null,
                sort: this.sortOrder()
            },
            queryParamsHandling: 'merge'
        });
    }
}