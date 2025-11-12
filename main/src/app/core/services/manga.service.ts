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
     * Generates a manga with defaults. Dexie will assign the real numeric id.
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

    getMangaById(id: number): Observable<Manga | undefined> {
        return from(this.database.mangas.get(id));
    }

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
     * Simple list usage for main page (title search + sort).
     */
    listForMainPage(search: string, order: 'asc' | 'desc' = 'asc'): Observable<Manga[]> {
        return this.getAllMangas({
            search,
            sortBy: 'title',
            order
        });
    }

    addManga(manga: Manga): Observable<number> {
        const entity = this.withDefaults(manga);
        return from(this.database.mangas.add(entity));
    }

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

    updateManga(id: number, changes: Partial<Manga>): Observable<number> {
        return from(this.database.mangas.update(id, {
            ...changes,
            updatedAt: new Date().toISOString()
        }));
    }

    deleteManga(id: number): Observable<void> {
        return from(this.database.mangas.delete(id)).pipe(map(() => { }));
    }

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

    updateChapters(mangaId: number, chapters: number): Observable<void> {
        return from(this.database.mangas.update(mangaId, {
            chapters,
            updatedAt: new Date().toISOString()
        })).pipe(map(() => { }));
    }

    incrementChapters(mangaId: number): Observable<void> {
        return this.getMangaById(mangaId).pipe(
            switchMap(m => {
                if (!m) return of(void 0);
                return this.updateChapters(mangaId, (m.chapters ?? 0) + 1);
            })
        );
    }

    decrementChapters(mangaId: number): Observable<void> {
        return this.getMangaById(mangaId).pipe(
            switchMap(m => {
                if (!m) return of(void 0);
                return this.updateChapters(mangaId, Math.max((m.chapters ?? 0) - 1, 0));
            })
        );
    }

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

    removeTagFromAllMangas(tagId: number): Observable<void> {
        const op = this.database.mangas
            .where('tags')
            .equals(tagId)
            .modify(m => { m.tags = m.tags?.filter(t => t !== tagId); });

        return from(op).pipe(map(() => { }));
    }

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

    private applySearchFilter(
        query: Collection<Manga, number, Manga>,
        search: string
    ): Collection<Manga, number, Manga> {
        const needle = search.toLowerCase();
        return query.filter(m => m.title.toLowerCase().includes(needle));
    }

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
     * Numeric range filter (chapters).
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
     * Date range filter for ISO string fields (updatedAt / createdAt).
     * Converts stored ISO to timestamp and compares against Date range.
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

    private async getRandomMangas(
        query: Collection<Manga, number, Manga>,
        limit: number = 1
    ): Promise<Manga[]> {
        const mangas = await query.toArray();
        if (!mangas.length) return [];
        return mangas.sort(() => Math.random() - 0.5).slice(0, limit);
    }
}