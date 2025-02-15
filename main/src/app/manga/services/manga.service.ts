import { inject, Injectable } from '@angular/core';
import { Collection } from 'dexie';
import { from, Observable } from 'rxjs';
import { MangaFilters, Range } from '../../shared/interfaces/filters.interface';
import { DatabaseService } from '../../shared/services/database.service';
import { Tag } from '../../shared/interfaces/tag.interface';
import { Manga } from '../../shared/interfaces/manga.interface';
@Injectable({
    providedIn: 'root'
})
export class MangaService {
    private database = inject(DatabaseService);

    /**
     * Retrieves all mangas from the database based on the provided filters.
     * 
     * @param {MangaFilters} filters - The filters to apply to the manga collection.
     * 
     * @returns {Observable<Manga[]>} An observable containing the filtered list of mangas.
     */
    // #TODO Maybe make it so that tags are placed onto the manga objects? - depends on the UI
    getAllMangas(filters: MangaFilters): Observable<Manga[]> {
        let query = this.database.mangas.toCollection();

        if (filters.search)
            query = this.applySearchFilter(query, filters.search);
        if (filters.includeTags || filters.excludeTags)
            query = this.applyTagFilters(query, filters.includeTags, filters.excludeTags);
        if (filters.chapterRange)
            query = this.applyChapterRangeFilter(query, filters.chapterRange);
        if (filters.lastSeenRange)
            query = this.applyUpdatedAtRangeFilter(query, filters.lastSeenRange);
        if (filters.addedRange)
            query = this.applyCreatedAtRangeFilter(query, filters.addedRange);

        query.sortBy(filters.sortBy ? filters.sortBy : 'title');

        return from(filters.order === 'desc' ? query.reverse().toArray() : query.toArray());
    }

    /**
     * Applies a search filter to the query based on the manga title.
     * 
     * @param {Collection<Manga, number, Manga>} query - The manga collection query.
     * @param {string} search - The search term.
     * 
     * @returns {Collection<Manga, number, Manga>} The filtered query.
     */
    private applySearchFilter(query: Collection<Manga, number, Manga>, search: string): Collection<Manga, number, Manga> {
        return query.filter(manga => manga.title.toLowerCase().includes(search.toLowerCase()));
    }

    /**
     * Filters mangas based on included and excluded tags.
     * 
     * @param {Collection<Manga, number, Manga>} query - The manga collection query.
     * @param {number[]} includeTags - Tag IDs that must be included.
     * @param {number[]} excludeTags - Tag IDs that must be excluded.
     * 
     * @returns {Collection<Manga, number, Manga>} The filtered query.
     */
    private applyTagFilters(query: Collection<Manga, number, Manga>, includeTags: number[] = [], excludeTags: number[] = []): Collection<Manga, number, Manga> {
        return query.filter(manga => {
            const mangaTagIds = (manga.tags ?? []).map(tag => tag.id);
            const tagSet = new Set(mangaTagIds);

            const hasAllIncluded = includeTags ? includeTags.every(tagId => tagSet.has(tagId)) : true;
            const hasNoExcluded = excludeTags ? !excludeTags.some(tagId => tagSet.has(tagId)) : true;

            return hasAllIncluded && hasNoExcluded;
        }) as Collection<Manga, number, Manga>;
    }

    /**
     * Filters mangas based on the number of chapters within a specified range.
     * 
     * @param {Collection<Manga, number, Manga>} query - The manga collection query.
     * @param {Range<number>} range - The chapter range.
     * 
     * @returns {Collection<Manga, number, Manga>} The filtered query.
     */
    private applyChapterRangeFilter(query: Collection<Manga, number, Manga>, range: Range<number>): Collection<Manga, number, Manga> {
        return query.filter(manga => manga.chapters >= range.min && manga.chapters <= range.max);
    }

    /**
     * Filters mangas based on their last updated date within a specified range.
     * 
     * @param {Collection<Manga, number, Manga>} query - The manga collection query.
     * @param {Range<number>} range - The date range for last updated time.
     * 
     * @returns {Collection<Manga, number, Manga>} The filtered query.
     */
    private applyUpdatedAtRangeFilter(query: Collection<Manga, number, Manga>, range: Range<Date>): Collection<Manga, number, Manga> {
        return query.filter(manga => {
            const dateValue = new Date(manga.updatedAt);
            return dateValue >= range.min && dateValue <= range.max;
        });
    }

