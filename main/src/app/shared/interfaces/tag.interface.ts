export interface ITag {
    id: number;
    name: string;
    color?: string;
}

export type NewTag = Omit<ITag, 'id'>;
