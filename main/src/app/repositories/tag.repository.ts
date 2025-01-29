import { Injectable, Inject } from "@angular/core";
import { Repository } from "typeorm";
import { ITagRepository } from "../shared/interfaces/repositories/tag.repository.interface";
import { ITag } from "../shared/interfaces/tag.interface";
import { TagEntity } from "../shared/models/tag.entity";

@Injectable()
export class TagRepository implements ITagRepository {
    private repository: Repository<TagEntity>;

    constructor(@Inject('DATABASE_CONNECTION') private readonly databaseConnection: any) {
        this.repository = this.databaseConnection.getRepository(TagEntity);
    }

    async save(tag: ITag): Promise<ITag> {
        return await this.repository.save(tag);
    }

    async update(tag: ITag): Promise<ITag> {
        const existingTag = await this.repository.findOne({ where: { id: tag.id } });
        if (!existingTag) {
            throw new Error('Tag not found');
        }
        return await this.repository.save(tag);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }

    async findByName(name: string): Promise<ITag[] | null> {
        return await this.repository.find({ where: { name } });
    }

    async getAll(): Promise<ITag[]> {
        return await this.repository.find();
    }
}