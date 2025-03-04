import { Injectable } from '@angular/core';
import Dexie, { Table, Transaction } from 'dexie';
import { Manga } from '../interfaces/manga.interface';
import { Tag } from '../interfaces/tag.interface';

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
    
        this.on("populate", async (transaction: Transaction) => {
            console.log("Database is being populated for the first time.");

            // Retrieve mangaList from chrome.storage.local
            chrome.storage.local.get("mangaList", async (result) => {
                const storedMangas: any[] = result["mangaList"] || [];

                if (storedMangas.length > 0) {
                    const formattedMangas: Manga[] = storedMangas.map(manga => ({
                        id: Number(`${Date.now()}${Math.floor(Math.random() * 10000)}`),
                        title: manga.title,
                        link: manga.link,
                        image: manga.image,
                        chapters: manga.readChapters || 0,
                        isFavorite: manga.favorite || false,
                        createdAt: manga.dayAdded ? new Date(manga.dayAdded).toISOString() : new Date().toISOString(),
                        updatedAt: manga.lastRead ? new Date(manga.lastRead).toISOString() : new Date().toISOString()
                    }));

                    try {
                        await transaction.table("mangas").bulkAdd(formattedMangas);
                        console.log("Manga data migrated to IndexedDB.");

                        // Remove mangaList from chrome.storage.local after migration
                        chrome.storage.local.remove("mangaList", () => {
                            console.log("Old manga data removed from chrome.storage.local.");
                        });
                    } catch (err) {
                        console.error("Error populating mangas:", err);
                    }
                }
            });
        });

        this.open().catch(err => {
            console.error("Failed to open database:", err);
        });
    }
}
