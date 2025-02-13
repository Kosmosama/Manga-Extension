import { inject, Injectable } from '@angular/core';
import { Manga, NewManga } from '../../shared/interfaces/manga.interface';
import { from, Observable } from 'rxjs';
import { DatabaseService } from '../../shared/services/database.service';
import { PromiseExtended } from 'dexie';
import { NewTag, Tag } from '../../shared/interfaces/tag.interface';
import { OrderMethod, SortMangaMethods } from '../../shared/interfaces/sort.interface';
import { ChapterRangeFilter, DateRangeFilter, Filters, FilterTypes, TagFilter } from '../../shared/interfaces/filters.interface';
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
    getAllMangas(filter: Filters): Observable<Manga[]> {
        const filterHandlers = {    // Maybe this can be better or modularized, but i don't have time, i need to cagar
            [FilterTypes.NONE]: () => this.getMangasWithTags(),
            [FilterTypes.TAG]: (f: TagFilter) => this.getMangasByTag(f.tagId),
            [FilterTypes.DATE_RANGE]: (f: DateRangeFilter) => this.getMangasByDateRange(f.lowerDate, f.upperDate, f.dateType, f.sortMethod, f.orderMethod),
            [FilterTypes.CHAPTER_RANGE]: (f: ChapterRangeFilter) => this.getMangasByChapterRange(f.lowerCap, f.upperCap)
        } as Record<FilterTypes, (filter: any) => Observable<Manga[]>>;

        const handler = filterHandlers[filter.type];
        if (!handler) {
            throw new Error(`Invalid filter type: ${filter.type}`);
        }
        return handler(filter);
    }
    
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
     * Retrieves all mangas between a date range with optional sorting.
     * 
     * @param {Date} lowerDate - The lower bound date (inclusive)
     * @param {Date} upperDate - The upper bound date (inclusive)
     * @param {'createdAt' | 'updatedAt'} type - The date field to filter by
     * @param {SortMangaMethods} sortMethod - The field to sort results by
     * @param {OrderMethod} orderMethod - The sort direction ('asc' for ascending, 'desc' for descending)
     * @returns {Observable<Manga[]>} An observable that emits an array of mangas within the specified date range
     */
    getMangasByDateRange(
        lowerDate: Date,
        upperDate: Date,
        type: 'createdAt' | 'updatedAt',
        sortMethod: SortMangaMethods,
        orderMethod: OrderMethod
    ): Observable<Manga[]> {
        let collection = this.database.mangas
            .where(type)
            .between(lowerDate, upperDate, true, true)
            .sortBy(sortMethod)

        if (orderMethod === 'desc') { // i couldn't find a way to do this with the Dexie .reverse method.
            collection = collection.then(coll => coll.reverse());
        }

        return from(
            collection
                .then(mangas => this.resolveTagsForMangas(mangas as Manga[]))
        );
    }
   


    /**
     * Retrieves all mangas that have a chapter count within the specified range.
     * 
     * @param {number} lowerCap - The minimum number of chapters (inclusive)
     * @param {number} upperCap - The maximum number of chapters (inclusive)
     * @returns {Observable<Manga[]>} An observable that emits an array of mangas with chapter counts within the specified range
     */
    getMangasByChapterRange(lowerCap: number, upperCap: number): Observable<Manga[]> {
        return from(
            this.database.mangas
                .where('chapters')
                .between(lowerCap, upperCap, true, true)
                .toArray()
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
     * @param {NewManga} manga - The manga data to add to the database
     * @returns {Observable<number>} An observable that emits the ID of the newly added manga
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
     * @returns {Observable<number>} An observable that emits the number of rows affected by the update.
     * @throws {Error} If the manga with the specified ID is not found.
     */
    addTagToManga(mangaId: number, tagId: number): Observable<number> {
        return from(this.database.mangas.get(mangaId).then(manga => {
            if(!manga){
                throw new Error('Manga not found');
            }
            
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
            if(!manga){
                throw new Error('Manga not found');
            }
            
            const updatedTags = (manga.tags ?? []).filter(tag => tag !== tagId);
            return this.database.mangas.update(mangaId, { tags: updatedTags });
        }));
    }

    
}
