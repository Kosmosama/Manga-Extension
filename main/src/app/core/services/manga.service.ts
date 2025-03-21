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
@Injectable({
    providedIn: 'root'
})
export class MangaService {
    private database = inject(DatabaseService);

    /**
     * Retrieves a manga by its ID.
     * 
     * @param {number} id - The ID of the manga to retrieve.
     * @returns {Observable<Manga | undefined>} An observable with the manga or undefined if not found.
     */
    getMangaById(id: number): Observable<Manga | undefined> {
        return from(this.database.mangas.get(id));
    }

    /**
     * Retrieves all mangas from the database based on the provided filters.
     * 
     * @param {MangaFilters} filters - The filters to apply to the manga collection.
     * @returns {Observable<Manga[]>} An observable containing the filtered list of mangas.
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

        const limit = filters.limit && filters.limit > 0 ? filters.limit : 1;

        const resultPromise = filters.random
            ? this.getRandomMangas(query, limit).then(randomQuery => randomQuery.toArray())
            : query.toArray();

        return from(resultPromise.then(mangas => this.resolveTagsForMangas(mangas)));
    }

    /**
     * Adds a new manga to the database.
     * 
     * @param {Manga} manga - The manga data to add.
     * @returns {Observable<number>} An observable that emits the ID of the newly added manga.
     */
    addManga(manga: Manga): Observable<number> {
        return from(this.database.mangas.add(manga));
    }

    /**
     * Updates an existing manga in the database.
     * 
     * @param {number} id - The ID of the manga to update.
     * @param {Partial<Manga>} changes - The changes to apply.
     * @returns {Observable<number>} An observable of the number of updated records.
     */
    updateManga(id: number, changes: Partial<Manga>): Observable<number> {
        return from(this.database.mangas.update(id, changes));
    }

    /**
     * Deletes a manga from the database.
     * 
     * @param {number} id - The ID of the manga to delete.
     * @returns {Observable<void>} An observable that completes when deletion is finished.
     */
    deleteManga(id: number): Observable<void> {
        return from(this.database.mangas.delete(id));
    }

    /**
     * Adds one or more tags to a manga.
     * 
     * @param {number} mangaId - The ID of the manga.
     * @param {number[]} tagIds - Array of tag IDs to add.
     * @returns {Observable<number>} An observable with the number of affected rows.
     * @throws {Error} If the manga is not found or if any tag is invalid.
     */
    addTagToManga(mangaId: number, tagIds: number[]): Observable<number> {
        return from(this.database.mangas.get(mangaId).then(async manga => {
            if (!manga) {
                throw new Error('Manga not found');
            }

            for (const id of tagIds) {
                const isValidTag = await this.tagExists(id);
                if (!isValidTag) {
                    throw new Error(`Tag ${id} not found and was removed from all mangas`);
                }
            }

            const updatedTags = [...new Set([...(manga.tags ?? []), ...tagIds])];
            return this.database.mangas.update(mangaId, { tags: updatedTags });
        }));
    }

    /**
     * Removes a tag from a specific manga.
     * 
     * @param {number} mangaId - The ID of the manga.
     * @param {number} tagId - The ID of the tag to remove.
     * @returns {Observable<number>} An observable with the number of affected rows.
     */
    removeTagFromManga(mangaId: number, tagId: number): Observable<number> {
        return from(this.database.mangas.get(mangaId).then(manga => {
            if (!manga) {
                throw new Error('Manga not found');
            }

            const updatedTags = (manga.tags ?? []).filter(id => id !== tagId);
            return this.database.mangas.update(mangaId, { tags: updatedTags });
        }));
    }

    /**
     * Removes a tag from all mangas in the database.
     * 
     * @param {number} tagId - The ID of the tag to remove.
     * @returns {Promise<void>} A promise that resolves when the tag is removed.
     */
    removeTagFromAllMangas(tagId: number): Promise<void> {
        return this.database.mangas
            .where('tags')
            .equals(tagId)
            .modify(manga => {
                manga.tags = manga.tags?.filter(t => t !== tagId);
            })
            .then(() => { });
    }

    /**
     * Updates the number of chapters for a specific manga and updates the `updatedAt` timestamp.
     *
     * @param mangaId - The ID of the manga to update.
     * @param chapters - The new number of chapters. If the value is less than 0, the update will not be performed.
     * @returns {Observable<void>} An Observable that completes when the update is done.
     */
    updateChapters(mangaId: number, chapters: number): Observable<void> {
        return from(
            this.database.mangas
                .where('id')
                .equals(mangaId)
                .modify(manga => {
                    if (chapters < 0) return;
                    manga.chapters = chapters;
                    manga.updatedAt = String(Date.now());
                })
        ).pipe(map(() => { }));
    }

