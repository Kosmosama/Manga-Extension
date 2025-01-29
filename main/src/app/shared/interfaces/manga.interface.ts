import { ITag } from "./tag.interface";

export interface IManga {
    id: number;
    title: string;
    updated_at: Date;
    created_at: Date;
    link?: string;
    image?: string;
    chapters?: number;
    isFavorite?: boolean;
    type?: MangaType;
    state?: MangaState
    tags?: number[];
}

export type MangaType = "manga" | "manhwa" | "manhua" | "webcomic" | "novel" | "book" | "one-shot" | "doujinshi" | "other";
export type MangaState = "reading" | "completed" | "on-hold" | "dropped" | "plan-to-read" | "none";