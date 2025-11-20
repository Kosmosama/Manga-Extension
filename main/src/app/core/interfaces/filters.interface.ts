export type OrderMethod = 'asc' | 'desc';
export type SortMethod = 'isFavorite' | 'title' | 'updatedAt' | 'createdAt' | 'chapters' | 'type' | 'state';

export interface Range<T> {
    min: T;
    max: T;
}

export type TagIncludeMode = 'AND' | 'OR';

export interface MangaFilters {
    includeTagsMode?: TagIncludeMode;
    search?: string;
    includeTags?: number[];
    excludeTags?: number[];
    chapterRange?: Range<number>;
    lastSeenRange?: Range<Date>;
    addedRange?: Range<Date>;
    sortBy?: SortMethod;
    order?: OrderMethod;
    random?: boolean;
    limit?: number;
}