import { DataSource } from 'typeorm';
import { MangaEntity } from '../models/manga.entity';
import { TagEntity } from '../models/tag.entity';

export const AppDataSource = new DataSource({
    type: 'sqljs',
    location: 'database',
    autoSave: true,
    entities: [MangaEntity, TagEntity],
    synchronize: true,
    logging: true,
});

export const initializeDatabase = async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
};
