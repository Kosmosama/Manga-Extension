import { Tag } from './tag.interface';

/**
 * Enum for Manga Types
 */
export enum MangaType {
    Manga = 'manga',
    Manhwa = 'manhwa',
    Manhua = 'manhua',
    Webcomic = 'webcomic',
    Novel = 'novel',
    Book = 'book',
    OneShot = 'one-shot',
    Doujinshi = 'doujinshi',
    Other = 'other',
}

/**
 * Enum for Manga States
 */
export enum MangaState {
    Reading = 'reading',
    Completed = 'completed',
    OnHold = 'on-hold',
    Dropped = 'dropped',
    PlanToRead = 'plan-to-read',
    None = 'none',
}

/**
 * Manga entity.
 */
export interface Manga {
    readonly id: number;
    title: string;

    updatedAt: string; // ISO-8601
    createdAt: string; // ISO-8601

    link?: string;
    image?: string; // URL or base64 data URL

    chapters: number;
    isFavorite: boolean;

    type?: MangaType;
    state?: MangaState;

    tags?: number[];      // tag ids
    resolvedTags?: Tag[]; // optional, hydration
}