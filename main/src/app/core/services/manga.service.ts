import { inject, Injectable } from '@angular/core';
import { Collection } from 'dexie';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { MangaFilters, Range } from '../interfaces/filters.interface';
import { Tag } from '../interfaces/tag.interface';
import { Manga, MangaState, MangaType } from '../interfaces/manga.interface';
import { DatabaseService } from './database.service';

@Injectable({ providedIn: 'root' })
export class MangaService {
    private database = inject(DatabaseService);

    /**
     * Creates a Manga object with default values applied.
     */
    private withDefaults(partial: Partial<Manga>): Manga {
        const nowIso = new Date().toISOString();
        return {
            id: 0 as unknown as number,
            title: partial.title ?? '',
            updatedAt: partial.updatedAt ?? nowIso,
            createdAt: partial.createdAt ?? nowIso,
            link: partial.link,
            image: partial.image,
            chapters: partial.chapters ?? 0,
            isFavorite: partial.isFavorite ?? false,
            type: partial.type ?? MangaType.Manga,
            state: partial.state ?? MangaState.None,
            tags: partial.tags ?? [],
            resolvedTags: partial.resolvedTags,
        };
    }

    /**
     * Retrieves a manga by its ID.
     */
    getMangaById(id: number): Observable<Manga | undefined> {
        return from(this.database.mangas.get(id));
    }

    /**
     * Retrieves all mangas matching the provided filters.
     */
    getAllMangas(filters: MangaFilters = {}): Observable<Manga[]> {
        let query = this.database.mangas.toCollection();

        if (filters.search) {
            query = this.applySearchFilter(query, filters.search);
        }
        if (filters.includeTags || filters.excludeTags) {
            query = this.applyTagFilters(query, filters.includeTags, filters.excludeTags);
        }
        if (filters.chapterRange) {
            query = this.applyNumericRangeFilter(query, filters.chapterRange, 'chapters');
        }
        if (filters.lastSeenRange) {
            query = this.applyDateRangeFilter(query, filters.lastSeenRange, 'updatedAt');
        }
        if (filters.addedRange) {
            query = this.applyDateRangeFilter(query, filters.addedRange, 'createdAt');
        }

        if (filters.sortBy) {
            query = this.database.mangas.orderBy(filters.sortBy);
            if (filters.order === 'desc') query = query.reverse();
        }

        const limit = Math.max(filters.limit || 1, 1);
        const resultPromise = filters.random
            ? this.getRandomMangas(query, limit)
            : query.toArray();

        return from(resultPromise.then(mangas => this.resolveTagsForMangas(mangas)));
    }

    /**
     * Retrieves mangas for main page display (search + sorting).
     */
    listForMainPage(search: string, order: 'asc' | 'desc' = 'asc'): Observable<Manga[]> {
        return this.getAllMangas({
            search,
            sortBy: 'title',
            order
        });
    }

    /**
     * Adds a manga to the database.
     */
    addManga(manga: Manga): Observable<number> {
        const entity = this.withDefaults(manga);
        return from(this.database.mangas.add(entity));
    }

    /**
     * Adds a manga using minimal input fields.
     */
    addMangaMinimal(input: {
        title: string;
        link?: string;
        image?: string;
        tags?: number[];
        chapters?: number;
    }): Observable<number> {
        const entity = this.withDefaults({
            title: input.title,
            link: input.link,
            image: input.image,
            tags: input.tags ?? [],
            chapters: input.chapters ?? 0
        });
        return from(this.database.mangas.add(entity));
    }

    /**
     * Updates a manga with the provided changes.
     */
    updateManga(id: number, changes: Partial<Manga>): Observable<number> {
        return from(this.database.mangas.update(id, {
            ...changes,
            updatedAt: new Date().toISOString()
        }));
    }

    /**
     * Removes a manga from the database.
     */
    deleteManga(id: number): Observable<void> {
        return from(this.database.mangas.delete(id)).pipe(map(() => { }));
    }

    /**
     * Toggles the favorite status of a manga.
     */
    toggleFavorite(mangaId: number, actualFavoriteStatus?: boolean): Observable<void> {
        if (typeof actualFavoriteStatus === 'boolean') {
            return from(this.database.mangas.update(mangaId, {
                isFavorite: !actualFavoriteStatus,
                updatedAt: new Date().toISOString()
            })).pipe(map(() => { }));
        }
        return this.getMangaById(mangaId).pipe(
            switchMap(m => {
                if (!m) return of(void 0);
                return from(this.database.mangas.update(mangaId, {
                    isFavorite: !m.isFavorite,
                    updatedAt: new Date().toISOString()
                })).pipe(map(() => { }));
            })
        );
    }

    /**
     * Updates the chapter count for a manga.
     */
    updateChapters(mangaId: number, chapters: number): Observable<void> {
        return from(this.database.mangas.update(mangaId, {
            chapters,
            updatedAt: new Date().toISOString()
        })).pipe(map(() => { }));
    }

    /**
     * Increments the chapter count of a manga by 1.
     */
    incrementChapters(mangaId: number): Observable<void> {
        return this.getMangaById(mangaId).pipe(
            switchMap(m => {
                if (!m) return of(void 0);
                return this.updateChapters(mangaId, (m.chapters ?? 0) + 1);
            })
        );
    }

    /**
     * Decrements the chapter count of a manga by 1 (min 0).
     */
    decrementChapters(mangaId: number): Observable<void> {
        return this.getMangaById(mangaId).pipe(
            switchMap(m => {
                if (!m) return of(void 0);
                return this.updateChapters(mangaId, Math.max((m.chapters ?? 0) - 1, 0));
            })
        );
    }

