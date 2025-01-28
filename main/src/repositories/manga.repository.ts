import { Injectable, Inject } from "@angular/core";
import { Repository } from "typeorm";
import { MangaEntity } from "../shared/models/manga.entity";
import { IMangaRepository } from "../shared/interfaces/repositories/manga.repository.interface";
import { IManga } from "../shared/interfaces/manga";


@Injectable()
export class MangaRepository implements IMangaRepository{
    private repository: Repository<MangaEntity>

    constructor(@Inject('DATABASE_CONNECTION') private readonly databaseConnection: any){
        this.repository = this.databaseConnection.getRepository(MangaEntity);
    }
    async save(manga: IManga): Promise<IManga> {
        return await this.repository.save(manga);
    }

    async update(manga: IManga): Promise<IManga> {
        return await this.repository.save(manga);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }

    async getAll(): Promise<IManga[]> {
        return await this.repository.find();
    }

    async addTag(mangaId: number, tagId: number): Promise<IManga> {
        const manga = await this.repository.findOne({ where: { id: mangaId}});
        if (!manga) throw new Error('Manga not found');
        manga.tags?.push(tagId);
        return await this.repository.save(manga);
    }

    async findByTag(tagId: number): Promise<IManga[] | null> {
        return await this.repository.createQueryBuilder('manga')
            .leftJoinAndSelect('manga.tags', 'tag')
            .where('tag.id = :tagId', { tagId })
            .getMany();
    }

    async findByName(name: string): Promise<IManga[] | null> {
        return await this.repository.find({ where: { title: name } });
    }

    async findFavorites(): Promise<IManga[] | null> {
        return await this.repository.find({ where: { isFavorite: true } });
    }

}