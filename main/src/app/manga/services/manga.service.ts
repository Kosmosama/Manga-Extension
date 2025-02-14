import { inject, Injectable } from '@angular/core';
import { Manga, NewManga } from '../../shared/interfaces/manga.interface';
import { from, Observable } from 'rxjs';
import { DatabaseService } from '../../shared/services/database.service';
import { Tag } from '../../shared/interfaces/tag.interface';
import { OrderingMethod, RangeCriteria, RangeCriteriaType, SortMangaMethods } from '../../shared/interfaces/sort.interface';
import { ChapterRangeFilter, DateRangeFilter, Filters, FilterTypes, MangaFilters, OrderMethod, SortMethod, TagFilter } from '../../shared/interfaces/filters.interface';
import { Collection } from 'dexie';
@Injectable({
    providedIn: 'root'
})
export class MangaService {
    private database = inject(DatabaseService);

    // #TODO - Implement sorting in all filters - maybe move the filters to a service?

    /**
     * Retrieves filtered mangas from the database based on the provided filter criteria.
     * Each manga will have its tags resolved into full Tag objects.
     *
     * @param {Filters} filter - The filter criteria to apply:
     *                          - NONE: Returns all mangas
     *                          - TAG: Filters by specific tag ID
     *                          - DATE_RANGE: Filters by date range and includes sorting
     *                          - CHAPTER_RANGE: Filters by chapter count range
     * @returns {Observable<Manga[]>} An observable that emits an array of filtered mangas with their resolved tags
     */
    getAllMangasold(filter: Filters): Observable<Manga[]> {
        const filterHandlers = {
            [FilterTypes.NONE]: () => this.getMangasWithTags(),
            [FilterTypes.TAG]: (f: TagFilter) => this.getMangasByTag(f.tagId),
            [FilterTypes.DATE_RANGE]: (f: DateRangeFilter) => this.getMangasByRange(f.dateType, f.lowerDate, f.upperDate, f.sortMethod, f.orderMethod),
            [FilterTypes.CHAPTER_RANGE]: (f: ChapterRangeFilter) => this.getMangasByRange('chapters', f.lowerCap, f.upperCap, 'chapters', 'asc')
        } as Record<FilterTypes, (filter: any) => Observable<Manga[]>>;

        const handler = filterHandlers[filter.type];
        if (!handler) {
            throw new Error(`Invalid filter type: ${filter.type}`);
        }
        return handler(filter);
    }

    // getAllMangas(filters: MangaFilters) {
    //     let query = this.database.mangas;
    
    //     if (filters.chapterRange) {
    //         query = query.where('chapters').between(filters.chapterRange.min, filters.chapterRange.max, true, true);
    //     }
    //     if (filters.lastSeenRange) {
    //         query = query.where('lastSeen').between(filters.lastSeenRange.start, filters.lastSeenRange.end, true, true);
    //     }
    //     if (filters.addedRange) {
    //         query = query.where('createdAt').between(filters.addedRange.start, filters.addedRange.end, true, true);
    //     }
    
    //     let collection = query.toCollection();
    
    //     if (filters.search) {
    //         collection = this.applySearchFilter(collection, filters.search);
    //     }
    //     if (filters.includeTags?.length || filters.excludeTags?.length) {
    //         collection = this.applyTagFilters(collection, filters.includeTags, filters.excludeTags);
    //     }
    
    //     return collection;
    // }

    // private applySearchFilter(query: Collection<NewManga, number, NewManga>, search: string): Collection<NewManga, number, NewManga> {
    //     return query.filter(manga => manga.title.toLowerCase().includes(search.toLowerCase()));
    // }

    // private applyTagFilters(query: Collection<NewManga, number, NewManga>, includeTags: number[] = [], excludeTags: number[] = []): Collection<NewManga, number, NewManga> {    
    //     return query.filter(manga => {
    //         const tagSet = new Set(manga.tags ?? []);
            
    //         const hasAllIncluded = includeTags ? includeTags.every(tag => tagSet.has(tag)) : true;
    //         const hasNoExcluded = excludeTags ? !excludeTags.some(tag => tagSet.has(tag)) : true;
            
    //         return hasAllIncluded && hasNoExcluded;
    //     });
    // }

    // private applyChapterRangeFilter(query: Collection<NewManga, number, NewManga>, range: { min: number; max: number }): Collection<NewManga, number, NewManga> {
    //     return query.where('chapters').between(range.min, range.max, true, true);
    // }

    // private applyDateRangeFilter(query: Collection<NewManga, number, NewManga>, field: 'lastSeen' | 'createdAt', range: { start: Date; end: Date }): Collection<NewManga, number, NewManga> {
    //     return query.where(field).between(range.start, range.end, true, true);
    // }

    // private async applySorting(query: Collection<NewManga, number, NewManga>, sortBy: SortMethod = 'title', order: OrderMethod = 'asc'): Promise<NewManga[]> {
    // }

