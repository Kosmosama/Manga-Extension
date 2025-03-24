import { inject, Injectable } from '@angular/core';
import { Collection } from 'dexie';
import { from, map, Observable } from 'rxjs';
import { MangaFilters, Range } from '../interfaces/filters.interface';
import { Tag } from '../interfaces/tag.interface';
import { Manga } from '../interfaces/manga.interface';
import { DatabaseService } from './database.service';

/**
 * Service for managing manga-related operations in the database.
 */
@Injectable({ providedIn: 'root' })
export class MangaService {
    private database = inject(DatabaseService);

    /**
     * Retrieves a manga by its ID.
     */
    getMangaById(id: number): Observable<Manga | undefined> {
        return from(this.database.mangas.get(id));
    }

    /**
     * Retrieves all mangas from the database based on provided filters.
     */
    getAllMangas(filters: MangaFilters = {}): Observable<Manga[]> {
        let query = this.database.mangas.toCollection();

        if (filters.sortBy) {
            query = this.database.mangas.orderBy(filters.sortBy);
            if (filters.order === 'desc') query = query.reverse();
        }

        if (filters.search) query = this.applySearchFilter(query, filters.search);
        if (filters.includeTags || filters.excludeTags) query = this.applyTagFilters(query, filters.includeTags, filters.excludeTags);
        if (filters.chapterRange) query = this.applyRangeFilter(query, filters.chapterRange, 'chapters');
        if (filters.lastSeenRange) query = this.applyRangeFilter(query, filters.lastSeenRange, 'updatedAt');
        if (filters.addedRange) query = this.applyRangeFilter(query, filters.addedRange, 'createdAt');

        const limit = Math.max(filters.limit || 1, 1);

        return from((filters.random ? this.getRandomMangas(query, limit) : query.toArray())
            .then(mangas => this.resolveTagsForMangas(mangas)));
    }

    /**
     * Adds a new manga to the database.
     */
    addManga(manga: Manga): Observable<number> {
        return from(this.database.mangas.add(manga));
    }

    /**
     * Updates an existing manga in the database.
     */
    updateManga(id: number, changes: Partial<Manga>): Observable<number> {
        return from(this.database.mangas.update(id, changes));
    }

    /**
     * Deletes a manga from the database.
     */
    deleteManga(id: number): Observable<void> {
        return from(this.database.mangas.delete(id));
    }

    /**
     * Toggles the favorite status of a manga.
     */
    toggleFavorite(mangaId: number, actualFavoriteStatus: boolean | undefined): Observable<void> {
        return from(this.database.mangas.update(mangaId, { isFavorite: !actualFavoriteStatus })).pipe(map(() => {}));
    }

    /**
     * Updates the chapter count of a manga and modifies the updatedAt timestamp.
     */
    updateChapters(mangaId: number, chapters: number): Observable<void> {
        return from(this.database.mangas.update(mangaId, { chapters, updatedAt: String(Date.now()) })).pipe(map(() => {}));
    }

    /**
     * Adds tags to a manga after validating them.
     */
    addTagToManga(mangaId: number, tagIds: number[]): Observable<number> {
        return from(this.database.mangas.get(mangaId).then(async manga => {
            if (!manga) throw new Error('Manga not found');

            const validTags = await Promise.all(tagIds.map(async id => (await this.tagExists(id)) ? id : null));
            const updatedTags = [...new Set([...(manga.tags ?? []), ...validTags.filter((tag): tag is number => tag !== null)])];

            return this.database.mangas.update(mangaId, { tags: updatedTags });
        }));
    }

    /**
     * Removes a specific tag from a manga.
     */
    removeTagFromManga(mangaId: number, tagId: number): Observable<number> {
        return from(this.database.mangas.get(mangaId).then(manga => {
            if (!manga) throw new Error('Manga not found');

            return this.database.mangas.update(mangaId, { tags: (manga.tags ?? []).filter(id => id !== tagId) });
        }));
    }

    /**
     * Removes a tag from all mangas in the database.
     */
    removeTagFromAllMangas(tagId: number): Promise<void> {
        return this.database.mangas
            .where('tags')
            .equals(tagId)
            .modify(manga => { manga.tags = manga.tags?.filter(t => t !== tagId); })
            .then(() => {});
    }

    /**
     * Checks if a tag exists in the database, removes it from mangas if not.
     */
    private async tagExists(tagId: number): Promise<boolean> {
        const tag = await this.database.tags.get(tagId);
        if (!tag) await this.removeTagFromAllMangas(tagId);
        return !!tag;
    }

    /**
     * Resolves tags for each manga by fetching tag details from the database.
     */
    private resolveTagsForMangas(mangas: Manga[]): Promise<Manga[]> {
        const tagIds = [...new Set(mangas.flatMap(m => m.tags || []))];
        return this.database.tags.bulkGet(tagIds).then(tags => {
            const tagMap = new Map(tags.filter(Boolean).map(t => [t!.id, t!]));
            return mangas.map(m => ({
                ...m,
                resolvedTags: (m.tags || []).map(tagId => tagMap.get(tagId)).filter((tag): tag is Tag => tag !== undefined)
            }));
        });
    }

    /**
     * Filters mangas based on search criteria.
     */
    private applySearchFilter(query: Collection<Manga, number, Manga>, search: string): Collection<Manga, number, Manga> {
        return query.filter(manga => manga.title.toLowerCase().includes(search.toLowerCase()));
    }

    /**
     * Filters mangas based on included and excluded tags.
     */
    private applyTagFilters(query: Collection<Manga, number, Manga>, includeTags: number[] = [], excludeTags: number[] = []): Collection<Manga, number, Manga> {
        return query.filter(manga => {
            const tagSet = new Set(manga.tags ?? []);
            return includeTags.every(tagSet.has.bind(tagSet)) && !excludeTags.some(tagSet.has.bind(tagSet));
        });
    }

    /**
     * Filters mangas based on a numeric or date range.
     */
    private applyRangeFilter<T extends number | Date>(query: Collection<Manga, number, Manga>, range: Range<T>, field: keyof Manga): Collection<Manga, number, Manga> {
        return query.filter(manga => {
            const value = manga[field];
            return value !== undefined && value >= range.min && value <= range.max;
        });
    }

    /**
     * Retrieves a random selection of mangas from the query.
     */
    private async getRandomMangas(query: Collection<Manga, number, Manga>, limit: number): Promise<Manga[]> {
        const mangas = await query.toArray();
        if (!mangas.length) return [];
        
        return mangas.sort(() => Math.random() - 0.5).slice(0, limit);
    }
}