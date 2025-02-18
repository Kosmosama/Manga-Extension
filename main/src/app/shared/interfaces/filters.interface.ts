export type OrderMethod = 'asc' | 'desc';
export type SortMethod = 'isFavorite' | 'title' | 'updatedAt' | 'createdAt' | 'chapters' | 'type' | 'state';
export type RangeCriteriaType = number | Date;

export interface Range<T> {
    min: T;
    max: T;
}

export interface MangaFilters {
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