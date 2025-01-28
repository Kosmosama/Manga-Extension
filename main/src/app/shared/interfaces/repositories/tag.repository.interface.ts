import { ITag } from "../tag.interface";

export interface ITagRepository {
    save(tag: ITag): Promise<ITag>;
    update(tag: ITag): Promise<ITag>;
    delete(id: number): Promise<boolean>;
    findByName(name: string): Promise<ITag[] | null>;
    getAll(): Promise<ITag[]>;
}