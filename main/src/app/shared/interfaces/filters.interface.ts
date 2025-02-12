import { OrderMethod, SortMangaMethods } from "./sort.interface";

export enum FilterTypes {
    TAG = 'tag',
    DATE_RANGE = 'dateRange',
    CHAPTER_RANGE = 'chapterRange',
    NONE = 'none'
}

export interface BaseFilter {
    type: FilterTypes;
}

export interface TagFilter extends BaseFilter {
    type: FilterTypes.TAG;
    tagId: number;
}

export interface DateRangeFilter extends BaseFilter {
    type: FilterTypes.DATE_RANGE;
    lowerDate: Date;
    upperDate: Date;
    dateType: 'createdAt' | 'updatedAt';
    sortMethod: SortMangaMethods;
    orderMethod: OrderMethod;
}

export interface ChapterRangeFilter extends BaseFilter {
    type: FilterTypes.CHAPTER_RANGE;
    lowerCap: number;
    upperCap: number;
}

export interface NoFilter extends BaseFilter {
    type: FilterTypes.NONE;
}

export type Filters = TagFilter | DateRangeFilter | ChapterRangeFilter | NoFilter;