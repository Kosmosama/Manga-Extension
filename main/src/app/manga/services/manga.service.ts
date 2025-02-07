import { inject, Injectable } from '@angular/core';
import { Manga, NewManga } from '../../shared/interfaces/manga.interface';
import { from, Observable } from 'rxjs';
import { DatabaseService } from '../../shared/services/database.service';
import { PromiseExtended } from 'dexie';

@Injectable({
    providedIn: 'root'
})
export class MangaService {
    private database = inject(DatabaseService);
    
    // #TODO Make a separate function to get all mangas and their full item of tags

    /**
     * Retrieves all mangas from the database.
     * 
     * @returns {Observable<Manga>} An observable of an array of mangas.
     */
    getAllMangas(): Observable<Manga[]> {
        return from(this.database.mangas.toArray() as PromiseExtended<Manga[]>);
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
     * @param manga - The manga to add.
     * 
     * @returns An observable of the ID of the added manga.
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
