import { inject, Injectable } from '@angular/core';
import { PromiseExtended } from 'dexie';
import { from, Observable } from 'rxjs';
import { MangaService } from '../../manga/services/manga.service';
import { Tag } from '../../shared/interfaces/tag.interface';
import { DatabaseService } from '../../shared/services/database.service';

@Injectable({
    providedIn: 'root'
})
export class TagService {
    private database = inject(DatabaseService);
    private mangaService = inject(MangaService);

    /**
     * Retrieves a tag by its ID.
     * 
     * @param {number} id - The unique identifier of the tag.
     * @returns {Observable<Tag | undefined>} An observable containing the tag or undefined if not found.
     */
    getTagById(id: number): Observable<Tag | undefined> {
        return from(this.database.tags.get(id));
    }

    /**
     * Retrieves all tags from the database.
     * @returns {Observable<Tag[]>} An observable containing an array of tags.
     */
    getAllTags(): Observable<Tag[]> {
        return from(this.database.tags.toArray());
    }

    /**
     * Adds a new tag to the database.
     * 
     * @param {Tag} tag - The tag object to be added.
     * @returns {Observable<number>} An observable containing the ID of the newly added tag.
     */
    addTag(tag: Tag): Observable<number> {
        return from(this.database.tags.add(tag));
    }

    /**
     * Updates an existing tag in the database.
     * 
     * @param {number} id - The unique identifier of the tag to update.
     * @param {Partial<Tag>} changes - An object containing the fields to update.
     * @returns {Observable<number>} An observable containing the number of updated records (0 if no changes were made, 1 if successful).
     */
    updateTag(id: number, changes: Partial<Tag>): Observable<number> {
        return from(this.database.tags.update(id, changes));
    }

    /**
     * Deletes a tag from the database.
     * Also removes the tag from all associated mangas before deletion.
     * 
     * @param {number} id - The unique identifier of the tag to delete.
     * @returns {Observable<void>} An observable that completes when the deletion is done.
     */
    deleteTag(id: number): Observable<void> {
        return from(
            this.database.transaction('rw', this.database.mangas, this.database.tags, async () => {
                await this.mangaService.removeTagFromAllMangas(id);
    
                await this.database.tags.delete(id);
            })
        );
    }
}