    /**
     * Toggles the favorite status based on the actual favorite status.
     * 
     * @param {number} mangaId - The id of the manga to toggle.
     * @param {boolean} actualFavoriteStatus - The actual favorite status of the manga.
     */
    toggleFavorite(mangaId: number, actualFavoriteStatus: boolean | undefined): Observable<void> {
        return from(
            this.database.mangas
                .update(mangaId, {
                    isFavorite: !actualFavoriteStatus
                })
        ).pipe(map(() => { }));
    }
    /**
     * Checks if a tag exists in the database.
     * If the tag doesn't exist, it removes it from all mangas.
     * 
     * @param {number} tagId - The ID of the tag.
     * @returns {Promise<boolean>} A promise that resolves to true if the tag exists, false otherwise.
     */
    private async tagExists(tagId: number): Promise<boolean> {
        const tag = await this.database.tags.get(tagId);
        if (tag) return true;

        await this.removeTagFromAllMangas(tagId);
        return false;
    }

    /**
     * Resolves tags for each manga by fetching tag details from the database.
     * 
     * @param {Manga[]} mangas - The list of mangas to resolve tags for.
     * @returns {Promise<Manga[]>} A promise with the mangas containing resolved tag details.
     */
    private resolveTagsForMangas(mangas: Manga[]): Promise<Manga[]> {
        const tagIds = [...new Set(mangas.flatMap(m => m.tags || []))];
        return this.database.tags.bulkGet(tagIds).then(tags => {
            const validTags = tags.filter((t): t is Tag => t !== undefined);
            const tagMap = new Map(validTags.map(t => [t.id, t]));

            return mangas.map(m => ({
                ...m,
                resolvedTags: (m.tags || [])
                    .map(tagId => tagMap.get(tagId))
                    .filter((t): t is Tag => t !== undefined)
            }));
        });
    }

    /**
     * Applies a search filter to the query based on the manga title.
     * 
     * @param {Collection<Manga, number, Manga>} query - The manga collection query.
     * @param {string} search - The search term.
     * @returns {Collection<Manga, number, Manga>} The filtered query.
     */
    private applySearchFilter(query: Collection<Manga, number, Manga>, search: string): Collection<Manga, number, Manga> {
        return query.filter(manga => manga.title.toLowerCase().includes(search.toLowerCase()));
    }

    /**
     * Filters mangas based on included and excluded tags.
     */
    private applyTagFilters(query: Collection<Manga, number, Manga>, includeTags: number[] = [], excludeTags: number[] = []): Collection<Manga, number, Manga> {
        return query.filter(manga => {
            const mangaTagIds = manga.tags ?? [];
            const tagSet = new Set(mangaTagIds);

            const hasAllIncluded = includeTags.every(tagId => tagSet.has(tagId));
            const hasNoExcluded = !excludeTags.some(tagId => tagSet.has(tagId));

            return hasAllIncluded && hasNoExcluded;
        });
    }

    /**
     * Filters mangas based on a specified field within a given range.
     */
    private applyRangeFilter<T extends number | Date>(query: Collection<Manga, number, Manga>, range: Range<T>, field: keyof Manga): Collection<Manga, number, Manga> {
        return query.filter(manga => {
            const value = manga[field];
            return value !== undefined && value >= range.min && value <= range.max;
        });
    }

    /**
     * Retrieves a random selection of mangas from the query collection.
     * 
     * @param {Collection<Manga, number, Manga>} query - The manga collection to select from.
     * @param {number} limit - The maximum number of random mangas to return.
     * @returns {Collection<Manga, number, Manga>} A collection containing the randomly selected mangas.
     * @private
     */
    private async getRandomMangas(query: Collection<Manga, number, Manga>, limit: number): Promise<Collection<Manga, number, Manga>> {
        const mangas = await query.toArray();

        if (mangas.length === 0) {
            return this.database.mangas.toCollection();
        }

        const selectedIds = new Set<number>();
        while (selectedIds.size < Math.min(limit, mangas.length)) {
            const randomIndex = Math.floor(Math.random() * mangas.length);
            selectedIds.add(mangas[randomIndex].id);
        }

        return this.database.mangas.where('id').anyOf([...selectedIds]);
    }
}
