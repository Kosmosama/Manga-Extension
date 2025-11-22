import { Manga } from "./manga.interface";
import { Tag } from "./tag.interface";

export interface RawExport {
    version: number;
    mangas: Omit<Manga, 'id' | 'resolvedTags'>[];
    tags: Omit<Tag, 'id'>[];
}

export interface ImportCollision {
    title: string;
    incoming: Omit<Manga, 'id' | 'resolvedTags'>;
    existing: Manga;
    decision?: 'merge' | 'skip';
}

export interface ImportResult {
    imported: number;
    skipped: number;
    collisions: ImportCollision[];
    errors: string[];
}