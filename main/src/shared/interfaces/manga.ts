import { ITag } from "./tag";

export interface IManga {
    id: number;
    title: string;
    updated_at: Date;
    created_at: Date;
    link?: string;
    image?: string;
    chapters?: number;
    isFavorite?: boolean;
    tags?: number[];
}