    /**
     * Adds one or more tags to a manga.
     */
    addTagToManga(mangaId: number, tagIds: number[]): Observable<number> {
        const op = this.database.mangas.get(mangaId).then(async manga => {
            if (!manga) throw new Error('Manga not found');

            const validTags = await Promise.all(
                tagIds.map(async id => (await this.tagExists(id)) ? id : null)
            );
            const updatedTags = [
                ...new Set([
                    ...(manga.tags ?? []),
                    ...validTags.filter((t): t is number => t !== null)
                ])
            ];
            return this.database.mangas.update(mangaId, {
                tags: updatedTags,
                updatedAt: new Date().toISOString()
            });
        });
        return from(op);
    }

    /**
     * Removes a tag from a manga.
     */
    removeTagFromManga(mangaId: number, tagId: number): Observable<number> {
        const op = this.database.mangas.get(mangaId).then(manga => {
            if (!manga) throw new Error('Manga not found');
            const next = (manga.tags ?? []).filter(id => id !== tagId);
            return this.database.mangas.update(mangaId, {
                tags: next,
                updatedAt: new Date().toISOString()
            });
        });
        return from(op);
    }

    /**
     * Removes a tag from all mangas that contain it.
     */
    removeTagFromAllMangas(tagId: number): Observable<void> {
        const op = this.database.mangas
            .where('tags')
            .equals(tagId)
            .modify(m => { m.tags = m.tags?.filter(t => t !== tagId); });

        return from(op).pipe(map(() => { }));
    }

    /**
     * Updates manga links matching an old pattern to a new one.
     */
    updateMangaLinks(oldLink: string, newLink: string): Observable<void> {
        const op = this.database.mangas.toArray().then(mangas => {
            const regex = new RegExp(oldLink, 'g');
            const updates = mangas
                .filter(m => m.link && regex.test(m.link))
                .map(m =>
                    this.database.mangas.update(m.id, {
                        link: m.link?.replace(regex, newLink),
                        updatedAt: new Date().toISOString()
                    })
                );
            return Promise.all(updates).then(() => { });
        });
        return from(op);
    }

    /**
     * Checks if a title already exists, optionally excluding a specific ID.
     */
    isTitleTaken(title: string, excludeId?: number): Observable<boolean> {
        const needle = title.trim().toLowerCase();
        return from(this.database.mangas.toArray()).pipe(
            map(all => {
                const found = all.find(m => m.title.trim().toLowerCase() === needle);
                if (!found) return false;
                if (excludeId != null && found.id === excludeId) return false;
                return true;
            })
        );
    }

    /**
     * Checks whether a tag exists and cleans up dangling references.
     */
    private async tagExists(tagId: number): Promise<boolean> {
        const tag = await this.database.tags.get(tagId);
        if (!tag) {
            await this.database.mangas
                .where('tags')
                .equals(tagId)
                .modify(m => { m.tags = m.tags?.filter(t => t !== tagId); });
        }
        return !!tag;
    }

    /**
     * Resolves tag objects for an array of mangas.
     */
    private resolveTagsForMangas(mangas: Manga[]): Promise<Manga[]> {
        const tagIds = [...new Set(mangas.flatMap(m => m.tags || []))];
        return this.database.tags.bulkGet(tagIds).then(tags => {
            const tagMap = new Map(tags.filter(Boolean).map(t => [t!.id, t!]));
            return mangas.map(m => ({
                ...m,
                resolvedTags: (m.tags || [])
                    .map(tid => tagMap.get(tid))
                    .filter((t): t is Tag => t !== undefined)
            }));
        });
    }

    /**
     * Applies a case-insensitive title search filter.
     */
    private applySearchFilter(
        query: Collection<Manga, number, Manga>,
        search: string
    ): Collection<Manga, number, Manga> {
        const needle = search.toLowerCase();
        return query.filter(m => m.title.toLowerCase().includes(needle));
    }

    /**
     * Applies tag inclusion and exclusion filters.
     */
    private applyTagFilters(
        query: Collection<Manga, number, Manga>,
        includeTags: number[] = [],
        excludeTags: number[] = []
    ): Collection<Manga, number, Manga> {
        return query.filter(manga => {
            const tagSet = new Set(manga.tags ?? []);
            return includeTags.every(tagSet.has.bind(tagSet)) &&
                !excludeTags.some(tagSet.has.bind(tagSet));
        });
    }

    /**
     * Filters mangas by a numeric range on a given field.
     */
    private applyNumericRangeFilter(
        query: Collection<Manga, number, Manga>,
        range: Range<number>,
        field: 'chapters'
    ): Collection<Manga, number, Manga> {
        return query.filter(m => {
            const value = m[field];
            return value !== undefined && value >= range.min && value <= range.max;
        });
    }

    /**
     * Filters mangas by a date range for ISO string date fields.
     */
    private applyDateRangeFilter(
        query: Collection<Manga, number, Manga>,
        range: Range<Date>,
        field: 'updatedAt' | 'createdAt'
    ): Collection<Manga, number, Manga> {
        const min = range.min.getTime();
        const max = range.max.getTime();
        return query.filter(manga => {
            const iso = manga[field];
            if (!iso) return false;
            const ts = Date.parse(iso);
            return !isNaN(ts) && ts >= min && ts <= max;
        });
    }

    /**
     * Returns a random subset of mangas from the query.
     */
    private async getRandomMangas(
        query: Collection<Manga, number, Manga>,
        limit: number = 1
    ): Promise<Manga[]> {
        const mangas = await query.toArray();
        if (!mangas.length) return [];
        return mangas.sort(() => Math.random() - 0.5).slice(0, limit);
    }
}
