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
import { ShortcutEngineService } from '../../../core/services/shortcut-engine.service';
import { ShortcutAction } from '../../../core/interfaces/shortcut.interface';
import { VirtualScrollContainerComponent } from '../../../shared/virtual-scroll-container/virtual-scroll-container.component';

@Component({
    selector: 'mangas-page',
    standalone: true,
    imports: [
        TranslocoPipe,
        ModalComponent,
        MangaComponent,
        MangaFormComponent,
        TagFilterBarComponent,
        SkeletonComponent,
        VirtualScrollContainerComponent
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
    private shortcutEngineService = inject(ShortcutEngineService);

    modal = viewChild.required<ModalComponent>('modal');
    editModal = viewChild.required<ModalComponent>('editModal');

    selectedManga = signal<Manga | null>(null);
    mangaList = signal<Manga[]>([]);
    theme = signal<Theme>(this.themeService.theme);

    searchQuery = signal<string>('');
    sortOrder = signal<'asc' | 'desc'>('asc');
    viewMode = signal<'grid' | 'list'>('grid');

    useVirtualScroll = signal<boolean>(false);
    loading = signal<boolean>(false);
    private searchInput$ = new Subject<string>();
    readonly hasResults = computed(() => this.mangaList().length > 0);

    focusIndex = signal<number>(-1);

    readonly effectiveCollectionRole = computed(() => this.viewMode() === 'grid' ? 'grid' : 'list');

    private VIRTUAL_THRESHOLD = 150;

    constructor() {
        // Initialize from query params
        const qp = this.route.snapshot.queryParamMap;
        const initialQ = qp.get('q') || '';
        const initialSort = (qp.get('sort') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';
        this.searchQuery.set(initialQ);
        this.sortOrder.set(initialSort);

        /** Debounced search flow */
        this.searchInput$
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe(value => {
                this.searchQuery.set(value);
                this.reload();
                this.syncQueryParams();
            });

        /** Sort changes automatically reload the list */
        effect(() => {
            this.sortOrder();
            this.reload();
            this.syncQueryParams();
        });

        /** Tag filter changes automatically reload results */
        effect(() => {
            this.tagFilterService.selectedTagIds();
            this.tagFilterService.includeMode();
            this.reload();
        });

        /**
         * When view mode changes:
         * - Reset keyboard focus
         * - Recalculate whether virtual scroll should be enabled
         */
        effect(() => {
            this.viewMode();
            this.resetFocus();
            this.assessVirtualScroll();
        });

        /**
         * Global keyboard shortcuts:
         * Triggered actions include: add manga, toggle view, open settings, etc.
         */
        this.shortcutEngineService.triggered$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(t => this.handleShortcut(t.action));

        // Initial load
        this.reload();
    }

    /**
     * Determines whether virtual scrolling should be enabled.
     * Only applies to grid mode with large collections.
     */
    private assessVirtualScroll() {
        const count = this.mangaList().length;
        this.useVirtualScroll.set(this.viewMode() === 'grid' && count > this.VIRTUAL_THRESHOLD);
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

                    // Keeping focusIndex within bounds after reload
                    if (this.focusIndex() >= mangas.length) {
                        this.focusIndex.set(mangas.length - 1);
                    }

                    // Reevaluate virtual scrolling after load
                    this.assessVirtualScroll();
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

    /**
     * Updates the list after deletion and adjusts focused index.
     */
    handleMangaDeletion(id: number) {
        this.mangaList.update(mangas => mangas.filter(m => m.id !== id));

        const list = this.mangaList();
        if (!list.length) {
            this.focusIndex.set(-1);
        } else if (this.focusIndex() >= list.length) {
            this.focusIndex.set(list.length - 1);
        }

        this.assessVirtualScroll();
    }

    /** Opens create form or edit form based on argument. */
    openForm(manga?: Manga) {
        this.selectedManga.set(manga || null);
        this.modal().open();
    }

    /** Opens edit form for a specific manga. */
    handleEdit = (manga: Manga) => {
        this.selectedManga.set(manga);
        this.editModal().open();
    };

    /**
     * Applies new or updated manga into the list.
     * Keeps list stable and re-evaluates virtual scroll.
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
        this.assessVirtualScroll();
    }

    /** Syncs URL query params with current search/sort signals. */
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
     * Supports Arrow navigation, Home/End, and grid row/column movement.
     */
    onCollectionKeydown(ev: KeyboardEvent) {
        if (!this.hasResults() || this.loading()) return;

        const total = this.mangaList().length;
        let idx = this.focusIndex();

        // If nothing is focused yet and navigation keys are pressed → focus first item
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
                if (isGrid && idx + 1 < total) { this.moveFocus(idx + 1); ev.preventDefault(); }
                break;

            case 'ArrowLeft':
                if (isGrid && idx - 1 >= 0) { this.moveFocus(idx - 1); ev.preventDefault(); }
                break;

            case 'ArrowDown':
                if (isGrid) {
                    const next = idx + columns;
                    if (next < total) { this.moveFocus(next); ev.preventDefault(); }
                } else if (idx + 1 < total) {
                    this.moveFocus(idx + 1); ev.preventDefault();
                }
                break;

            case 'ArrowUp':
                if (isGrid) {
                    const prev = idx - columns;
                    if (prev >= 0) { this.moveFocus(prev); ev.preventDefault(); }
                } else if (idx - 1 >= 0) {
                    this.moveFocus(idx - 1); ev.preventDefault();
                }
                break;

            case 'Home':
                this.moveFocus(0); ev.preventDefault();
                break;

            case 'End':
                this.moveFocus(total - 1); ev.preventDefault();
                break;

            default:
                break;
        }
    }

    /**
     * Approximate number of columns for grid navigation based on card width.
     * Uses container width / 260px as rough estimate.
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

    /** Focuses a given card via index and ensures it receives keyboard focus. */
    private focusCard(index: number) {
        const el = document.querySelector<HTMLElement>(`.manga-collection [data-card-index="${index}"]`);
        el?.focus();
    }

    /** Resets keyboard focus to "none selected". */
    private resetFocus() {
        this.focusIndex.set(-1);
    }

    /**
     * Handles global application shortcut actions.
     * Some actions operate on the list; others dispatch events to the currently focused card.
     */
    private handleShortcut(action: ShortcutAction) {
        switch (action) {
            case ShortcutAction.AddManga:
                this.openForm();
                break;

            case ShortcutAction.OpenSettings:
                this.router.navigate(['/settings']);
                break;

            case ShortcutAction.OpenImportExport:
                this.router.navigate(['/import-export']);
                break;

            case ShortcutAction.ToggleViewMode:
                this.toggleViewMode();
                break;

            case ShortcutAction.FocusSearch: {
                const input = document.querySelector<HTMLInputElement>('.search-input');
                input?.focus();
                break;
            }

            case ShortcutAction.OpenShortcutHelp:
                this.router.navigate(['/shortcuts-help']);
                break;

            default:
                // Actions applied to the currently focused card
                if (this.focusIndex() >= 0) {
                    const cardEl = document.querySelector<HTMLElement>(`.manga-collection [data-card-index="${this.focusIndex()}"]`);
                    if (!cardEl) return;

                    switch (action) {
                        case ShortcutAction.ToggleFavorite:
                            cardEl.dispatchEvent(new CustomEvent('cardAction', { detail: 'favorite', bubbles: true }));
                            break;
                        case ShortcutAction.IncrementChapters:
                            cardEl.dispatchEvent(new CustomEvent('cardAction', { detail: 'increment', bubbles: true }));
                            break;
                        case ShortcutAction.DecrementChapters:
                            cardEl.dispatchEvent(new CustomEvent('cardAction', { detail: 'decrement', bubbles: true }));
                            break;
                        case ShortcutAction.DeleteManga:
                            cardEl.dispatchEvent(new CustomEvent('cardAction', { detail: 'delete', bubbles: true }));
                            break;
                        default:
                            break;
                    }
                }
                break;
        }
    }
}
