import Dexie, { Table } from 'dexie';
import { NewManga } from '../interfaces/manga.interface';
import { Tag, NewTag } from '../interfaces/tag.interface';

export class AppDB extends Dexie {
    mangas!: Table<NewManga, number>;
    tags!: Table<Tag, number>;

    constructor() {
        super('ngdexiedb');

        this.version(1).stores({
            mangas: '++id, &title, updatedAt, createdAt, link, image, chapters, isFavorite, type, state, *tags',
            tags: '++id, name, color'
        });

        // this.on('populate', () => this.populate());
    }

    /** 
     * Note: Here we should migrate the localstorage things of user
     */
    // async populate() {
    //     const now = new Date();

    //     const newTags: NewTag[] = [
    //         { name: 'Acción', color: '#FF0000' },
    //         { name: 'Drama', color: '#00FF00' },
    //         { name: 'Comedia', color: '#0000FF' }
    //     ];

    //     const tagIds = await this.tags.bulkAdd(
    //         newTags as Tag[],
    //         undefined,
    //         { allKeys: true }
    //     );

    //     await this.mangas.add({
    //         title: 'Mi primer Manga',
    //         updated_at: now,
    //         created_at: now,
    //         link: 'https://example.com/manga/1',
    //         image: 'https://example.com/manga/1.jpg',
    //         chapters: 100,
    //         type: 'manga',
    //         state: 'reading',
    //         isFavorite: true,
    //         tags: [tagIds]
    //     });
    // }
}

export const db = new AppDB();