    /**
     * Retrieves all mangas from the database and resolves their tag IDs into full Tag objects.
     * This is the base query used when no filters are applied.
     *
     * @returns {Observable<Manga[]>} An observable that emits an array of all mangas with their
     * tag IDs resolved into complete Tag objects in the resolvedTags property
     */
    getMangasWithTags(): Observable<Manga[]> {
        return from(
            this.database.mangas.toArray()
                .then(mangas => this.resolveTagsForMangas(mangas as Manga[]))
        );
    }

    /**
     * Retrieves all mangas that have a specific tag.
     * 
     * @param {number} tagId - The ID of the tag to filter mangas by.
     * @returns {Observable<Manga[]>} An observable that emits an array of mangas containing the specified tag.
     */
    getMangasByTag(tagId: number): Observable<Manga[]> {
        return from(
            this.database.mangas
                .where('tags')
                .equals(tagId)
                .toArray()
                .then(mangas => this.resolveTagsForMangas(mangas as Manga[]))
        );
    }

    /**
     * Retrieves mangas within a specific range of criteria and sorts them according to the provided parameters.
     * 
     * @param {RangeCriteria} criteria - The criteria to filter by (e.g., 'updatedAt', 'createdAt', etc.)
     * @param {RangeCriteriaType} lowerCriteria - The minimum value of the range
     * @param {RangeCriteriaType} upperCriteria - The maximum value of the range
     * @param {SortMangaMethods} sortMethod - The sorting method to apply
     * @param {OrderMethod} orderMethod - The sorting direction ('asc' or 'desc')
     * @returns {Observable<Manga[]>} An observable that emits an array of mangas matching the criteria,
     *                               sorted according to the specified parameters and with resolved tags
     */
    getMangasByRange(
        criteria: RangeCriteria,
        lowerCriteria: RangeCriteriaType,
        upperCriteria: RangeCriteriaType,
        sortMethod: SortMangaMethods,
        orderMethod: OrderingMethod): Observable<Manga[]> {
        let collection = this.database.mangas
            .where(criteria)
            .between(lowerCriteria, upperCriteria, true, true);

        if (orderMethod === 'desc') {
            collection = collection.reverse();
        }

        return from(
            collection
                .sortBy(sortMethod)
                .then(mangas => this.resolveTagsForMangas(mangas as Manga[]))
        );
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

    private resolveTagsForMangas(mangas: Manga[]): Promise<Manga[]> {
        const tagIds = [...new Set(mangas.flatMap(manga => manga.tags || []))];
        return this.database.tags.bulkGet(tagIds)
            .then(tags => {
                const validTags = tags.filter((tag): tag is Tag => tag !== undefined);
                const tagMap = new Map(validTags.map(tag => [tag.id, tag]));

                return mangas.map(manga => ({
                    ...manga,
                    resolvedTags: (manga.tags || [])
                        .map(tagId => tagMap.get(tagId))
                        .filter((t): t is Tag => t !== undefined)
                }));
            });
    }

    /**
     * Adds a new manga to the database.
     * 
     * @param {NewManga} manga - The manga data to add to the database.
     * 
     * @returns {Observable<number>} An observable that emits the ID of the newly added manga.
     */
    addManga(manga: NewManga): Observable<number> {
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
     * Adds a tag to a manga's list of tags.
     *
     * @param {number} mangaId - The ID of the manga to which the tag will be added.
     * @param {number} tagId - The ID of the tag to be added to the manga.
     * 
     * @returns {Observable<number>} An observable that emits the number of rows affected by the update.
     * @throws {Error} If the manga with the specified ID is not found.
     */
    addTagToManga(mangaId: number, tagId: number): Observable<number> {
        return from(this.database.mangas.get(mangaId).then(manga => {
            if (!manga) {
                throw new Error('Manga not found');
            }

            // #TODO Check if tags exist before adding them (?)
            const updatedTags = [...(manga.tags ?? []), tagId];
            return this.database.mangas.update(mangaId, { tags: updatedTags });
        }));
    }

    /**
     * Removes a tag from a manga's list of tags.
     *
     * @param {number} mangaId - The ID of the manga from which the tag will be removed.
     * @param {number} tagId - The ID of the tag to be removed from the manga.
     * @returns {Observable<number>} An observable that emits the number of rows affected by the update.
     * @throws {Error} If the manga with the specified ID is not found.
     */
    removeTagFromManga(mangaId: number, tagId: number): Observable<number> {
        return from(this.database.mangas.get(mangaId).then(manga => {
            if (!manga) {
                throw new Error('Manga not found');
            }

            // #TODO Check what happens if we delete a tag that isnt in a manga and solve if a bug
            const updatedTags = (manga.tags ?? []).filter(tag => tag !== tagId);
            return this.database.mangas.update(mangaId, { tags: updatedTags });
        }));
    }
}
