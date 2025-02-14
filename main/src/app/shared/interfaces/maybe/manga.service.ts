import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Tag } from '../tag.interface';
import { Collection, PromiseExtended } from 'dexie';
import { MangaFilters } from './mangafilters.interface';
import { DatabaseService } from '../../services/database.service';
import { Manga, NewManga } from '../manga.interface';
@Injectable({
    providedIn: 'root'
})
export class MangaService {
    private database = inject(DatabaseService);

    // #TODO - Implement sorting in all filters - maybe move the filters to a service?

   
    getAllMangas(): Observable<Manga[]> {
        return from(
          this.database.mangas
            .toArray()
            .then(mangas => this.resolveTagsForMangas(mangas as Manga[]))
        );
      }
      

    getMangasByFilters(filters: MangaFilters): Observable<Manga[]> {
        let collection: Collection<Manga, number>;
    
        if (filters.chapterRange) {
          const { min, max } = filters.chapterRange;
          collection = this.database.mangas
            .where('chapters')
            .between(min, max, true, true)  as Collection<Manga, number>
        } else {
            collection = this.database.mangas.toCollection() as Collection<Manga, number>
        }
    
        //updatedAt Range
        if (filters.updatedAt) {
            const { start, end } = filters.updatedAt;
            collection = collection.and(m => {
              if (!m.updatedAt) return false;
              const date = new Date(m.updatedAt);
              return date >= start && date <= end;
            });
          }
          
        // addedRange
        if (filters.addedRange) {
          const { start, end } = filters.addedRange;
          collection = collection.and(m => {
            const createdDate = new Date(m.createdAt);
            return createdDate >= start && createdDate <= end;
          });
        }
    
        // Title -> maybe move to another function ?
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          collection = collection.filter(m =>
            m.title.toLowerCase().includes(searchLower)
          );
        }
    
        // (includeTags)
        if (filters.includeTags && filters.includeTags.length > 0) {
          collection = collection.filter(m => {
            const mangaTags = m.tags ?? [];
            return filters.includeTags!.every(tagId => mangaTags.includes(tagId));
          });
        }
    
        // ExcludeTags
        if (filters.excludeTags && filters.excludeTags.length > 0) {
          collection = collection.filter(m => {
            const mangaTags = m.tags ?? [];
            return !filters.excludeTags!.some(tagId => mangaTags.includes(tagId));
          });
        }
    
        return from(
          collection.toArray().then(mangas => {
            if (filters.sortBy) {
                const sortFunctions = {
                    title: (a: Manga, b: Manga) => 
                        a.title.localeCompare(b.title),
                    createdAt: (a: Manga, b: Manga) => 
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                    chapters: (a: Manga, b: Manga) => 
                        (a.chapters ?? 0) - (b.chapters ?? 0),
                    isFavorite: (a: Manga, b: Manga) => 
                        Number(Boolean(a.isFavorite)) - Number(Boolean(b.isFavorite)),
                    updatedAt: (a: Manga, b: Manga) => 
                        new Date(a.updatedAt!).getTime() - new Date(b.updatedAt!).getTime()
                  };
    
                  mangas.sort(sortFunctions[filters.sortBy]);

              if (filters.order === 'desc') {
                mangas.reverse();
              }
            }
    
            return this.resolveTagsForMangas(mangas);
          })
        );
      }
    
     
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
