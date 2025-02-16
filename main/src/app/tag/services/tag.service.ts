import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '../../shared/services/database.service';
import { from, Observable } from 'rxjs';
import { NewTag, Tag } from '../../shared/interfaces/tag.interface';
import { PromiseExtended } from 'dexie';

@Injectable({
    providedIn: 'root'
})
export class TagService {
    private database = inject(DatabaseService);

    getAllTags(): Observable<Tag[]> {
        return from(this.database.tags.toArray() as PromiseExtended<Tag[]>);
    }

    getTagById(id: number): Observable<Tag | undefined> {
        return from(this.database.tags.get(id) as Promise<Tag | undefined>);
    }

    addTag(tag: Tag): Observable<number> {
        return from(this.database.tags.add(tag));
    }

    updateTag(id: number, changes: Partial<Tag>): Observable<number> {
        return from(this.database.tags.update(id, changes));
    }

    deleteTag(id: number): Observable<void> {
        return from(this.database.tags.delete(id));
    }
}
