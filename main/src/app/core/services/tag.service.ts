import { inject, Injectable } from '@angular/core';
import { from, map, Observable, switchMap } from 'rxjs';
import { Tag } from '../interfaces/tag.interface';
import { DatabaseService } from './database.service';
import { MangaService } from './manga.service';

@Injectable({ providedIn: 'root' })
export class TagService {
    private database = inject(DatabaseService);
    private mangaService = inject(MangaService);

    /**
     * Retrieves a tag by its ID.
     *
     * @param id The unique tag identifier
     * @returns Observable emitting the tag or `undefined` if not found
     */
    getTagById(id: number): Observable<Tag | undefined> {
        return from(this.database.tags.get(id));
    }

    /**
     * Retrieves all existing tags.
     *
     * @returns Observable emitting the list of all tags
     */
    getAllTags(): Observable<Tag[]> {
        return from(this.database.tags.toArray());
    }

    /**
     * Adds a new tag to the database.
     *
     * @param tag The tag entity to insert
     * @returns Observable emitting the new tag's ID
     */
    addTag(tag: Tag): Observable<number> {
        const entity: Tag = {
            ...tag,
            name: tag.name.trim(),
            color: tag.color,
        };
        return from(this.database.tags.add(entity));
    }

    /**
     * Updates an existing tag.
     *
     * @param id The tag ID to update
     * @param changes Partial changes to apply
     * @returns Observable emitting the number of modified entries (0 or 1)
     */
    updateTag(id: number, changes: Partial<Tag>): Observable<number> {
        return from(this.database.tags.update(id, changes));
    }

    /**
     * Deletes a tag and removes it from all mangas that reference it.
     *
     * @param id The tag ID to delete
     * @returns Observable emitting `void` when the operation completes
     */
    deleteTag(id: number): Observable<void> {
        return this.mangaService.removeTagFromAllMangas(id).pipe(
            switchMap(() => from(this.database.tags.delete(id))),
            map(() => { })
        );
    }
}