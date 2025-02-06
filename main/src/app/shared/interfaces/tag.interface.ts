// Tag Interface
export interface Tag {
    readonly id: number;
    name: string;
    color?: string;
}

// Tag Creation Interface
export type NewTag = Omit<Tag, 'id'>;
