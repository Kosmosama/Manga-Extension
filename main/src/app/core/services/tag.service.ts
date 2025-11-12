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
     */
    getTagById(id: number): Observable<Tag | undefined> {
        return from(this.database.tags.get(id));
    }

    /**
     * Retrieves all tags.
     */
    getAllTags(): Observable<Tag[]> {
        return from(this.database.tags.toArray());
    }

    /**
     * Adds a new tag.
     */
    addTag(tag: Tag): Observable<number> {
        const nowIso = new Date().toISOString();
        const entity: Tag = {
            ...tag,
            name: tag.name,
            color: tag.color,
        };
        return from(this.database.tags.add(entity));
    }

    /**
     * Updates an existing tag.
     */
    updateTag(id: number, changes: Partial<Tag>): Observable<number> {
        return from(this.database.tags.update(id, changes));
    }

    /**
     * Deletes a tag and removes it from all mangas (observable-based sequencing).
     * Using observable chaining avoids mixing Promise and Observable at the public API boundary.
     */
    deleteTag(id: number): Observable<void> {
        return this.mangaService.removeTagFromAllMangas(id).pipe(
            switchMap(() => from(this.database.tags.delete(id))),
            map(() => { })
        );
    }
}