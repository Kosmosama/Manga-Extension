import { Tag } from "./tag.interface";

// Enum for Manga Types
export enum MangaType {
    Manga = "manga",
    Manhwa = "manhwa",
    Manhua = "manhua",
    Webcomic = "webcomic",
    Novel = "novel",
    Book = "book",
    OneShot = "one-shot",
    Doujinshi = "doujinshi",
    Other = "other"
}

// Enum for Manga States
export enum MangaState {
    Reading = "reading",
    Completed = "completed",
    OnHold = "on-hold",
    Dropped = "dropped",
    PlanToRead = "plan-to-read",
    None = "none"
}

// Manga Interface
export interface Manga {
    readonly id: number;
    title: string;
    updatedAt: Date;
    createdAt: Date;
    link?: string;
    image?: string;
    chapters: number;
    isFavorite?: boolean;
    type?: MangaType;
    state?: MangaState;
    tags?: number[];
    resolvedTags?: Tag[];
}

// Manga Creation Interface
export type NewManga = Omit<Manga, 'id'>;
