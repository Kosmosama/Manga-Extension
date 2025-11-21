import { Component, inject, signal, viewChild, effect, DestroyRef, computed } from '@angular/core';
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
import { SkeletonComponent } from '../../../shared/skeleton/skeleton.component';

@Component({
    selector: 'mangas-page',
    standalone: true,
    imports: [
        TranslocoPipe,
        ModalComponent,
        MangaComponent,
        MangaFormComponent,
        TagFilterBarComponent,
        SkeletonComponent
    ],
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
    viewMode = signal<'grid' | 'list'>('grid');

    loading = signal<boolean>(false);

    private searchInput$ = new Subject<string>();

    readonly hasResults = computed(() => this.mangaList().length > 0);

    constructor() {
        const qp = this.route.snapshot.queryParamMap;
        const initialQ = qp.get('q') || '';
        const initialSort = (qp.get('sort') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';
        this.searchQuery.set(initialQ);
        this.sortOrder.set(initialSort);

        // Debounced search
        this.searchInput$
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe(value => {
                this.searchQuery.set(value);
                this.reload();
                this.syncQueryParams();
            });

        // Sort effect
        effect(() => {
            this.sortOrder();
            this.reload();
            this.syncQueryParams();
        });

        // Tag filter effect
        effect(() => {
            this.tagFilterService.selectedTagIds();
            this.tagFilterService.includeMode();
            this.reload();
        });

        this.reload();
    }

    /**
     * Fetches mangas applying search, tags, mode, and sort signals.
     * Sets loading state while awaiting results.
     */
    private reload(): void {
        this.loading.set(true);
        this.mangaService
            .getAllMangas({
                search: this.searchQuery(),
                sortBy: 'title',
                order: this.sortOrder(),
                includeTags: this.tagFilterService.selectedTagIds(),
                includeTagsMode: this.tagFilterService.includeMode()
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: mangas => this.mangaList.set(mangas),
                complete: () => this.loading.set(false)
            });
    }

    /**
     * Handles raw search input (debounced pipeline).
     */
    onSearchInput(value: string) {
        this.searchInput$.next(value);
    }

    /**
     * Clears current search query if present.
     */
    clearSearch() {
        if (!this.searchQuery()) return;
        this.searchInput$.next('');
    }

    /**
     * Toggles sort order.
     */
    toggleSort() {
        this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    }

    /**
     * Switches between grid and list layout view modes.
     */
    toggleViewMode() {
        this.viewMode.update(m => (m === 'grid' ? 'list' : 'grid'));
    }

    /**
     * Removes deleted manga from local signal state.
     */
    handleMangaDeletion(id: number) {
        this.mangaList.update(mangas => mangas.filter(m => m.id !== id));
    }

    /**
     * Opens add/edit form in main modal (add when null).
     */
    openForm(manga?: Manga) {
        this.selectedManga.set(manga || null);
        this.modal().open();
    }

    /**
     * Called by card to open edit modal.
     */
    handleEdit = (manga: Manga) => {
        this.selectedManga.set(manga);
        this.editModal().open();
    };

    /**
     * Upserts a manga into the current displayed list after form submission.
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
     * Synchronizes query params for search & sort.
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