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

    focusIndex = signal<number>(-1); // -1 means none focused yet
    readonly effectiveCollectionRole = computed(() => this.viewMode() === 'grid' ? 'grid' : 'list');

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

        // Sort changes
        effect(() => {
            this.sortOrder();
            this.reload();
            this.syncQueryParams();
        });

        // Tag filter changes
        effect(() => {
            this.tagFilterService.selectedTagIds();
            this.tagFilterService.includeMode();
            this.reload();
        });

        // Reset focus index when view mode changes
        effect(() => {
            this.viewMode();
            this.resetFocus();
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
                next: mangas => {
                    this.mangaList.set(mangas);
                    // Keep focusIndex within bounds
                    if (this.focusIndex() >= mangas.length) {
                        this.focusIndex.set(mangas.length - 1);
                    }
                },
                complete: () => this.loading.set(false)
            });
    }

    onSearchInput(value: string) {
        this.searchInput$.next(value);
    }

    clearSearch() {
        if (!this.searchQuery()) return;
        this.searchInput$.next('');
    }

    toggleSort() {
        this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    }

    toggleViewMode() {
        this.viewMode.update(m => (m === 'grid' ? 'list' : 'grid'));
    }

    handleMangaDeletion(id: number) {
        this.mangaList.update(mangas => mangas.filter(m => m.id !== id));
        const list = this.mangaList();
        if (!list.length) {
            this.focusIndex.set(-1);
        } else if (this.focusIndex() >= list.length) {
            this.focusIndex.set(list.length - 1);
            this.focusCard(this.focusIndex());
        }
    }

    openForm(manga?: Manga) {
        this.selectedManga.set(manga || null);
        this.modal().open();
    }

    handleEdit = (manga: Manga) => {
        this.selectedManga.set(manga);
        this.editModal().open();
    };

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

    /**
     * Keyboard navigation handler attached to collection container.
     * Supports Arrow navigation, Home/End, Enter/F/+/-/Delete forwarded to card via dispatch.
     */
    onCollectionKeydown(ev: KeyboardEvent) {
        if (!this.hasResults() || this.loading()) return;

        const total = this.mangaList().length;
        let idx = this.focusIndex();

        if (idx === -1 && ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(ev.key)) {
            idx = 0;
            this.focusIndex.set(idx);
            this.focusCard(idx);
            ev.preventDefault();
            return;
        }

        const isGrid = this.viewMode() === 'grid';
        const columns = isGrid ? this.computeApproxColumns() : 1;

        switch (ev.key) {
            case 'ArrowRight':
                if (isGrid) {
                    if (idx + 1 < total) { this.moveFocus(idx + 1); ev.preventDefault(); }
                } else {
                }
                break;
            case 'ArrowLeft':
                if (isGrid && idx - 1 >= 0) { this.moveFocus(idx - 1); ev.preventDefault(); }
                break;
            case 'ArrowDown':
                if (isGrid) {
                    const next = idx + columns;
                    if (next < total) { this.moveFocus(next); ev.preventDefault(); }
                } else {
                    if (idx + 1 < total) { this.moveFocus(idx + 1); ev.preventDefault(); }
                }
                break;
            case 'ArrowUp':
                if (isGrid) {
                    const prev = idx - columns;
                    if (prev >= 0) { this.moveFocus(prev); ev.preventDefault(); }
                } else {
                    if (idx - 1 >= 0) { this.moveFocus(idx - 1); ev.preventDefault(); }
                }
                break;
            case 'Home':
                this.moveFocus(0);
                ev.preventDefault();
                break;
            case 'End':
                this.moveFocus(total - 1);
                ev.preventDefault();
                break;
            case 'Enter':
                this.dispatchCardAction(idx, 'enter');
                ev.preventDefault();
                break;
            case 'f':
            case 'F':
                this.dispatchCardAction(idx, 'favorite');
                ev.preventDefault();
                break;
            case '+':
            case '=':
                this.dispatchCardAction(idx, 'increment');
                ev.preventDefault();
                break;
            case '-':
                this.dispatchCardAction(idx, 'decrement');
                ev.preventDefault();
                break;
            case 'Delete':
                this.dispatchCardAction(idx, 'delete');
                ev.preventDefault();
                break;
            default:
                break;
        }
    }

    /**
     * Approximate number of columns for grid navigation based on card width.
     * Simplistic: calculates container width / 260 (min card width).
     */
    private computeApproxColumns(): number {
        const container = document.querySelector('.manga-collection');
        if (!container) return 1;
        const width = container.clientWidth;
        return Math.max(1, Math.floor(width / 260));
    }

    private moveFocus(nextIndex: number) {
        this.focusIndex.set(nextIndex);
        this.focusCard(nextIndex);
    }

    private focusCard(index: number) {
        const el = document.querySelector<HTMLElement>(`.manga-collection [data-card-index="${index}"]`);
        el?.focus();
    }

    private resetFocus() {
        this.focusIndex.set(-1);
    }

    /**
     * Dispatches an action to a focused manga card by sending a custom event the card listens to.
     * Card implements key-based actions internally.
     */
    private dispatchCardAction(index: number, action: 'enter' | 'favorite' | 'increment' | 'decrement' | 'delete') {
        if (index < 0) return;
        const el = document.querySelector<HTMLElement>(`.manga-collection [data-card-index="${index}"]`);
        if (!el) return;
        el.dispatchEvent(new CustomEvent('cardAction', { detail: action, bubbles: true }));
    }
}