import { Component, inject, signal, viewChild, effect } from '@angular/core';
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

    modal = viewChild.required<ModalComponent>('modal');
    editModal = viewChild.required<ModalComponent>('editModal');

    selectedManga = signal<Manga | null>(null);
    allMangas = signal<Manga[]>([]);
    filteredMangas = signal<Manga[]>([]);
    theme = signal<Theme>(this.themeService.theme);
    searchQuery = signal<string>('');
    sortOrder = signal<'asc' | 'desc'>('asc');

    selectedTagIds = signal<number[]>([]);
    tagMode = signal<'AND' | 'OR'>('AND');

    private searchInput$ = new Subject<string>();

    constructor() {
        const qp = this.route.snapshot.queryParamMap;
        const initialQ = qp.get('q') || '';
        const initialSort = (qp.get('sort') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';
        this.searchQuery.set(initialQ);
        this.sortOrder.set(initialSort);

        this.searchInput$
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe(value => {
                this.searchQuery.set(value);
                this.reload();
                this.syncQueryParams();
            });

        effect(() => {
            this.sortOrder();
            this.reload();
            this.syncQueryParams();
        });

        effect(() => {
            this.applyTagFilter();
        });
    }

    private reload(): void {
        this.mangaService
            .listForMainPage(this.searchQuery(), this.sortOrder())
            .subscribe(mangas => {
                this.allMangas.set(mangas);
                this.applyTagFilter();
            });
    }

    private applyTagFilter() {
        const tags = this.selectedTagIds();
        const mode = this.tagMode();
        if (!tags.length) {
            this.filteredMangas.set(this.allMangas());
            return;
        }
        const result = this.allMangas().filter(m => {
            const mangaTags = m.tags || [];
            if (mode === 'AND') {
                return tags.every(t => mangaTags.includes(t));
            } else {
                return tags.some(t => mangaTags.includes(t));
            }
        });
        this.filteredMangas.set(result);
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

    handleMangaDeletion(id: number) {
        this.allMangas.update(mangas => mangas.filter(m => m.id !== id));
        this.applyTagFilter();
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
        this.allMangas.update(mangas => {
            const index = mangas.findIndex(m => m.id === manga.id);
            if (index === -1) return [...mangas, manga];
            const next = [...mangas];
            next[index] = manga;
            return next;
        });
        this.applyTagFilter();
    }

    onFilterChanged(event: { tagIds: number[]; mode: 'AND' | 'OR' }) {
        this.selectedTagIds.set(event.tagIds);
        this.tagMode.set(event.mode);
        this.applyTagFilter();
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
}