    /**
     * Filters mangas based on their creation date within a specified range.
     * 
     * @param {Collection<Manga, number, Manga>} query - The manga collection query.
     * @param {Range<number>} range - The date range for creation time.
     * 
     * @returns {Collection<Manga, number, Manga>} The filtered query.
     */
    private applyCreatedAtRangeFilter(query: Collection<Manga, number, Manga>, range: Range<Date>): Collection<Manga, number, Manga> {
        return query.filter(manga => {
            const dateValue = new Date(manga.createdAt);
            return dateValue >= range.min && dateValue <= range.max;
        });
    }

    /**
     * Retrieves a manga by its ID.
     * 
     * @param {number} id - The ID of the manga to retrieve.
     * 
     * @returns {Observable<Manga | undefined>} An observable of the manga or undefined if not found.
     */
    getMangaById(id: number): Observable<Manga | undefined> {
        return from(this.database.mangas.get(id) as Promise<Manga | undefined>);
    }

    /**
     * Adds a new manga to the database.
     * 
     * @param {Manga} manga - The manga data to add to the database.
     * 
     * @returns {Observable<number>} An observable that emits the ID of the newly added manga.
     */
    addManga(manga: Manga): Observable<number> {
        return from(this.database.mangas.add(manga));
    }

    /**
     * Updates an existing manga in the database.
     * 
     * @param {number} id - The ID of the manga to update.
     * @param {Partial<Manga>} changes - The changes to apply to the manga.
     * 
     * @returns {Observable<number>} An observable of the number of updated records.
     */
    updateManga(id: number, changes: Partial<Manga>): Observable<number> {
        return from(this.database.mangas.update(id, changes));
    }

    /**
     * Deletes a manga from the database.
     * 
     * @param {number} id - The ID of the manga to delete.
     * 
     * @returns {Observable<void>} An observable of void.
     */
    deleteManga(id: number): Observable<void> {
        return from(this.database.mangas.delete(id));
    }

    /**
     * Adds multiple tags to a manga's list of tags.
     *
     * @param {number} mangaId - The ID of the manga to which the tags will be added
     * @param {number[]} tagIds - Array of tag IDs to be added to the manga
     * @returns {Observable<number>} An observable that emits the number of rows affected by the update
     * @throws {Error} If the manga with the specified ID is not found or if any tag doesn't exist
     */
    addTagToManga(mangaId: number, tagIds: number[]): Observable<number> {
        return from(
            Promise.all([ // maybe it can be done without promise all but my brain is off
                this.database.mangas.get(mangaId),
                this.database.tags.bulkGet(tagIds)
            ]).then(([manga, tags]) => {
                if (!manga) {
                    throw new Error('Manga not found');
                }

                const validTags = tags.filter((tag): tag is Tag => tag !== undefined);
                if (validTags.length !== tagIds.length) {
                    throw new Error('Some tags do not exist xdd');
                }

                const existingTags = manga.tags ?? [];

                const allTags = [...existingTags, ...validTags];
                
                return this.database.mangas.update(mangaId, { tags: allTags });
            })
        );
    }
    // /**
    //  * Removes a tag from a manga's list of tags.
    //  *
    //  * @param {number} mangaId - The ID of the manga from which the tag will be removed.
    //  * @param {number} tagId - The ID of the tag to be removed from the manga.
    //  * @returns {Observable<number>} An observable that emits the number of rows affected by the update.
    //  * @throws {Error} If the manga with the specified ID is not found.
    //  */
    // removeTagFromManga(mangaId: number, tagId: number): Observable<number> {
    //     return from(this.database.mangas.get(mangaId).then(manga => {
    //         if (!manga) {
    //             throw new Error('Manga not found');
    //         }

    //         // #TODO Check what happens if we delete a tag that isnt in a manga and solve if a bug
    //         const updatedTags = (manga.tags ?? []).filter(tag => tag !== tagId);
    //         return this.database.mangas.update(mangaId, { tags: updatedTags });
    //     }));
    // }
}
