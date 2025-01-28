import { IManga } from "../manga";

export interface IMangaRepository {
    save(manga: IManga): Promise<IManga>;
    update(manga: IManga): Promise<IManga>;
    delete(id: number): Promise<boolean>;
    getAll(): Promise<IManga[]>;
    addTag(mangaId: number, tagId: number): Promise<IManga>;
    findByTag(tagId: number): Promise<IManga[] | null>;
    findByName(name: string): Promise<IManga[] | null>;
    findFavorites(): Promise<IManga[] | null>;
}
