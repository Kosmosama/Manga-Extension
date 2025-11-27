import { Injectable, inject } from '@angular/core';
import { MangaService } from './manga.service';
import { Observable, defer } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class QuickCaptureMangaService {
    private mangaService = inject(MangaService);

    quickAdd$(meta: { title: string; link?: string; image?: string }): Observable<number> {
        const cleanTitle = meta.title.trim() || 'Untitled';
        return defer(() => this.mangaService.addMangaMinimal({
            title: cleanTitle,
            link: meta.link,
            image: meta.image,
            tags: [],
            chapters: 0
        })).pipe(map(id => id));
    }
}