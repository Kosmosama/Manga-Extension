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
     * Applies default values to a manga object before storage.
     *
     * @param partial A partial manga object to fill with defaults
     * @returns A fully populated `Manga` instance
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
     *
     * @param id Manga database ID
     * @returns Observable emitting the found manga or `undefined`
     */
    getMangaById(id: number): Observable<Manga | undefined> {
        return from(this.database.mangas.get(id));
    }

    /**
     * Retrieves all mangas matching the provided filters.
     *
     * @param filters Filter rules such as tags, ranges, sorting, and search
     * @returns Observable emitting the filtered manga list
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
     *
     * @param search Search input for title filtering
     * @param order Sort order, defaults to ascending
     * @returns Observable emitting the filtered list
     */
    listForMainPage(search: string, order: 'asc' | 'desc' = 'asc'): Observable<Manga[]> {
        return this.getAllMangas({
            search,
            sortBy: 'title',
            order
        });
    }

    /**
     * Inserts a new manga into the database.
     *
     * @param manga Full manga object to insert
     * @returns Observable emitting the new ID
     */
    addManga(manga: Manga): Observable<number> {
        const entity = this.withDefaults(manga);
        return from(this.database.mangas.add(entity));
    }

    /**
     * Inserts a manga with minimal input fields.
     *
     * @param input Minimal required manga fields
     * @returns Observable emitting the new ID
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
     * Updates a manga's fields.
     *
     * @param id Manga ID
     * @param changes Partial update patch
     * @returns Observable emitting the number of updated entries
     */
    updateManga(id: number, changes: Partial<Manga>): Observable<number> {
        return from(this.database.mangas.update(id, {
            ...changes,
            updatedAt: new Date().toISOString()
        }));
    }

    /**
     * Deletes a manga permanently.
     *
     * @param id Manga ID
     * @returns Observable emitting `void`
     */
    deleteManga(id: number): Observable<void> {
        return from(this.database.mangas.delete(id)).pipe(map(() => { }));
    }

    /**
     * Toggles the favorite status of a manga.
     *
     * @param mangaId Manga ID
     * @param actualFavoriteStatus Optional known favorite value to skip a lookup
     * @returns Observable emitting `void`
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
     * Sets the chapter count for a manga.
     *
     * @param mangaId Manga ID
     * @param chapters New chapter count
     * @returns Observable emitting `void`
     */
    updateChapters(mangaId: number, chapters: number): Observable<void> {
        return from(this.database.mangas.update(mangaId, {
            chapters,
            updatedAt: new Date().toISOString()
        })).pipe(map(() => { }));
    }

    /**
     * Increments the chapter count by one.
     *
     * @param mangaId Manga ID
     * @returns Observable emitting `void`
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
     * Decrements the chapter count by one without going below zero.
     *
     * @param mangaId Manga ID
     * @returns Observable emitting `void`
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
     *
     * @param mangaId Manga ID
     * @param tagIds Tag IDs to add
     * @returns Observable emitting update result
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
     * Removes a single tag from a manga.
     *
     * @param mangaId Manga ID
     * @param tagId Tag ID to remove
     * @returns Observable emitting update result
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
     * Removes a tag from all mangas containing it.
     *
     * @param tagId Tag ID to remove
     * @returns Observable emitting `void`
     */
    removeTagFromAllMangas(tagId: number): Observable<void> {
        const op = this.database.mangas
            .where('tags')
            .equals(tagId)
            .modify(m => { m.tags = m.tags?.filter(t => t !== tagId); });

        return from(op).pipe(map(() => { }));
    }

    /**
     * Rewrites manga link values matching a pattern.
     *
     * @param oldLink Old URL segment or pattern
     * @param newLink Replacement URL segment
     * @returns Observable emitting `void`
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
     * Checks whether a title already exists, optionally excluding a specific ID.
     *
     * @param title Title to check
     * @param excludeId Optional manga ID to ignore during comparison
     * @returns Observable emitting `true` if the title exists
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
     * Validates if a tag exists; if not, dangling tag references are cleaned up.
     *
     * @param tagId Tag ID to verify
     * @returns Promise resolving with `true` if the tag exists
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
     * Resolves numerical tag IDs to full `Tag` objects for a manga list.
     *
     * @param mangas List of mangas with `tags` fields
     * @returns Promise resolving to the same list with `resolvedTags` populated
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
     * Applies a case-insensitive text search to mangas by title.
     *
     * @param query Dexie collection to filter
     * @param search Search text
     * @returns Filtered Dexie collection
     */
    private applySearchFilter(
        query: Collection<Manga, number, Manga>,
        search: string
    ): Collection<Manga, number, Manga> {
        const needle = search.toLowerCase();
        return query.filter(m => m.title.toLowerCase().includes(needle));
    }

    /**
     * Filters mangas by required and excluded tags.
     *
     * @param query Dexie collection to filter
     * @param includeTags Tags that must be present
     * @param excludeTags Tags that must not be present
     * @returns Filtered Dexie collection
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
     * Filters mangas by a numeric range.
     *
     * @param query Dexie collection to filter
     * @param range Minimum and maximum allowed values
     * @param field Numeric field to evaluate
     * @returns Filtered Dexie collection
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
     * Filters mangas by a date range.
     *
     * @param query Dexie collection to filter
     * @param range Date range to match
     * @param field ISO date string field to evaluate
     * @returns Filtered Dexie collection
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
     * Returns a random subset of results from the collection.
     *
     * @param query Dexie collection to sample from
     * @param limit Number of results desired
     * @returns Promise resolving to a randomly selected array
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
