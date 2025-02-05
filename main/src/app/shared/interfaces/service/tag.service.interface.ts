import { ITag } from "../tag.interface";

export interface ITagService {
    save(tag: ITag): Promise<void>;
    update(tag: ITag): Promise<void>;
    delete(id: number): Promise<void>;
    findByName(name: string): Promise<ITag[] | null>;
    getAll(): Promise<ITag[]>;
}