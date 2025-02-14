export interface MangaFilters {
    search?: string;
    includeTags?: number[];
    excludeTags?: number[];
    chapterRange?: { min: number; max: number };
    updatedAt?: { start: Date; end: Date };
    addedRange?: { start: Date; end: Date };
    sortBy?: 'isFavorite' | 'updatedAt' | 'createdAt' | 'chapters' | 'title';
    order?: 'asc' | 'desc';
  }
  