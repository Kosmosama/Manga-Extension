import { inject, Injectable } from '@angular/core';
import { Collection } from 'dexie';
import { from, Observable } from 'rxjs';
import { MangaFilters, Range } from '../../shared/interfaces/filters.interface';
import { DatabaseService } from '../../shared/services/database.service';
import { Tag } from '../../shared/interfaces/tag.interface';
import { Manga } from '../../shared/interfaces/manga.interface';

/**
 * Service for managing manga-related operations in the database.
 */
@Injectable({
    providedIn: 'root'
})
export class MangaService {
    private database: DatabaseService = inject(DatabaseService);

    /**
     * Retrieves a manga by its ID.
     * 
     * @param {number} id - The ID of the manga to retrieve.
     * @returns {Observable<Manga | undefined>} An observable with the manga or undefined if not found.
     */
    getMangaById(id: number): Observable<Manga | undefined> {
        return from(this.database.mangas.get(id) as Promise<Manga | undefined>);
    }

    /**
     * Retrieves all mangas from the database based on the provided filters.
     * 
     * @param {MangaFilters} filters - The filters to apply to the manga collection.
     * @returns {Observable<Manga[]>} An observable containing the filtered list of mangas.
     */
    getAllMangas(filters: MangaFilters): Observable<Manga[]> {
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

        return from(query.toArray().then(mangas => this.resolveTagsForMangas(mangas)));
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
            .then(() => {});
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
}
