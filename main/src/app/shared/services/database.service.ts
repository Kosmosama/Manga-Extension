import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Manga, NewManga } from '../interfaces/manga.interface';
import { NewTag, Tag } from '../interfaces/tag.interface';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService extends Dexie {
    mangas!: Table<Manga, number>;
    tags!: Table<Tag, number>;
    constructor() {
        super('mangadb');

        this.version(1).stores({
            mangas: '++id, &title, updatedAt, createdAt, link, image, chapters, isFavorite, type, state, *tags',
            tags: '++id, name, color'
        });

        this.on('populate', () => this.populate());
    }
    populate(){
        console.log('Tf is a signal')
    }
}
