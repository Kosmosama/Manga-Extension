import { IManga } from "../manga.interface";

export interface IMangaService {
    save(manga: IManga): Promise<IManga>;
    update(manga: IManga): Promise<IManga>;
    delete(id: number): Promise<boolean>;
    getAll(): Promise<IManga[]>;
    addTag(mangaId: number, tagId: number): Promise<IManga>;
    findByTag(tagId: number): Promise<IManga[] | null>;
    findByName(name: string): Promise<IManga[] | null>;
    findFavorites(): Promise<IManga[] | null>;
    findByType(type: string): Promise<IManga[] | null>;
    findByState(state: string): Promise<IManga[] | null>;
}
